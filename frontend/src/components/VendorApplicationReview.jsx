import React, { useState, useEffect, useCallback } from "react";

const API = "http://localhost:3001/api";

const VendorApplicationReview = ({ token }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchVendors = useCallback(
    async (status) => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/admin/vendors?status=${status}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setVendors(data.data);
          if (data.data.length > 0) setSelectedVendor(data.data[0]);
          else setSelectedVendor(null);
        }
      } catch {
        setVendors([]);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchVendors(activeFilter);
  }, [activeFilter, fetchVendors]);

  const handleApprove = async (vendorId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/admin/vendors/${vendorId}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Vendor approved successfully.");
        fetchVendors(activeFilter);
      }
    } catch {
      setMessage("❌ Failed to approve vendor.");
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleReject = async (vendorId) => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/admin/vendors/${vendorId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("❌ Vendor rejected.");
        setRejectModal(false);
        setRejectReason("");
        fetchVendors(activeFilter);
      }
    } catch {
      setMessage("Failed to reject vendor.");
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const filters = ["pending", "approved", "rejected"];

  return (
    <div className="flex gap-6 h-full">
      {/* Left: List */}
      <div className="w-72 flex-shrink-0">
        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md capitalize transition ${
                activeFilter === f
                  ? "bg-white shadow text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {message && (
          <div className="mb-3 text-sm bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-lg">
            {message}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
        ) : vendors.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No {activeFilter} applications.
          </p>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[600px]">
            {vendors.map((v) => (
              <div
                key={v._id}
                onClick={() => setSelectedVendor(v)}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  selectedVendor?._id === v._id
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-100 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {v.storeName}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
                      v.approvalStatus === "approved"
                        ? "bg-green-100 text-green-700"
                        : v.approvalStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {v.approvalStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {v.user?.email}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(v.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Detail */}
      <div className="flex-1">
        {!selectedVendor ? (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Select an application to view details
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedVendor.storeName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedVendor.storeDescription ||
                    "No description provided."}
                </p>
              </div>
              {selectedVendor.approvalStatus === "pending" && (
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleApprove(selectedVendor._id)}
                    disabled={actionLoading}
                    className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60"
                  >
                    {actionLoading ? "..." : "Approve"}
                  </button>
                  <button
                    onClick={() => setRejectModal(true)}
                    disabled={actionLoading}
                    className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}
              {selectedVendor.approvalStatus === "approved" && (
                <span className="bg-green-100 text-green-700 text-sm px-4 py-2 rounded-lg font-semibold">
                  ✓ Approved
                </span>
              )}
              {selectedVendor.approvalStatus === "rejected" && (
                <span className="bg-red-100 text-red-700 text-sm px-4 py-2 rounded-lg font-semibold">
                  ✗ Rejected
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Info */}
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h4 className="font-semibold text-gray-700 text-sm mb-3">
                  Store Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Store Name</span>
                    <span className="font-medium">
                      {selectedVendor.storeName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Slug</span>
                    <span className="font-medium text-blue-600">
                      {selectedVendor.storeSlug}
                    </span>
                  </div>
                  {selectedVendor.storeAddress && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address</span>
                      <span className="font-medium">
                        {selectedVendor.storeAddress}
                      </span>
                    </div>
                  )}
                  {selectedVendor.storePhone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium">
                        {selectedVendor.storePhone}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Applied</span>
                    <span className="font-medium">
                      {new Date(selectedVendor.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vendor Info */}
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h4 className="font-semibold text-gray-700 text-sm mb-3">
                  Vendor Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium">
                      {selectedVendor.user?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium">
                      {selectedVendor.user?.email}
                    </span>
                  </div>
                  {selectedVendor.user?.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium">
                        {selectedVendor.user.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Joined</span>
                    <span className="font-medium">
                      {selectedVendor.user?.createdAt
                        ? new Date(
                            selectedVendor.user.createdAt,
                          ).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* KYC Documents */}
              {selectedVendor.kyc?.documentType && (
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <h4 className="font-semibold text-gray-700 text-sm mb-3">
                    KYC Documents
                  </h4>
                  <p className="text-xs text-gray-500 mb-3 capitalize">
                    Type: {selectedVendor.kyc.documentType} · #
                    {selectedVendor.kyc.documentNumber}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Front", src: selectedVendor.kyc.frontImage },
                      { label: "Back", src: selectedVendor.kyc.backImage },
                      { label: "Selfie", src: selectedVendor.kyc.selfie },
                    ].map(
                      ({ label, src }) =>
                        src && (
                          <div key={label} className="text-center">
                            <img
                              src={src}
                              alt={label}
                              className="w-full h-20 object-cover rounded-lg border border-gray-100 mb-1"
                            />
                            <p className="text-xs text-gray-400">{label}</p>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}

              {/* Bank Details */}
              {selectedVendor.bankDetails?.bankName && (
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <h4 className="font-semibold text-gray-700 text-sm mb-3">
                    Bank Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bank</span>
                      <span className="font-medium">
                        {selectedVendor.bankDetails.bankName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Name</span>
                      <span className="font-medium">
                        {selectedVendor.bankDetails.accountHolderName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account No.</span>
                      <span className="font-medium">
                        {selectedVendor.bankDetails.accountNumber}
                      </span>
                    </div>
                    {selectedVendor.bankDetails.ifscCode && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">IFSC</span>
                        <span className="font-medium">
                          {selectedVendor.bankDetails.ifscCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection reason if rejected */}
              {selectedVendor.approvalStatus === "rejected" &&
                selectedVendor.rejectionReason && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100 md:col-span-2">
                    <h4 className="font-semibold text-red-700 text-sm mb-1">
                      Rejection Reason
                    </h4>
                    <p className="text-sm text-red-600">
                      {selectedVendor.rejectionReason}
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-900 mb-1">
              Reject Vendor Application
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason. This will be recorded against the
              application.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="e.g. Incomplete KYC documents, invalid business address..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleReject(selectedVendor._id)}
                disabled={!rejectReason.trim() || actionLoading}
                className="flex-1 bg-red-500 text-white text-sm py-2.5 rounded-xl font-semibold hover:bg-red-600 transition disabled:opacity-60"
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
              <button
                onClick={() => {
                  setRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 border border-gray-200 text-gray-700 text-sm py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorApplicationReview;
