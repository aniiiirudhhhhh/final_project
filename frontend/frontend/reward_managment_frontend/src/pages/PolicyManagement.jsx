import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const PolicyManagement = () => {
  // Policy Form State
  const [policy, setPolicy] = useState(null);
  const [form, setForm] = useState({
    policyName: "",
    description: "",
    basePointsPer100: "",
    redemptionRate: "",
    minRedeemPoints: "",
    pointsExpiryDays: "", // New field for points expiry days
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Category Rules State
  const [categoryRules, setCategoryRules] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    category: "",
    pointsPer100: "",
    minAmount: "",
    bonusPoints: "",
  });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  // Spend Threshold Bonuses State
  const [thresholds, setThresholds] = useState([]);
  const [thresholdForm, setThresholdForm] = useState({
    minAmount: "",
    bonusPoints: "",
  });
  const [thresholdLoading, setThresholdLoading] = useState(false);
  const [thresholdError, setThresholdError] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPolicy();
    fetchCategoryRules();
    fetchThresholds();
  }, []);

  // Fetch Reward Policy
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
        pointsExpiryDays: res.data.pointsExpiryDays || "", // set from backend
      });
      setError("");
    } catch (err) {
      setPolicy(null);
      setError("No existing policy. Create one below.");
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
    if (!window.confirm("Are you sure you want to delete the policy?")) return;
    try {
      await API.delete("/admin/policy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Policy deleted");
      setPolicy(null);
      setForm({
        policyName: "",
        description: "",
        basePointsPer100: "",
        redemptionRate: "",
        minRedeemPoints: "",
        pointsExpiryDays: "",
      });
      setCategoryRules([]);
      setThresholds([]);
      //navigate("/");
    } catch (err) {
      alert("Error deleting policy");
    }
  };

  // Fetch and save Category Rules
  const fetchCategoryRules = async () => {
    try {
      const res = await API.get("/admin/policy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategoryRules(res.data.categoryRules || []);
      setCategoryError("");
    } catch (err) {
      setCategoryError("Failed to fetch category rules");
    }
  };

  const handleCategoryChange = (e) => {
    setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value });
  };

  const handleCategorySave = async () => {
    if (!categoryForm.category) {
      alert("Category name is required");
      return;
    }
    try {
      setCategoryLoading(true);
      const payload = {
        category: categoryForm.category,
        pointsPer100: Number(categoryForm.pointsPer100),
        minAmount: Number(categoryForm.minAmount),
        bonusPoints: Number(categoryForm.bonusPoints),
      };
      const res = await API.post("/admin/policy/policy/category", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || "Category rule saved");
      fetchCategoryRules();
      setCategoryForm({ category: "", pointsPer100: "", minAmount: "", bonusPoints: "" });
    } catch (err) {
      alert("Error saving category rule");
    } finally {
      setCategoryLoading(false);
    }
  };

  // Fetch and save Spend Threshold Bonuses
  const fetchThresholds = async () => {
    try {
      const res = await API.get("/admin/policy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setThresholds(res.data.spendThresholds || []);
      setThresholdError("");
    } catch (err) {
      setThresholdError("Failed to fetch spend thresholds");
    }
  };

  const handleThresholdChange = (e) => {
    setThresholdForm({ ...thresholdForm, [e.target.name]: e.target.value });
  };

  const handleThresholdSave = async () => {
    if (!thresholdForm.minAmount) {
      alert("Minimum amount is required");
      return;
    }
    try {
      setThresholdLoading(true);
      const payload = {
        minAmount: Number(thresholdForm.minAmount),
        bonusPoints: Number(thresholdForm.bonusPoints),
      };
      const res = await API.post("/admin/policy/threshold", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || "Threshold rule saved");
      fetchThresholds();
      setThresholdForm({ minAmount: "", bonusPoints: "" });
    } catch (err) {
      alert("Error saving threshold rule");
    } finally {
      setThresholdLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Manage Reward Policy</h1>

      {/* Policy Form */}
      <section className="border p-6 rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-4">Policy Details</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="text-yellow-700 mb-4">{error}</p>}

        <input
          type="text"
          name="policyName"
          placeholder="Policy Name"
          value={form.policyName}
          onChange={handleChange}
          className="border p-2 w-full rounded mb-3"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 w-full rounded mb-3"
        />
        <input
          type="number"
          name="basePointsPer100"
          placeholder="Base Points per 100"
          value={form.basePointsPer100}
          onChange={handleChange}
          className="border p-2 w-full rounded mb-3"
        />
        <input
          type="number"
          name="redemptionRate"
          placeholder="Redemption Rate"
          value={form.redemptionRate}
          onChange={handleChange}
          className="border p-2 w-full rounded mb-3"
        />
        <input
          type="number"
          name="minRedeemPoints"
          placeholder="Minimum Redeem Points"
          value={form.minRedeemPoints}
          onChange={handleChange}
          className="border p-2 w-full rounded mb-3"
        />
        <input
          type="number"
          name="pointsExpiryDays"
          placeholder="Points Expiry Days"
          value={form.pointsExpiryDays}
          onChange={handleChange}
          className="border p-2 w-full rounded mb-3"
        />
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            Save Policy
          </button>
          {policy && (
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700"
              disabled={loading}
            >
              Delete Policy
            </button>
          )}
        </div>
      </section>

      {/* Category Rules Management */}
      <section className="border p-6 rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-4">Category Rules Management</h2>
        {categoryError && <p className="text-red-600 mb-3">{categoryError}</p>}
        {categoryRules.length === 0 ? (
          <p className="mb-4">No category rules defined yet.</p>
        ) : (
          <ul className="mb-4 space-y-2 max-h-48 overflow-auto border p-3 rounded">
            {categoryRules.map((rule) => (
              <li key={rule.category} className="border rounded p-2 bg-gray-50">
                <strong>{rule.category}</strong> — Points per 100: {rule.pointsPer100}, Min Amount: {rule.minAmount}, Bonus Points: {rule.bonusPoints || 0}
              </li>
            ))}
          </ul>
        )}
        <div className="space-y-4 max-w-md">
          <input
            type="text"
            name="category"
            placeholder="Category Name"
            value={categoryForm.category}
            onChange={handleCategoryChange}
            className="border p-2 w-full rounded"
          />
          <input
            type="number"
            name="pointsPer100"
            placeholder="Points per 100 Spent"
            value={categoryForm.pointsPer100}
            onChange={handleCategoryChange}
            className="border p-2 w-full rounded"
          />
          <input
            type="number"
            name="minAmount"
            placeholder="Minimum Purchase Amount"
            value={categoryForm.minAmount}
            onChange={handleCategoryChange}
            className="border p-2 w-full rounded"
          />
          <input
            type="number"
            name="bonusPoints"
            placeholder="Bonus Points"
            value={categoryForm.bonusPoints}
            onChange={handleCategoryChange}
            className="border p-2 w-full rounded"
          />
          <button
            onClick={handleCategorySave}
            disabled={categoryLoading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {categoryLoading ? "Saving..." : "Save Category Rule"}
          </button>
        </div>
      </section>

      {/* Spend Threshold Bonuses Management */}
      <section className="border p-6 rounded shadow bg-white">
        <h2 className="text-xl font-semibold mb-4">Spend Threshold Bonuses Management</h2>
        {thresholdError && <p className="text-red-600 mb-3">{thresholdError}</p>}
        {thresholds.length === 0 ? (
          <p className="mb-4">No spend threshold bonuses defined yet.</p>
        ) : (
          <ul className="mb-4 space-y-2 max-h-48 overflow-auto border p-3 rounded">
            {thresholds.map((rule, idx) => (
              <li key={idx} className="border rounded p-2 bg-gray-50">
                Minimum Spend: ${rule.minAmount} — Bonus Points: {rule.bonusPoints}
              </li>
            ))}
          </ul>
        )}
        <div className="space-y-4 max-w-md">
          <input
            type="number"
            name="minAmount"
            placeholder="Minimum Spend Amount"
            value={thresholdForm.minAmount}
            onChange={handleThresholdChange}
            className="border p-2 w-full rounded"
          />
          <input
            type="number"
            name="bonusPoints"
            placeholder="Bonus Points"
            value={thresholdForm.bonusPoints}
            onChange={handleThresholdChange}
            className="border p-2 w-full rounded"
          />
          <button
            onClick={handleThresholdSave}
            disabled={thresholdLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            {thresholdLoading ? "Saving..." : "Save Threshold Bonus"}
          </button>
                  <button
                      onClick={() => navigate("/business/points-expiry")}
                      className="mt-6 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                  >
                      View Expiring Points
                  </button>
        </div>
      </section>
    </div>
  );
};

export default PolicyManagement;
