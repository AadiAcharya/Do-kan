import React, { useState } from 'react';
import VendorApplicationReview from '../components/VendorApplicationReview';
import ProductModeration from '../components/ProductModeration';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([
    { id: 1, name: 'iPhone 15', price: 999, category: 'Electronics', stock: 45 },
    { id: 2, name: 'Samsung TV', price: 599, category: 'Electronics', stock: 12 },
    { id: 3, name: 'Nike Shoes', price: 120, category: 'Apparel', stock: 87 }
  ]);

  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', stock: '' });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price && newProduct.category && newProduct.stock) {
      setProducts([...products, { id: products.length + 1, ...newProduct }]);
      setNewProduct({ name: '', price: '', category: '', stock: '' });
    }
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-2 rounded-lg font-semibold ${
            activeTab === 'products' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Manage Products
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-6 py-2 rounded-lg font-semibold ${
            activeTab === 'moderation' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Product Moderation
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2 rounded-lg font-semibold ${
            activeTab === 'users' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-6 py-2 rounded-lg font-semibold ${
            activeTab === 'vendors' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Vendor Applications
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Products Management</h2>

          {/* Add Product Form */}
          <form onSubmit={handleAddProduct} className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Add New Product</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                Add Product
              </button>
            </div>
          </form>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2 text-left">ID</th>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Price</th>
                  <th className="border px-4 py-2 text-left">Category</th>
                  <th className="border px-4 py-2 text-left">Stock</th>
                  <th className="border px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border hover:bg-gray-50">
                    <td className="border px-4 py-2">{product.id}</td>
                    <td className="border px-4 py-2">{product.name}</td>
                    <td className="border px-4 py-2">Rs.{product.price}</td>
                    <td className="border px-4 py-2">{product.category}</td>
                    <td className="border px-4 py-2">{product.stock}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Users Management</h2>
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">User management features coming soon...</p>
          </div>
        </div>
      )}

      {/* Product Moderation Tab */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Moderation & Content Approval</h2>
          <ProductModeration />
        </div>
      )}

      {/* Vendor Applications Tab */}
      {activeTab === 'vendors' && <VendorApplicationReview />}
    </div>
  );
};

export default AdminPage;
