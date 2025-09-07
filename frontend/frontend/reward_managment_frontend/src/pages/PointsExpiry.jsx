import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const PointsExpiry = () => {
  const [expiringPointsList, setExpiringPointsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        className="mb-4 text-blue-600 underline"
        onClick={() => navigate(-1)}
      >
        &larr; Back
      </button>
      <h1 className="text-2xl font-bold mb-6">Points Expiry Management</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {expiringPointsList.length === 0 && !loading && (
        <p>No customers have points expiring soon.</p>
      )}

      <ul className="space-y-4">
        {expiringPointsList.map(({ customerId, name, email, expiringPoints }) => (
          <li key={customerId} className="border p-4 rounded bg-gray-50 shadow-sm">
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Expiring Points:</strong> {expiringPoints}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PointsExpiry;
