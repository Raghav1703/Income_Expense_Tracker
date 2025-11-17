import React, { useState, useEffect } from "react";
import AddTransaction from "./components/AddTransaction";
import TransactionList from "./components/TransactionList";
import Dashboard from "./components/Dashboard";
import api from "./services/api";
import "./index.css";

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // ✅ Apply theme to document body
  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ✅ Fetch transactions
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Unable to fetch transactions. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Add new transaction
  const addTransaction = async (transaction) => {
  try {
    const newTransaction = await api.addTransaction(transaction);
    setTransactions((prev) => [...prev, newTransaction]);

    // 🔥 RETURN IT so AddTransaction.js can read ai_category, anomaly
    return newTransaction;

  } catch (err) {
    console.error("Error adding transaction:", err);
    alert("Failed to add transaction. Please check your input.");
    return null;  // return something to avoid undefined issues
  }
};


  // ✅ Delete transaction
  const deleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting transaction:", err);
      alert("Unable to delete transaction at this time.");
    }
  };

  // ✅ Toggle Theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">💰 BudgetWise AI</h1>
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </header>

      {isLoading ? (
        <p className="loading-text">Loading your transactions...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : (
        <>
          {/* Add Transaction */}
          <section className="section-card">
            <AddTransaction onAdd={addTransaction} />
          </section>

          {/* Transaction List */}
          <section className="section-card">
            <TransactionList
              transactions={transactions}
              onDelete={deleteTransaction}
            />
          </section>

          {/* Dashboard */}
          <section className="section-card">
            <Dashboard
              transactions={transactions}
              onAdd={addTransaction}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default App;
