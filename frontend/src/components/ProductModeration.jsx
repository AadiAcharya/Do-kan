import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';

const ProductModeration = () => {
  const [activeStatus, setActiveStatus] = useState('pending');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Mock data - pending products awaiting approval
  const [pendingProducts] = useState([
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      vendor: 'TechMart',
      category: 'Electronics',
      price: 1299,
      stock: 50,
      thumbnail: 'https://via.placeholder.com/100?text=iPhone15',
      sku: 'SKU-001',
      createdAt: '2024-12-15',
      description: 'Latest Apple iPhone with A17 Pro chip',
      images: ['img1.jpg', 'img2.jpg'],
      status: 'pending_approval'
    },
    {
      id: 2,
      name: 'Samsung 65" QLED TV',
      vendor: 'ElectroHub',
      category: 'Electronics',
      price: 1599,
      stock: 12,
      thumbnail: 'https://via.placeholder.com/100?text=Samsung',
      sku: 'SKU-002',
      createdAt: '2024-12-14',
      description: 'Ultra HD Samsung TV with smart features',
      images: ['img1.jpg', 'img2.jpg'],
      status: 'pending_approval'
    },
    {
      id: 3,
      name: 'Nike Air Max 90',
      vendor: 'SportGear',
      category: 'Apparel',
      price: 149.99,
      stock: 200,
      thumbnail: 'https://via.placeholder.com/100?text=Nike',
      sku: 'SKU-003',
      createdAt: '2024-12-13',
      description: 'Classic Nike sneakers',
      images: ['img1.jpg', 'img2.jpg'],
      status: 'pending_approval'
    },
    {
      id: 4,
      name: 'Sony Headphones WH-1000XM5',
      vendor: 'AudioWorld',
      category: 'Electronics',
      price: 399,
      stock: 30,
      thumbnail: 'https://via.placeholder.com/100?text=Sony',
      sku: 'SKU-004',
      createdAt: '2024-12-12',
      description: 'Premium noise-canceling headphones',
      images: ['img1.jpg', 'img2.jpg'],
      status: 'pending_approval'
    },
    {
      id: 5,
      name: 'Apple iPad Pro 12.9"',
      vendor: 'TechMart',
      category: 'Electronics',
      price: 1199,
      stock: 25,
      thumbnail: 'https://via.placeholder.com/100?text=iPad',
      sku: 'SKU-005',
      createdAt: '2024-12-11',
      description: 'Latest iPad with M2 chip',
      images: ['img1.jpg', 'img2.jpg'],
      status: 'pending_approval'
    }
  ]);

  // Mock data - approved products
  const [approvedProducts] = useState([
    {
      id: 101,
      name: 'PlayStation 5',
      vendor: 'GameStore',
      category: 'Electronics',
      price: 499,
      stock: 45,
      thumbnail: 'https://via.placeholder.com/100?text=PS5',
      sku: 'SKU-101',
      approvedAt: '2024-12-10',
      approvedBy: 'Admin John',
      status: 'approved'
    },
    {
      id: 102,
      name: 'Dell XPS 13',
      vendor: 'TechMart',
      category: 'Electronics',
      price: 1099,
      stock: 15,
      thumbnail: 'https://via.placeholder.com/100?text=Dell',
      sku: 'SKU-102',
      approvedAt: '2024-12-09',
      approvedBy: 'Admin Jane',
      status: 'approved'
    }
  ]);

  // Mock data - rejected products
  const [rejectedProducts] = useState([
    {
      id: 201,
      name: 'Counterfeit Watch',
      vendor: 'UnknownVendor',
      category: 'Accessories',
      price: 99,
      stock: 0,
      thumbnail: 'https://via.placeholder.com/100?text=Watch',
      sku: 'SKU-201',
      rejectedAt: '2024-12-08',
      rejectionReason: 'Product appears to be counterfeit. Does not meet brand authenticity requirements.',
      status: 'rejected'
    }
  ]);

  const stats = {
    pending: pendingProducts.length,
    approved: approvedProducts.length,
    rejected: rejectedProducts.length,
    total: pendingProducts.length + approvedProducts.length + rejectedProducts.length
  };

  const getProductsList = () => {
    let list = [];
    if (activeStatus === 'pending') list = pendingProducts;
    else if (activeStatus === 'approved') list = approvedProducts;
    else list = rejectedProducts;

    return list.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const products = getProductsList();
  const itemsPerPage = 5;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const displayedProducts = products.slice(startIdx, startIdx + itemsPerPage);

  const handleApprove = (product) => {
    alert(`Product "${product.name}" has been approved!`);
  };

  const handleReject = (product) => {
    setSelectedProduct(product);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (rejectReason.trim()) {
      alert(`Product "${selectedProduct.name}" has been rejected.\nReason: ${rejectReason}`);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedProduct(null);
    }
  };

  const handleViewDetails = (product) => {
    alert(`Viewing details for: ${product.name}\n\nDescription: ${product.description}\nImages: ${product.images.join(', ')}`);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-300 opacity-60" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-300 opacity-60" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-300 opacity-60" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-blue-300 opacity-60" />
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-4 flex gap-2 flex-wrap">
          {[
            { label: 'Pending Review', value: 'pending', count: stats.pending, color: 'yellow' },
            { label: 'Approved', value: 'approved', count: stats.approved, color: 'green' },
            { label: 'Rejected', value: 'rejected', count: stats.rejected, color: 'red' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setActiveStatus(tab.value); setPage(1); }}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                activeStatus === tab.value
                  ? `bg-${tab.color}-100 text-${tab.color}-700 border-2 border-${tab.color}-500`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-sm font-bold bg-${tab.color}-200 text-${tab.color}-800`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search by product name, vendor, or SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          {displayedProducts.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No products found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Vendor</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.thumbnail} 
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.vendor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Rs.{product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.stock > 20 ? 'bg-green-100 text-green-800' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {activeStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(product)}
                              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition tooltip"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(product)}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition tooltip"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleViewDetails(product)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition tooltip"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition tooltip"
                          title="Download Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Reject Product
            </h3>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Product:</span> {selectedProduct.name}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-semibold">Vendor:</span> {selectedProduct.vendor}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-semibold">Price:</span> Rs.{selectedProduct.price.toFixed(2)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejection Reason <span className="text-red-600">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this product is being rejected (quality issues, policy violation, copyright, etc.)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows="4"
              />
              <p className="text-xs text-gray-500 mt-2">
                This reason will be visible to the vendor and help them improve their products.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedProduct(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModeration;
