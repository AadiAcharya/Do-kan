const Order = require("../models/Order");
const mongoose = require("mongoose");

const PERIOD_CONFIG = {
  "7d": { days: 7, format: "%Y-%m-%d" },
  "30d": { days: 30, format: "%Y-%m-%d" },
  "90d": { days: 90, format: "%Y-%m-%d" },
  "12m": { days: 365, format: "%Y-%m" },
};

function getStartDate(period) {
  const config = PERIOD_CONFIG[period] || PERIOD_CONFIG["30d"];
  return {
    startDate: new Date(Date.now() - config.days * 24 * 60 * 60 * 1000),
    format: config.format,
  };
}

function fillGaps(data, startDate, format) {
  const map = {};
  data.forEach((d) => { map[d.date] = d; });

  const result = [];
  const cursor = new Date(startDate);
  const now = new Date();

  if (format === "%Y-%m") {
    cursor.setDate(1);
    while (cursor <= now) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      result.push(map[key] || { date: key, revenue: 0, orders: 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      result.push(map[key] || { date: key, revenue: 0, orders: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return result;
}

/**
 * Admin platform revenue over time (paid orders).
 */
exports.getAdminRevenue = async (period = "30d") => {
  const { startDate, format } = getStartDate(period);

  const data = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $addFields: { dateField: { $ifNull: ["$paidAt", "$createdAt"] } } },
    { $match: { dateField: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format, date: "$dateField" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", revenue: 1, orders: 1 } },
  ]);

  return fillGaps(data, startDate, format);
};

/**
 * Vendor revenue over time (sum of their line items in paid orders).
 */
exports.getVendorRevenue = async (vendorId, period = "30d") => {
  const { startDate, format } = getStartDate(period);
  const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

  const data = await Order.aggregate([
    { $match: { paymentStatus: "paid", "items.vendor": vendorObjectId } },
    { $unwind: "$items" },
    { $match: { "items.vendor": vendorObjectId } },
    { $addFields: { dateField: { $ifNull: ["$paidAt", "$createdAt"] } } },
    { $match: { dateField: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format, date: "$dateField" } },
        revenue: { $sum: "$items.totalPrice" },
        orders: { $addToSet: "$_id" },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        revenue: 1,
        orders: { $size: "$orders" },
      },
    },
  ]);

  return fillGaps(data, startDate, format);
};
