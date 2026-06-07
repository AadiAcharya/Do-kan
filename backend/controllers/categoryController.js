const Category = require("../models/Category");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("-__v")
      .populate("parent", "name slug")
      .sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching categories." });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id).populate("parent", "name slug");
    if (!cat) return res.status(404).json({ success: false, message: "Category not found." });
    res.status(200).json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching category." });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, parent, displayOrder } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required." });
    if (parent) {
      const p = await Category.findById(parent);
      if (!p) return res.status(400).json({ success: false, message: "Parent not found." });
      if (p.parent) return res.status(400).json({ success: false, message: "Max nesting depth is 2." });
    }
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    const cat = await Category.create({ name, slug, description, image, parent: parent || null, displayOrder });
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: "Category already exists." });
    res.status(500).json({ success: false, message: "Error creating category." });
  }
};
