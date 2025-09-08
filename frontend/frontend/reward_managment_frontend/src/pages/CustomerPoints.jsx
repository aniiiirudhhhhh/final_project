import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const CustomerPoints = () => {
  const [pointsBalance, setPointsBalance] = useState(0);
  const [tier, setTier] = useState("No tier assigned");
  const [tierBenefits, setTierBenefits] = useState("");
  const [pointsExpiryDays, setPointsExpiryDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPointsInfo = async () => {
      try {
        setLoading(true);
        const res = await api.get("/customer/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setPointsBalance(data.points || data.pointsBalance || 0);
        setTier(data.tier || "No tier assigned");
        setPointsExpiryDays(data.pointsExpiryDays || 365);

        const benefitsMap = {
          Silver: "Basic benefits like discounts and exclusive offers.",
          Gold: "All Silver benefits plus priority support and special rewards.",
          Platinum: "All Gold benefits plus highest priority, VIP access, and premium offers.",
        };
        setTierBenefits(benefitsMap[data.tier] || "No benefits available for this tier.");
        setError("");
      } catch (err) {
        console.error("Error fetching points info:", err);
        setError("Failed to load points and tier information.");
      } finally {
        setLoading(false);
      }
    };

    fetchPointsInfo();
  }, [token]);

  const logout = () => {
    localStorage.clear();
    navigate("/dashboard");
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow">
        <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate("/customer")}>
          Loyalty Program
        </h1>
        <nav className="flex items-center space-x-4 md:space-x-6">
          <button
            onClick={() => navigate("/customer")}
            className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded text-white font-semibold"
          >
            Dashboard
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
      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center items-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl p-6 md:p-8 shadow-lg text-center">
          <h2 className="text-3xl font-bold mb-6 text-indigo-700">Your Points & Tier Information</h2>

          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-red-600 font-semibold">{error}</p>
          ) : (
            <>
              <p className="text-2xl font-extrabold text-indigo-900 mb-4">
                Points Available: <span>{pointsBalance}</span>
              </p>
              <p className="mb-4">
                Points expire after <strong>{pointsExpiryDays}</strong> days from earning.
              </p>
              <p className="text-xl font-semibold mb-2">Tier: {tier}</p>
              <p className="text-gray-700">{tierBenefits}</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerPoints;
