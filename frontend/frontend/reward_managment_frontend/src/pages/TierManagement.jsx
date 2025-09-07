import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const TierManagement = () => {
  const [tierRules, setTierRules] = useState([]);
  const [form, setForm] = useState({
    tierName: "Silver",
    minPoints: "",
    multiplier: 1,
    benefits: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // New states for customers and tier update
  const [customers, setCustomers] = useState([]);
  const [updatingTierFor, setUpdatingTierFor] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTierRules();
    fetchCustomers();
  }, []);

  const fetchTierRules = async () => {
    try {
      const res = await API.get("/admin/policy/tier", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTierRules(res.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load tier rules");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/customer/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
    } catch (err) {
      // handle error silently or alert
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.minPoints) {
      alert("Minimum points is required");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        tierName: form.tierName,
        minPoints: Number(form.minPoints),
        multiplier: Number(form.multiplier),
        benefits: form.benefits,
      };
      const res = await API.post("/admin/policy/tier", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || "Tier rule saved");
      fetchTierRules();
      setForm({ tierName: "Silver", minPoints: "", multiplier: 1, benefits: "" });
    } catch (err) {
      alert("Error saving tier rule");
    } finally {
      setLoading(false);
    }
  };

  // Handle customer tier change locally before submission
  const handleCustomerTierChange = (customerId, newTier) => {
    setCustomers((prev) =>
      prev.map((c) => (c._id === customerId ? { ...c, tier: newTier } : c))
    );
  };

  // Save updated tier for specific customer
  const saveCustomerTier = async (customerId, tier) => {
    setUpdatingTierFor(customerId);
    try {
      await API.put(
        `/customer/${customerId}/tier`,
        { tier },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Customer tier updated successfully");
      fetchCustomers(); // Refresh list to ensure sync
    } catch (err) {
      alert("Failed to update customer tier");
    } finally {
      setUpdatingTierFor(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Tier Rules Management</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="mb-6">
        {tierRules.length === 0 ? (
          <p>No tier rules defined yet.</p>
        ) : (
          <ul className="space-y-3">
            {tierRules.map((rule) => (
              <li key={rule.tierName} className="border p-3 rounded bg-white shadow-sm">
                <strong>{rule.tierName}</strong> — Min Points: {rule.minPoints}, Multiplier: {rule.multiplier}, Benefits: {rule.benefits || "N/A"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block font-semibold mb-1">Tier Name:</label>
          <select
            name="tierName"
            value={form.tierName}
            onChange={handleChange}
            className="border p-2 w-full"
          >
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Minimum Points:</label>
          <input
            type="number"
            name="minPoints"
            value={form.minPoints}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Multiplier:</label>
          <input
            type="number"
            name="multiplier"
            value={form.multiplier}
            onChange={handleChange}
            step="0.1"
            min="1"
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Benefits:</label>
          <input
            type="text"
            name="benefits"
            value={form.benefits}
            onChange={handleChange}
            className="border p-2 w-full"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Tier Rule"}
        </button>
      </div>

      {/* Customer Tier Update Section */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">Customers & Tier Management</h2>
        {customers.length === 0 ? (
          <p>No customers registered yet.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300 text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Current Tier</th>
                <th className="border border-gray-300 px-4 py-2">Update Tier</th>
                <th className="border border-gray-300 px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{customer.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{customer.email}</td>
                  <td className="border border-gray-300 px-4 py-2">{customer.tier || "No tier"}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      value={customer.tier || ""}
                      onChange={(e) => handleCustomerTierChange(customer._id, e.target.value)}
                      className="border p-1 rounded"
                    >
                      <option value="">No tier</option>
                      {tierRules.map((rule) => (
                        <option key={rule.tierName} value={rule.tierName}>{rule.tierName}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      disabled={updatingTierFor === customer._id}
                      onClick={() => saveCustomerTier(customer._id, customer.tier)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {updatingTierFor === customer._id ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default TierManagement;
