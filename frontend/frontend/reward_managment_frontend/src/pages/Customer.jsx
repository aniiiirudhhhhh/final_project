import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const POINTS_EXPIRY_WARNING_DAYS = 30;

const Customer = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [redeemPoints, setRedeemPoints] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(0);
  const [pointsBreakdown, setPointsBreakdown] = useState(null);
  const [tier, setTier] = useState(null);
  const [expiringPoints, setExpiringPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const adminId = user?.adminId;

  const calculateExpiringPoints = (pointsHistory) => {
    if (!pointsHistory) return 0;
    const now = new Date();
    return pointsHistory
      .filter(
        (p) =>
          !p.redeemed &&
          new Date(p.expiresAt) > now &&
          (new Date(p.expiresAt) - now) / (1000 * 60 * 60 * 24) <= POINTS_EXPIRY_WARNING_DAYS
      )
      .reduce((sum, p) => sum + p.points, 0);
  };

  const fetchProfileAndRecentTransactions = async () => {
    try {
      setLoading(true);
      // Fetch profile
      const profileRes = await api.get("/customer/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = profileRes.data;
      setBalance(profile.points || profile.pointsBalance || 0);
      setTier(profile.tier || "No tier assigned");
      setExpiringPoints(calculateExpiringPoints(profile.pointsHistory));

      // Fetch only 5 most recent transactions
      const historyRes = await api.get("/transactions/history?limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recentTransactions = Array.isArray(historyRes.data.transactions)
        ? historyRes.data.transactions
        : [];
      setTransactions(recentTransactions);

      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Could not fetch profile or recent transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndRecentTransactions();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setError("");

    const redeemVal = redeemPoints ? Number(redeemPoints) : 0;
    if (redeemVal > balance) {
      setError("Redeem points cannot exceed current balance.");
      return;
    }

    if (!adminId) {
      setError("Admin ID not found. Please re-login.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(
        "/transactions",
        {
          amount: Number(amount),
          category,
          redeemPoints: redeemVal,
          adminId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAmount("");
      setCategory("");
      setRedeemPoints("");
      if (res.data.pointsBreakdown) {
        setPointsBreakdown(res.data.pointsBreakdown);
      } else {
        setPointsBreakdown(null);
      }
      await fetchProfileAndRecentTransactions();
    } catch (err) {
      console.error("Error adding transaction:", err.response?.data || err);
      setError(err.response?.data?.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/"); // Redirect to dashboard on logout
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col">
      {/* Header with Loyalty Program title and nav buttons */}
      <header className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center shadow sticky top-0 z-50">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate("/customer")}
        >
          Loyalty Program
        </h1>
        <nav className="flex items-center space-x-6">
          <button
            onClick={() => navigate("/customer/points")}
            className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded text-white font-semibold"
          >
            Points
          </button>
          <button
            onClick={() => navigate("/customer/transactions")}
            className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded text-white font-semibold"
          >
            Transactions
          </button>
          <button
            onClick={() => navigate("/customer/profile")}
            className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded text-white font-semibold"
          >
            Profile
          </button>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white font-semibold"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex justify-center items-start p-6">
        <div className="w-full max-w-4xl bg-white rounded-2xl p-8 shadow-lg">
          {/* Tier and Expiry Notice */}
          <section className="mb-6 p-5 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
            <p className="text-xl font-semibold text-indigo-700 mb-2">
              Current Tier: <span className="uppercase">{tier}</span>
            </p>
            {expiringPoints > 0 && (
              <p className="text-red-600 font-semibold" aria-live="polite">
                You have <strong>{expiringPoints}</strong> points expiring soon!
              </p>
            )}
          </section>

          {/* Balance */}
          <section
            className="mb-6 p-5 bg-indigo-50 border border-indigo-200 rounded-xl text-center"
            aria-live="polite"
          >
            <p className="text-2xl font-bold text-indigo-700">Current Points Balance</p>
            <p className="text-4xl font-extrabold text-indigo-900 mt-2">{balance}</p>

            {/* Points breakdown display */}
            {pointsBreakdown && (
              <div className="mt-4 text-left text-indigo-800 max-w-md mx-auto bg-indigo-100 p-3 rounded">
                <h4 className="font-semibold mb-2">Points Breakdown (Latest Transaction):</h4>
                <p>Base Points: {pointsBreakdown.basePoints ?? "N/A"}</p>
                <p>Category Points: {pointsBreakdown.categoryPoints ?? "N/A"}</p>
                <p>Tier Multiplier: {pointsBreakdown.tierMultiplier ?? "N/A"}</p>
                <p>Threshold Bonus: {pointsBreakdown.thresholdBonus ?? "N/A"}</p>
                <p>
                  <strong>Total Earned Points: {pointsBreakdown.totalEarnedPoints ?? "N/A"}</strong>
                </p>
              </div>
            )}
          </section>

          {/* Transaction Form */}
          <form
            onSubmit={handleAddTransaction}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
            aria-label="Add transaction form"
          >
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
              required
              aria-required="true"
              aria-label="Transaction amount"
              min="0"
              step="0.01"
            />
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
              required
              aria-required="true"
              aria-label="Transaction category"
            />
            <input
              type="number"
              placeholder="Redeem Points (optional)"
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(e.target.value)}
              className="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400"
              aria-label="Points to redeem"
              min="0"
            />
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md ${submitting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
              >
                {submitting ? "Processing..." : "Add Transaction"}
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <p
              className="text-red-600 mb-6 text-center font-semibold"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          )}

          {/* Recent Transactions (limit 5) */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">
              Recent Transactions
            </h2>
            {loading ? (
              <p className="text-center text-gray-600">Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <p className="text-gray-600 text-center">No recent transactions.</p>
            ) : (
              <div
                className="grid gap-4 md:grid-cols-2"
                aria-label="Recent transactions list"
              >
                {transactions.slice(0, 5).map((t) => (
                  <div
                    key={t._id}
                    className="border rounded-xl p-5 shadow-md bg-gradient-to-r from-indigo-50 to-blue-50 hover:shadow-xl transition"
                    role="listitem"
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
          </section>
        </div>
      </main>
    </div>
  );
};

export default Customer;
