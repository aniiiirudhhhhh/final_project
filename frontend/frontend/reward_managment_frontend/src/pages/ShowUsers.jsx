import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customer/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Registered Customers</h1>

      {loading && <p>Loading customers...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {customers.length === 0 && !loading && (
        <p className="text-gray-600">No customers registered yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customers.map((customer) => (
          <div
            key={customer._id}
            className="p-4 border rounded shadow cursor-pointer hover:bg-gray-100"
            onClick={() => navigate(`/business/users/${customer._id}`)}
          >
            <p><strong>Name:</strong> {customer.name}</p>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Points Balance:</strong> {customer.pointsBalance}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;
