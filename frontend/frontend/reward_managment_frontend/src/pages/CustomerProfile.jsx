import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [lifetimeSpend, setLifetimeSpend] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Calculate active points from pointsHistory to handle expiry & redemption
  const calculateActivePoints = (pointsHistory) => {
    if (!pointsHistory) return 0;
    const now = new Date();
    return pointsHistory
      .filter((p) => !p.redeemed && new Date(p.expiresAt) > now)
      .reduce((sum, p) => sum + p.points, 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch profile data including pointsHistory
        const [profileRes, transactionsRes] = await Promise.all([
          api.get("/customer/me", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/transactions/history", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const profileData = profileRes.data;

        setProfile(profileData);
        setPointsBalance(calculateActivePoints(profileData.pointsHistory));
        
        // Calculate lifetime spend from all transactions
        const transactions = transactionsRes.data.transactions || [];
        const totalSpend = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        setLifetimeSpend(totalSpend);

        setError("");
      } catch (err) {
        console.error("Error fetching profile or transactions:", err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const logout = () => {
    localStorage.clear();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow">
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
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white font-semibold"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Profile Content */}
      <main className="flex-grow p-6 flex justify-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-indigo-700 text-center">
            Customer Profile
          </h2>

          {loading ? (
            <p className="text-center text-gray-600">Loading profile...</p>
          ) : error ? (
            <p className="text-center text-red-600 font-semibold">{error}</p>
          ) : profile ? (
            <div className="text-gray-800 space-y-4">
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Points Balance:</strong> {pointsBalance}</p>
              <p><strong>Lifetime Spend:</strong> ₹{lifetimeSpend.toLocaleString()}</p>
              {/* Additional profile info can be added here */}
            </div>
          ) : (
            <p className="text-center text-gray-600">No profile data available.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerProfile;
