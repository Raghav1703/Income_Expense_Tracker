import React, { useState } from "react";

const AddTransaction = ({ onAdd }) => {
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Salary");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const categories = ["Salary", "Food", "Travel", "Shopping", "Bills", "Others"];

  const handleSubmit = async (e) => {
  e.preventDefault();
  let finalCategory = category === "Others" ? customCategory : category;

  if (category !== "Others" && !finalCategory) {
  alert("Please select a category!");
  return;
  }

  const transaction = {
    type,
    amount,
    category: finalCategory,
    description,
    date,
  };

  // 🔥 Add transaction via backend (AI enabled)
  const result = await onAdd(transaction);

  // 🎯 If the backend returned AI suggestions (non-breaking)
  if (result?.ai_category) {
    alert(`AI Suggested Category: ${result.ai_category}`);
  }

  if (result?.anomaly) {
    alert("Unusually high spending detected!");
  }

  // Reset form
  setAmount("");
  setDescription("");
  setCustomCategory("");
  setDate("");
};


  return (
    <div className="add-transaction-container">
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          type="number"
          placeholder="Amount ₹"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        {category === "Others" && (
          <input
            type="text"
            placeholder="Enter custom category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit" className="btn-submit">
          Add
        </button>
      </form>
    </div>
  );
};

export default AddTransaction;
