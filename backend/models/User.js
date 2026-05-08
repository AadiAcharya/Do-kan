const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema({
  label: { type: String, enum: ["home", "work", "other"], default: "home" },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: "Nepal" },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    password: { type: String, minlength: 6 }, // null for OAuth users
    avatar: { type: String }, // Cloudinary URL
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },

    // Verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // OAuth
    googleId: String,
    facebookId: String,
    githubId: String,

    // Password Reset
    passwordResetToken: String,
    passwordResetExpires: Date,

    // 2FA
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,

    // Account Status
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    bannedReason: String,
    bannedAt: Date,

    addresses: [addressSchema],

    // Refresh token for JWT rotation
    refreshToken: String,

    lastLoginAt: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.twoFactorSecret;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  return obj;
};

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);