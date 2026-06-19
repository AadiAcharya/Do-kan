import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchProductReviews, fetchMyReview, submitReview, updateReview, deleteReview } from "../services/api";
import StarRating from "./StarRating";

export default function ProductReviews({ productId, productRating, reviewCount }) {
  const { isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const data = await fetchProductReviews(productId);
    if (data.success) {
      setReviews(data.data || []);
      setDistribution(data.distribution || []);
    }
    if (isLoggedIn) {
      const mine = await fetchMyReview(productId);
      if (mine.success && mine.data) {
        setMyReview(mine.data);
        setForm({ rating: mine.data.rating, title: mine.data.title || "", comment: mine.data.comment || "" });
      }
    }
    setLoading(false);
  }, [productId, isLoggedIn]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const data = editing
        ? await updateReview(myReview._id, form)
        : await submitReview({ productId, ...form });
      if (!data.success) {
        setFormError(data.message || "Failed to submit review.");
        return;
      }
      setMyReview(data.data);
      setShowForm(false);
      setEditing(false);
      await loadReviews();
    } catch {
      setFormError("Server error.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your review?")) return;
    const data = await deleteReview(myReview._id);
    if (data.success) {
      setMyReview(null);
      setForm({ rating: 5, title: "", comment: "" });
      await loadReviews();
    }
  };

  const totalReviews = distribution.reduce((s, d) => s + d.count, 0) || reviewCount || 0;

  return (
    <div className="mt-12 border-t border-gray-100 pt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-8 mb-8">
        <div className="text-center sm:text-left">
          <p className="text-4xl font-bold text-gray-900">{productRating?.toFixed(1) || "0.0"}</p>
          <StarRating rating={productRating || 0} size="lg" />
          <p className="text-sm text-gray-500 mt-1">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution.find((d) => d._id === star)?.count || 0;
            const pct = totalReviews ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-gray-500">{star}★</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-gray-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write review */}
      {isLoggedIn && !myReview && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="mb-6 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          Write a Review
        </button>
      )}

      {isLoggedIn && myReview && !showForm && (
        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Your review</p>
            <StarRating rating={myReview.rating} />
            {myReview.title && <p className="text-sm font-semibold mt-1">{myReview.title}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setEditing(true); setShowForm(true); }}
              className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
            <button onClick={handleDelete}
              className="text-xs text-red-500 hover:underline font-medium">Delete</button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">{editing ? "Edit Review" : "Write a Review"}</h3>
          {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
            <StarRating rating={form.rating} interactive onChange={(r) => setForm({ ...form, rating: r })} />
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Title (optional)</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Comment</label>
            <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
              rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={formLoading}
              className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60">
              {formLoading ? "Submitting..." : editing ? "Update" : "Submit"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(false); }}
              className="text-sm px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-100">Cancel</button>
          </div>
        </form>
      )}

      {/* Review list */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {r.user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.user?.name || "Customer"}</p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <StarRating rating={r.rating} size="sm" />
              </div>
              {r.isVerifiedPurchase && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Verified Purchase</span>
              )}
              {r.title && <p className="font-semibold text-sm text-gray-800 mt-2">{r.title}</p>}
              {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
