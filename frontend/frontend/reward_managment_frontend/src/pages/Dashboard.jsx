import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    navigate("/login", { state: { role } }); // pass role to Login.jsx
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Reward Management System</h1>
        <div className="space-x-3">
          <button
            onClick={() => handleLogin("customer")}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition"
          >
            Login as Customer
          </button>
          <button
            onClick={() => handleLogin("admin")}
            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg transition"
          >
            Login as Admin
          </button>
        </div>
      </header>

      {/* Banner */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-100 to-green-100 text-center p-10">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">
            Simplify Rewards, Boost Engagement 🎉
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Manage your loyalty programs with ease. Track customer purchases, set reward policies, and let your customers earn and redeem points effortlessly.
          </p>
        </div>
      </section>

      {/* About Us */}
      <section className="bg-white py-12 px-6 text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">About Us</h3>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Our Reward Management System helps businesses grow by building strong relationships with their customers. 
          We provide a platform where businesses can set up their own reward policies and customers can seamlessly earn and redeem points.
        </p>
      </section>

      {/* What We Offer */}
      <section className="bg-gray-50 py-12 px-6">
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">What We Offer</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h4 className="text-lg font-semibold text-blue-600 mb-2">Custom Reward Policies</h4>
            <p className="text-gray-600">Admins can define flexible reward structures, categories, and redemption rules.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h4 className="text-lg font-semibold text-green-600 mb-2">Seamless Transactions</h4>
            <p className="text-gray-600">Customers can make purchases and instantly earn or redeem reward points.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h4 className="text-lg font-semibold text-purple-600 mb-2">Business Insights</h4>
            <p className="text-gray-600">Track growth, revenue, and customer engagement with smart analytics.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center py-4 mt-auto">
        <p>© {new Date().getFullYear()} Reward Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;  

