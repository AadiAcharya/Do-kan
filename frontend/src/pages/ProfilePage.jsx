import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import {
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../services/api";

const EMPTY_ADDRESS = {
  label: "home",
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Nepal",
  isDefault: false,
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState("password");

  // Password state
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Address state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [addressError, setAddressError] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    setPwLoading(true);
    try {
      const data = await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      if (!data.success) {
        setPwError(data.message || "Failed to change password.");
        return;
      }
      setPwSuccess("Password updated successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setPwError("Server error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const openAddAddress = () => {
    setAddressForm({ ...EMPTY_ADDRESS, fullName: user?.name || "", phone: user?.phone || "" });
    setEditingAddressId(null);
    setAddressError("");
    setShowAddressForm(true);
  };

  const openEditAddress = (addr) => {
    setAddressForm({
      label: addr.label || "home",
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country || "Nepal",
      isDefault: addr.isDefault,
    });
    setEditingAddressId(addr._id);
    setAddressError("");
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    setAddressError("");
    try {
      const data = editingAddressId
        ? await updateAddress(editingAddressId, addressForm)
        : await addAddress(addressForm);
      if (!data.success) {
        setAddressError(data.message || "Failed to save address.");
        return;
      }
      await refreshUser();
      setShowAddressForm(false);
    } catch {
      setAddressError("Server error. Please try again.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Remove this address?")) return;
    const data = await deleteAddress(id);
    if (data.success) await refreshUser();
  };

  const addresses = user?.addresses || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline mb-4">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
        <p className="text-sm text-gray-500 mb-6">{user?.name} · {user?.email}</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "password", label: "Change Password" },
            { key: "addresses", label: "Saved Addresses" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm px-4 py-2 rounded-lg font-medium transition ${
                tab === t.key ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Password tab */}
        {tab === "password" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Password</h2>
            {pwError && <p className="text-red-500 text-sm mb-3">{pwError}</p>}
            {pwSuccess && <p className="text-green-600 text-sm mb-3">{pwSuccess}</p>}
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              {[
                { key: "currentPassword", label: "Current Password", type: "password" },
                { key: "newPassword", label: "New Password", type: "password" },
                { key: "confirmPassword", label: "Confirm New Password", type: "password" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={pwForm[key]}
                    onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={pwLoading}
                className="bg-blue-600 text-white text-sm px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {pwLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}

        {/* Addresses tab */}
        {tab === "addresses" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Saved Addresses</h2>
              <button onClick={openAddAddress}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                + Add Address
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddressSubmit} className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">{editingAddressId ? "Edit Address" : "New Address"}</h3>
                {addressError && <p className="text-red-500 text-sm mb-3">{addressError}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                    <select value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {[
                    { key: "fullName", label: "Full Name" },
                    { key: "phone", label: "Phone" },
                    { key: "street", label: "Street Address", col: 2 },
                    { key: "city", label: "City" },
                    { key: "state", label: "State/Province" },
                    { key: "postalCode", label: "Postal Code" },
                    { key: "country", label: "Country" },
                  ].map(({ key, label, col }) => (
                    <div key={key} className={col === 2 ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                      <input value={addressForm[key]} onChange={(e) => setAddressForm({ ...addressForm, [key]: e.target.value })}
                        required={key !== "country"}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                  ))}
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="isDefault" checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="rounded" />
                    <label htmlFor="isDefault" className="text-sm text-gray-600">Set as default address</label>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="submit" disabled={addressLoading}
                    className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60">
                    {addressLoading ? "Saving..." : editingAddressId ? "Update" : "Save"}
                  </button>
                  <button type="button" onClick={() => setShowAddressForm(false)}
                    className="text-sm px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-100">Cancel</button>
                </div>
              </form>
            )}

            {addresses.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No saved addresses yet.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div key={addr._id} className="border border-gray-100 rounded-xl p-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase text-gray-500">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{addr.fullName}</p>
                      <p className="text-sm text-gray-600">{addr.street}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p className="text-sm text-gray-500">{addr.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditAddress(addr)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDeleteAddress(addr._id)} className="text-xs text-red-500 hover:underline font-medium">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
