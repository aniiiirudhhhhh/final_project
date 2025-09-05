import React, { useEffect, useState } from "react";
import API from "../api";

const Business = () => {
  const [policy, setPolicy] = useState(null);
  const [form, setForm] = useState({
    policyName: "",
    description: "",
    basePointsPer100: "",
    redemptionRate: "",
    minRedeemPoints: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customers, setCustomers] = useState([]);
  const [showCustomers, setShowCustomers] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null); // ✅
  const [customerHistory, setCustomerHistory] = useState([]); // ✅

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const adminId = user?.user?._id || user?._id;

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/policy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolicy(res.data);
      setForm({
        policyName: res.data.policyName || "",
        description: res.data.description || "",
        basePointsPer100: res.data.basePointsPer100 || "",
        redemptionRate: res.data.redemptionRate || "",
        minRedeemPoints: res.data.minRedeemPoints || "",
      });
      setError("");
    } catch (err) {
      setError("No policy found. Create one!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await API.post("/admin/policy", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolicy(res.data.policy);
      alert(res.data.message || "Policy saved successfully");
    } catch (err) {
      alert("Error saving policy");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete("/admin/policy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolicy(null);
      setForm({
        policyName: "",
        description: "",
        basePointsPer100: "",
        redemptionRate: "",
        minRedeemPoints: "",
      });
      alert("Policy deleted");
    } catch (err) {
      alert("Error deleting policy");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/customer/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
      setShowCustomers(true);
    } catch (err) {
      alert("Error fetching customers");
    }
  };

  // ✅ Fetch specific customer’s transaction history
  const fetchCustomerHistory = async (customerId) => {
    try {
      const res = await API.get(`/transactions/customer/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedCustomer(res.data.customer);
      setCustomerHistory(res.data.transactions);
    } catch (err) {
      alert("Error fetching customer history");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Business Reward Policy</h2>

      {/* ✅ Show Admin ID */}
      <div className="mb-4 p-3 border rounded bg-gray-100">
        <p className="font-semibold text-gray-700">
          Your Admin ID:{" "}
          <span className="text-blue-600 font-mono">{adminId}</span>
        </p>
        <p className="text-sm text-gray-500">
          Share this ID with your customers. They need it to register.
        </p>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-4">
        <input
          type="text"
          name="policyName"
          placeholder="Policy Name"
          value={form.policyName}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="number"
          name="basePointsPer100"
          placeholder="Base Points per 100"
          value={form.basePointsPer100}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="number"
          name="redemptionRate"
          placeholder="Redemption Rate"
          value={form.redemptionRate}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        <input
          type="number"
          name="minRedeemPoints"
          placeholder="Minimum Redeem Points"
          value={form.minRedeemPoints}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Policy
        </button>
        {policy && (
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Delete Policy
          </button>
        )}
        <button
          onClick={fetchCustomers}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          View Customers
        </button>
      </div>

      {policy && (
        <div className="mt-6 border p-4 rounded bg-gray-50">
          <h3 className="text-lg font-semibold">Current Policy:</h3>
          <p><strong>Name:</strong> {policy.policyName}</p>
          <p><strong>Description:</strong> {policy.description}</p>
          <p><strong>Base Points:</strong> {policy.basePointsPer100} / 100</p>
          <p><strong>Redemption Rate:</strong> {policy.redemptionRate}</p>
          <p><strong>Min Redeem Points:</strong> {policy.minRedeemPoints}</p>
        </div>
      )}

      {/* ✅ Customers list */}
      {showCustomers && (
        <div className="mt-6 border p-4 rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Associated Customers</h3>
          {customers.length > 0 ? (
            <ul className="space-y-3">
              {customers.map((c) => (
                <li
                  key={c._id}
                  className="border p-3 rounded bg-white shadow-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => fetchCustomerHistory(c._id)} // ✅ Click to view history
                >
                  <p><strong>Name:</strong> {c.name}</p>
                  <p><strong>Email:</strong> {c.email}</p>
                  <p><strong>Points:</strong> {c.pointsBalance}</p>
                  <p><strong>Transactions:</strong> {c.history.length}</p>
                  <p className="text-blue-600 text-sm">Click to view history ➜</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No customers found yet.</p>
          )}
        </div>
      )}

      {/* ✅ Selected customer’s transaction history */}
      {selectedCustomer && (
        <div className="mt-6 border p-4 rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">
            {selectedCustomer.name}’s Transaction History
          </h3>
          <p><strong>Email:</strong> {selectedCustomer.email}</p>
          <p><strong>Current Points:</strong> {selectedCustomer.pointsBalance}</p>

          {customerHistory.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {customerHistory.map((t) => (
                <li
                  key={t._id}
                  className="border p-3 rounded bg-white shadow-sm"
                >
                  <p><strong>Amount:</strong> ${t.amount}</p>
                  <p><strong>Category:</strong> {t.category}</p>
                  <p><strong>Earned:</strong> {t.earnedPoints}</p>
                  <p><strong>Redeemed:</strong> {t.redeemedPoints}</p>
                  <p><strong>Final Balance:</strong> {t.finalPoints}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 mt-2">No transactions found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Business;
