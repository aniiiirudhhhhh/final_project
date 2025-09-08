import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { ArrowLeft, DollarSign, Gift, RefreshCcw, TrendingUp } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-black font-semibold  transition mb-6"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Customers
      </button>

      {/* Header */}
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 text-center text-white">
        <h1 className="text-3xl font-bold tracking-wide">
          {customer?.name || "Customer"}'s Transactions
        </h1>
        <p className="text-sm opacity-80 mt-2">
          A detailed history of purchases, earned & redeemed points.
        </p>
      </div>

      {/* Loader & Errors */}
      {loading && <p className="text-center text-white">Loading...</p>}
      {error && <p className="text-center text-red-200 font-semibold">{error}</p>}
      {transactions.length === 0 && !loading && (
        <p className="text-center text-white opacity-80">No transactions found.</p>
      )}

      {/* Transactions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {transactions.map((t) => (
          <div
            key={t._id}
            className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6 text-white hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 font-semibold text-lg">
                <DollarSign className="w-5 h-5 text-green-300" />
                ${t.amount}
              </span>
              <span className="text-xs opacity-80">
                {new Date(t.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="mb-2">
              <strong className="text-yellow-300">Category:</strong> {t.category}
            </p>
            <p className="mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <strong>Earned:</strong> {t.earnedPoints}
            </p>
            <p className="mb-2 flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-red-300" />
              <strong>Redeemed:</strong> {t.redeemedPoints}
            </p>
            <p className="mb-2 flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-300" />
              <strong>Final Balance:</strong> {t.finalPoints}
            </p>

            <p className="text-xs opacity-60 mt-3 text-right">
              {new Date(t.createdAt).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransHistory;
