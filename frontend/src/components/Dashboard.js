import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import api from "../services/api";


const Dashboard = ({ transactions, onAdd }) => {
  const [timeFilter, setTimeFilter] = useState("month");
  const [budget, setBudget] = useState(30000);
  const [salary, setSalary] = useState(
    parseFloat(localStorage.getItem("monthlySalary")) || 0
  );
  const [nextSalaryDate, setNextSalaryDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [insights, setInsights] = useState([]);
  const [aiSummary, setAISummary] = useState("");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);


  // ✅ Filter Transactions
  useEffect(() => {
    filterTransactions(timeFilter);
    loadAISummary();
  }, [timeFilter, transactions]);

  const filterTransactions = (filter) => {
    const now = new Date();
    let filtered = [];

    if (filter === "week") {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = transactions.filter((t) => new Date(t.date) >= weekAgo);
    } else if (filter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = transactions.filter((t) => new Date(t.date) >= monthAgo);
    } else {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      filtered = transactions.filter((t) => new Date(t.date) >= yearAgo);
    }

    setFilteredData(filtered);
    calculateSummary(filtered);
    generateInsights(filtered);
  };
  const loadAISummary = async () => {
  try {
    const data = await api.getAIInsights();
    setAISummary(data.summary);
  } catch (err) {
    console.error("AI summary error:", err);
  }
  };
  const handleAISearch = async () => {
  if (!query.trim()) return;
  try {
    const results = await api.semanticSearch(query);
    setSearchResults(results);
  } catch (err) {
    console.error("AI search error:", err);
  }
  };


  // ✅ Summary (Income, Expense, Balance)
  const calculateSummary = (data) => {
    const income = data
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const expense = data
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    setSummary({ income, expense, balance: income - expense });
  };

  // ✅ Budget Progress
  const budgetProgress = Math.min((summary.expense / budget) * 100, 100);
  const progressColor =
    budgetProgress < 70
      ? "#16a34a"
      : budgetProgress < 100
      ? "#facc15"
      : "#dc2626";

  // ✅ Salary Integration
  const handleSalarySave = () => {
    if (salary <= 0) {
      alert("Please enter a valid salary");
      return;
    }
    localStorage.setItem("monthlySalary", salary.toString());
    const now = new Date();
    const lastSalaryDate = localStorage.getItem("lastSalaryDate");
    if (!lastSalaryDate || new Date(lastSalaryDate).getMonth() !== now.getMonth()) {
      const salaryTransaction = {
        type: "income",
        amount: salary,
        category: "Salary",
        description: "Auto-added monthly salary",
        date: now.toISOString().split("T")[0],
      };
      onAdd(salaryTransaction);
      localStorage.setItem("lastSalaryDate", now.toISOString());
    }
    calculateNextSalaryDate();
  };

  const calculateNextSalaryDate = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setNextSalaryDate(nextMonth.toDateString());
  };

  // ✅ Insights
  const generateInsights = (data) => {
    if (data.length === 0) {
      setInsights(["No transactions yet. Add some to get insights!"]);
      return;
    }

    const totalIncome = data
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpense = data
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const savingRate = totalIncome
      ? ((totalIncome - totalExpense) / totalIncome) * 100
      : 0;

    let tips = [];
    if (savingRate < 10)
      tips.push("⚠️ Try cutting down non-essential spending to improve savings.");
    else if (savingRate > 30)
      tips.push("✅ Excellent! You're saving a healthy portion of your income.");
    else
      tips.push("💡 Balanced spending! Keep maintaining this rhythm.");

    setInsights(tips);
  };

  // ✅ Export CSV
  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert("No data to export.");
      return;
    }

    const header = "Date,Type,Category,Description,Amount\n";
    const rows = filteredData.map(
      (t) =>
        `${t.date},${t.type},${t.category},${t.description || "-"},${t.amount}`
    );
    const blob = new Blob([header + rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${timeFilter}.csv`;
    link.click();
  };

  // ✅ Export PDF (fixed)
  const exportToPDF = () => {
    try {
      if (filteredData.length === 0) {
        alert("No data to export.");
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("BudgetWise AI - Financial Report", 14, 20);

      doc.setFontSize(12);
      doc.text(`Filter: ${timeFilter.toUpperCase()}`, 14, 30);
      doc.text(`Income: ₹${summary.income}`, 14, 38);
      doc.text(`Expense: ₹${summary.expense}`, 14, 46);
      doc.text(`Balance: ₹${summary.balance}`, 14, 54);

      const tableData = filteredData.map((t) => [
        t.date,
        t.type,
        t.category,
        t.description || "-",
        `₹${t.amount}`,
      ]);

      doc.autoTable({
        startY: 60,
        head: [["Date", "Type", "Category", "Description", "Amount"]],
        body: tableData,
      });

      doc.save(`BudgetWise_Report_${timeFilter}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert("Something went wrong while generating the PDF.");
    }
  };

  return (
    <motion.div
      className="dashboard-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Dashboard</h2>

      {/* Salary Section */}
      <div className="salary-section">
        <h3>Monthly Salary Integration</h3>
        <div className="salary-controls">
          <input
            type="number"
            value={salary}
            placeholder="Enter monthly salary ₹"
            onChange={(e) => setSalary(parseFloat(e.target.value))}
          />
          <button onClick={handleSalarySave}>Save</button>
        </div>
        {salary > 0 && (
          <p>
            Auto salary of ₹{salary.toFixed(2)} credited monthly<br />
            Next credit date: <strong>{nextSalaryDate}</strong>
          </p>
        )}
      </div>

      {/* Budget Section */}
      <div className="budget-section">
        <h3>Budget Progress</h3>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${budgetProgress}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
        <p>
          Spent ₹{summary.expense.toFixed(2)} of ₹{budget.toFixed(2)}
        </p>
      </div>

      {/* Filters */}
      <div className="filter-buttons">
        <button onClick={() => setTimeFilter("week")}>This Week</button>
        <button onClick={() => setTimeFilter("month")}>This Month</button>
        <button onClick={() => setTimeFilter("year")}>This Year</button>
      </div>

      {/* Summary */}
      <div className="summary-cards">
        <div className="card income-card">
          <h3>Income</h3>
          <p>₹{summary.income.toFixed(2)}</p>
        </div>
        <div className="card expense-card">
          <h3>Expense</h3>
          <p>₹{summary.expense.toFixed(2)}</p>
        </div>
        <div className="card balance-card">
          <h3>Balance</h3>
          <p>₹{summary.balance.toFixed(2)}</p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="ai-insights">
        <h3>AI Summary</h3>
          <p>{aiSummary || "Loading AI insights..."}</p>
      </div>


      {/* Insights */}
      <div className="insights-section">
        <h3>Insights</h3>
        <ul>
          {insights.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Export */}
      <div className="export-section">
        <h3>Export Your Data</h3>
        <div className="export-buttons">
          <button onClick={exportToCSV}>Export CSV</button>
          <button onClick={exportToPDF}>Export PDF</button>
        </div>
      </div>
      {/* 🔍 AI Semantic Search */}
      <div className="ai-search-box">
        <h3>Ask AI About Your Spending</h3>
        <input
          type="text"
          placeholder="e.g., food expenses last month"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleAISearch}>Search</button>

        {searchResults.length > 0 && (
          <ul className="ai-search-results">
            {searchResults.map((t) => (
              <li key={t.id}>
                {t.date} — {t.description} — ₹{t.amount} — {t.category}
              </li>
            ))}
          </ul>
        )}
      </div>


      {/* Chart */}
      <div className="chart-section">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default Dashboard;
