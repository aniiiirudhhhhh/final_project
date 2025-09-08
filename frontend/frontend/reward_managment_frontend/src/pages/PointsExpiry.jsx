import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { Clock, UserCheck } from "lucide-react";

const PointsExpiry = () => {
  const [expiringPointsList, setExpiringPointsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [minPointsFilter, setMinPointsFilter] = useState(0);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpiringPoints();
  }, []);

  const fetchExpiringPoints = async () => {
    try {
      setLoading(true);
      const res = await API.get("/transactions/points-expiry", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpiringPointsList(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load expiring points");
    } finally {
      setLoading(false);
    }
  };

  const filteredList = expiringPointsList.filter(p => p.expiringPoints >= minPointsFilter);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            className="text-blue-600 underline flex items-center gap-1"
            onClick={() => navigate(-1)}
          >
            &larr; Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-8 h-8 text-purple-500" />
            Points Expiry Management
          </h1>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-gray-700 font-medium">Show points ≥</label>
          <input
            type="number"
            value={minPointsFilter}
            onChange={(e) => setMinPointsFilter(Number(e.target.value))}
            className="border p-2 rounded w-24"
            min={0}
          />
        </div>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {filteredList.length === 0 && !loading && (
          <p className="text-gray-700">No customers have points expiring soon.</p>
        )}

        {/* Expiring Points List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredList.map(({ customerId, name, email, expiringPoints }) => (
            <div
              key={customerId}
              className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500"
            >
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold">{name}</h2>
              </div>
              <p className="text-gray-600 mb-1"><strong>Email:</strong> {email}</p>
              <p className="text-gray-800 font-medium">
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-white px-3 py-1 rounded-full shadow-md">
                  {expiringPoints} Points
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PointsExpiry;
