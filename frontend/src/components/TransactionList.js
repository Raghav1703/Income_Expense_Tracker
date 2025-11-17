import React from "react";

const TransactionList = ({ transactions, onDelete }) => {
  return (
    <div className="transaction-list">
      <h2>All Transactions</h2>

      {/* Scroll Container Added */}
      <div className="transaction-list-scroll">
        {transactions.length > 0 ? (
          <ul>
            {transactions.map((t) => (
              <li key={t.id}>
                <div className="transaction-info">
                  <strong>
                    {t.category} — ₹{t.amount} ({t.type})
                  </strong>
                  <small className="transaction-date">
                    📅 {t.date ? new Date(t.date).toLocaleDateString() : "N/A"}
                  </small>
                  {t.description && <p>{t.description}</p>}
                </div>
                <button onClick={() => onDelete(t.id)}>Delete</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No transactions yet.</p>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
