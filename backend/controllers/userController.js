const User = require("../models/User");

/**
 * PUT /api/users/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, message: "Profile updated.", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not update profile." });
  }
};

/**
 * PUT /api/users/password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    }

    const user = await User.findById(req.user._id);
    if (!user.password) {
      return res.status(400).json({ success: false, message: "Password change not available for this account." });
    }

    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not change password." });
  }
};

/**
 * POST /api/users/addresses
 */
exports.addAddress = async (req, res) => {
  try {
    const { label, fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;
    if (!fullName || !phone || !street || !city || !state || !postalCode) {
      return res.status(400).json({ success: false, message: "All address fields are required." });
    }

    const user = await User.findById(req.user._id);
    const address = { label, fullName, phone, street, city, state, postalCode, country: country || "Nepal", isDefault: !!isDefault };

    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((a) => { a.isDefault = false; });
      address.isDefault = true;
    }

    user.addresses.push(address);
    await user.save();
    res.status(201).json({ success: true, message: "Address added.", data: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not add address." });
  }
};

/**
 * PUT /api/users/addresses/:addressId
 */
exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found." });
    }

    const fields = ["label", "fullName", "phone", "street", "city", "state", "postalCode", "country", "isDefault"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) address[f] = req.body[f];
    });

    if (req.body.isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
      address.isDefault = true;
    }

    await user.save();
    res.status(200).json({ success: true, message: "Address updated.", data: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not update address." });
  }
};

/**
 * DELETE /api/users/addresses/:addressId
 */
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found." });
    }

    const wasDefault = address.isDefault;
    address.deleteOne();
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.status(200).json({ success: true, message: "Address removed.", data: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not delete address." });
  }
};
