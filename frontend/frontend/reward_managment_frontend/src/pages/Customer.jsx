import React, { useState, useEffect } from "react";
import api from "../api";

const Customer = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [redeemPoints, setRedeemPoints] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(0);

  // ✅ Get logged-in user and token
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const adminId = user?.adminId; // comes from registration

  // ✅ Fetch history
  const fetchHistory = async () => {
    try {
      const res = await api.get("/transactions/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBalance(res.data.currentBalance || 0);
      const data = Array.isArray(res.data.transactions)
        ? res.data.transactions
        : [];
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Could not fetch transactions");
    }
  };

  // ✅ Add transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      if (!adminId) {
        setError("Admin ID not found. Please re-login.");
        return;
      }

      await api.post(
        "/transactions",
        {
          amount: Number(amount),
          category,
          redeemPoints: redeemPoints ? Number(redeemPoints) : 0,
          adminId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAmount("");
      setCategory("");
      setRedeemPoints("");
      fetchHistory();
    } catch (err) {
      console.error("Error adding transaction:", err.response?.data || err);
      setError(err.response?.data?.message || "Transaction failed");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Rewards Dashboard</h1>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-semibold"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex justify-center items-start p-6">
        <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-8">
          {/* Balance */}
          <div className="mb-6 p-5 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
            <p className="text-2xl font-bold text-indigo-700">
              Current Points Balance
            </p>
            <p className="text-4xl font-extrabold text-indigo-900 mt-2">
              {balance}
            </p>
          </div>

          {/* Transaction Form */}
          <form
            onSubmit={handleAddTransaction}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
          >
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
              required
            />
            <input
              type="number"
              placeholder="Redeem Points (optional)"
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(e.target.value)}
              className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
            />
            <div className="md:col-span-3">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md"
              >
                Add Transaction
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <p className="text-red-600 mb-6 text-center font-semibold">
              {error}
            </p>
          )}

          {/* Transaction History */}
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">
            Transaction History
          </h2>
          {transactions.length === 0 ? (
            <p className="text-gray-600 text-center">No transactions yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className="border rounded-xl p-5 shadow-md bg-gradient-to-r from-indigo-50 to-blue-50 hover:shadow-xl transition"
                >
                  <p className="text-lg font-semibold text-gray-800">
                    Amount:{" "}
                    <span className="text-indigo-600">${t.amount}</span>
                  </p>
                  <p className="text-gray-700">
                    <strong>Category:</strong> {t.category}
                  </p>
                  <p className="text-green-600 font-semibold">
                    + Earned: {t.earnedPoints}
                  </p>
                  <p className="text-red-600 font-semibold">
                    - Redeemed: {t.redeemedPoints}
                  </p>
                  <p className="text-blue-700 font-bold">
                    Final Balance: {t.finalPoints}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customer;
