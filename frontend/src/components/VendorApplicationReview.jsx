import React, { useState } from 'react';

const VendorApplicationReview = () => {
  // Mock vendor applications data
  const [applications, setApplications] = useState([
    {
      id: 1,
      vendorName: 'Tech Haven Store',
      vendorEmail: 'vendor1@example.com',
      vendorPhone: '+977-9841234567',
      storeName: 'Tech Haven',
      storeDescription: 'Premium electronics and gadgets store offering latest technology products',
      storeAddress: 'Kathmandu, Nepal',
      applicationDate: '2026-05-15',
      status: 'pending',
      kycDocuments: {
        documentType: 'citizenship',
        documentNumber: '1234567890',
        frontImage: 'https://via.placeholder.com/400x300?text=Citizenship+Front',
        backImage: 'https://via.placeholder.com/400x300?text=Citizenship+Back',
        selfieImage: 'https://via.placeholder.com/400x300?text=Selfie'
      },
      bankDetails: {
        bankName: 'Nepal Bank Limited',
        accountHolder: 'Tech Haven Pvt Ltd',
        accountNumber: '9876543210',
        ifscCode: 'NRBL0001'
      }
    },
    {
      id: 2,
      vendorName: 'Fashion Hub Boutique',
      vendorEmail: 'vendor2@example.com',
      vendorPhone: '+977-9842234567',
      storeName: 'Fashion Hub',
      storeDescription: 'Latest fashion collections, clothing, and accessories for all seasons',
      storeAddress: 'Pokhara, Nepal',
      applicationDate: '2026-05-18',
      status: 'pending',
      kycDocuments: {
        documentType: 'passport',
        documentNumber: 'PA123456789',
        frontImage: 'https://via.placeholder.com/400x300?text=Passport+Front',
        backImage: 'https://via.placeholder.com/400x300?text=Passport+Back',
        selfieImage: 'https://via.placeholder.com/400x300?text=Selfie'
      },
      bankDetails: {
        bankName: 'Standard Chartered Bank',
        accountHolder: 'Fashion Hub Stores',
        accountNumber: '1122334455',
        ifscCode: 'SCBL0001'
      }
    },
    {
      id: 3,
      vendorName: 'Home Essentials',
      vendorEmail: 'vendor3@example.com',
      vendorPhone: '+977-9843234567',
      storeName: 'Home Essentials',
      storeDescription: 'Quality home furnishings and household essentials',
      storeAddress: 'Lalitpur, Nepal',
      applicationDate: '2026-05-10',
      status: 'approved',
      kycDocuments: {
        documentType: 'driving_license',
        documentNumber: 'DL9876543210',
        frontImage: 'https://via.placeholder.com/400x300?text=License+Front',
        backImage: 'https://via.placeholder.com/400x300?text=License+Back',
        selfieImage: 'https://via.placeholder.com/400x300?text=Selfie'
      },
      bankDetails: {
        bankName: 'Nepal Investment Bank',
        accountHolder: 'Home Essentials Ltd',
        accountNumber: '5566778899',
        ifscCode: 'NIBL0001'
      }
    },
    {
      id: 4,
      vendorName: 'Sports Gear Pro',
      vendorEmail: 'vendor4@example.com',
      vendorPhone: '+977-9844234567',
      storeName: 'Sports Gear Pro',
      storeDescription: 'Professional sports equipment and athletic gear',
      storeAddress: 'Bhaktapur, Nepal',
      applicationDate: '2026-05-08',
      status: 'rejected',
      rejectionReason: 'Incomplete KYC documents. Bank details do not match vendor information.',
      kycDocuments: {
        documentType: 'pan_card',
        documentNumber: 'PAN1234567890',
        frontImage: 'https://via.placeholder.com/400x300?text=PAN+Card',
        backImage: 'https://via.placeholder.com/400x300?text=PAN+Back',
        selfieImage: 'https://via.placeholder.com/400x300?text=Selfie'
      },
      bankDetails: {
        bankName: 'Himalayan Bank',
        accountHolder: 'Sports Gear',
        accountNumber: '2233445566',
        ifscCode: 'HMBL0001'
      }
    }
  ]);

  const [selectedApp, setSelectedApp] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Filter applications by status
  const filteredApps = applications.filter(app => app.status === filterStatus);

  // Handle approve
  const handleApprove = (id) => {
    setApplications(
      applications.map(app =>
        app.id === id ? { ...app, status: 'approved' } : app
      )
    );
    setSelectedApp(null);
  };

  // Handle reject
  const handleReject = (id) => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }
    setApplications(
      applications.map(app =>
        app.id === id
          ? { ...app, status: 'rejected', rejectionReason }
          : app
      )
    );
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedApp(null);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✕';
      default:
        return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vendor Applications</h1>
          <p className="text-gray-600">Review and manage vendor registration applications</p>
        </div>

        {/* Status Filters */}
        <div className="flex gap-3 mb-8">
          {['pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setSelectedApp(null);
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({filteredApps.length})
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {filteredApps.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No {filterStatus} applications</p>
                  </div>
                ) : (
                  filteredApps.map(app => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                        selectedApp?.id === app.id
                          ? 'border-l-blue-600 bg-blue-50'
                          : 'border-l-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 truncate">{app.storeName}</p>
                          <p className="text-sm text-gray-600 truncate">{app.vendorName}</p>
                          <p className="text-xs text-gray-500 mt-1">{app.applicationDate}</p>
                        </div>
                        <span className={`text-lg ml-2 ${
                          app.status === 'approved' ? 'text-green-600' :
                          app.status === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {getStatusIcon(app.status)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2">
            {selectedApp ? (
              <div className="space-y-4">
                {/* Store Information */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Store Information</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedApp.status)}`}>
                      {selectedApp.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600">Store Name</label>
                      <p className="text-gray-900 font-semibold">{selectedApp.storeName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Description</label>
                      <p className="text-gray-900">{selectedApp.storeDescription}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Address</label>
                        <p className="text-gray-900">{selectedApp.storeAddress}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Application Date</label>
                        <p className="text-gray-900">{selectedApp.applicationDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vendor Information */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Vendor Name</label>
                        <p className="text-gray-900">{selectedApp.vendorName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="text-gray-900">{selectedApp.vendorEmail}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedApp.vendorPhone}</p>
                    </div>
                  </div>
                </div>

                {/* KYC Documents */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Documents</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600">Document Type</label>
                      <p className="text-gray-900 capitalize">{selectedApp.kycDocuments.documentType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Document Number</label>
                      <p className="text-gray-900">{selectedApp.kycDocuments.documentNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-3">Document Images</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={selectedApp.kycDocuments.frontImage}
                            alt="Document Front"
                            className="w-full h-32 object-cover"
                          />
                          <p className="text-xs text-center text-gray-600 p-1 bg-gray-50">Front</p>
                        </div>
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={selectedApp.kycDocuments.backImage}
                            alt="Document Back"
                            className="w-full h-32 object-cover"
                          />
                          <p className="text-xs text-center text-gray-600 p-1 bg-gray-50">Back</p>
                        </div>
                        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={selectedApp.kycDocuments.selfieImage}
                            alt="Selfie"
                            className="w-full h-32 object-cover"
                          />
                          <p className="text-xs text-center text-gray-600 p-1 bg-gray-50">Selfie</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Bank Name</label>
                        <p className="text-gray-900">{selectedApp.bankDetails.bankName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Account Holder</label>
                        <p className="text-gray-900">{selectedApp.bankDetails.accountHolder}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Account Number</label>
                        <p className="text-gray-900">{selectedApp.bankDetails.accountNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">IFSC Code</label>
                        <p className="text-gray-900">{selectedApp.bankDetails.ifscCode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons or Status Message */}
                {selectedApp.status === 'pending' ? (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Decision</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedApp.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                      >
                        ✓ Approve Application
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
                      >
                        ✕ Reject Application
                      </button>
                    </div>
                  </div>
                ) : selectedApp.status === 'approved' ? (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                    <p className="text-green-800 font-semibold">✓ Application Approved</p>
                    <p className="text-green-700 text-sm mt-2">This vendor has been approved and can start selling.</p>
                  </div>
                ) : (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                    <p className="text-red-800 font-semibold">✕ Application Rejected</p>
                    <p className="text-red-700 text-sm mt-2"><strong>Reason:</strong> {selectedApp.rejectionReason}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg">Select an application to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject Application</h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting <strong>{selectedApp?.storeName}</strong>
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedApp.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorApplicationReview;
