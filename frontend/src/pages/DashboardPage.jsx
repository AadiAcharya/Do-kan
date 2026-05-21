import React, { useState, useEffect } from 'react';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      totalProducts: 145,
      totalUsers: 1250,
      totalOrders: 342,
      totalRevenue: 85400
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Products</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
        </div>

        {/* Total Users Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Orders</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.totalOrders}</p>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-500 text-sm font-semibold mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-orange-600">${stats.totalRevenue}</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-700">New product added: iPhone 15</p>
            <span className="text-gray-400 text-sm">2 hours ago</span>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-gray-700">New user registered</p>
            <span className="text-gray-400 text-sm">4 hours ago</span>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="text-gray-700">Order #1234 placed</p>
            <span className="text-gray-400 text-sm">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
