import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

const TransHistory = () => {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/transactions/customer/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomer(res.data.customer);
        setTransactions(res.data.transactions);
        setError("");
      } catch (err) {
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [customerId, token]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        className="mb-4 text-blue-600 underline"
        onClick={() => navigate(-1)}
      >
        &larr; Back to Customers
      </button>
      <h1 className="text-2xl font-bold mb-4">
        Transactions for {customer?.name || "Customer"}
      </h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {transactions.length === 0 && !loading && <p>No transactions found.</p>}

      <ul className="space-y-4">
        {transactions.map((t) => (
          <li key={t._id} className="border p-4 rounded shadow bg-white">
            <p><strong>Amount:</strong> ${t.amount}</p>
            <p><strong>Category:</strong> {t.category}</p>
            <p><strong>Earned Points:</strong> {t.earnedPoints}</p>
            <p><strong>Redeemed Points:</strong> {t.redeemedPoints}</p>
            <p><strong>Final Balance:</strong> {t.finalPoints}</p>
            <p className="text-xs text-gray-500 mt-2">{new Date(t.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransHistory;
