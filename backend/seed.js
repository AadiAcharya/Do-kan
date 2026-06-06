const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product");
const Category = require("./models/Category");
const Vendor = require("./models/Vendor");
const User = require("./models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dokan";

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    await Product.deleteMany({});
    await Category.deleteMany({});
    await Vendor.deleteMany({});
    await User.deleteMany({});

    // Admin user (role set directly — not through registration)
    const admin = await User.create({
      name: "DOKAN Admin",
      email: "admin@dokan.com",
      password: "admin123",
      role: "admin",
      isEmailVerified: true,
    });

    // Vendor user
    const vendorUser = await User.create({
      name: "John Seller",
      email: "seller@dokan.com",
      password: "seller123",
      role: "vendor",
      isEmailVerified: true,
    });

    // Sample customer
    await User.create({
      name: "Jane Customer",
      email: "customer@dokan.com",
      password: "customer123",
      role: "customer",
      isEmailVerified: true,
    });

    // Approved vendor
    const vendor = await Vendor.create({
      user: vendorUser._id,
      storeName: "Tech Store",
      storeSlug: "tech-store",
      storeDescription: "Premium electronics and gadgets",
      approvalStatus: "approved",
    });

    // Pending vendor application (for admin to review)
    const pendingUser = await User.create({
      name: "Fashion Owner",
      email: "fashion@dokan.com",
      password: "fashion123",
      role: "customer",
    });
    await Vendor.create({
      user: pendingUser._id,
      storeName: "Fashion Hub",
      storeSlug: "fashion-hub",
      storeDescription: "Latest fashion collections",
      storeAddress: "Pokhara, Nepal",
      storePhone: "+977-9842234567",
      approvalStatus: "pending",
      kyc: {
        documentType: "citizenship",
        documentNumber: "1234567890",
        frontImage:
          "https://via.placeholder.com/400x300?text=Citizenship+Front",
        backImage: "https://via.placeholder.com/400x300?text=Citizenship+Back",
        selfie: "https://via.placeholder.com/400x300?text=Selfie",
      },
      bankDetails: {
        bankName: "Standard Chartered Bank",
        accountHolderName: "Fashion Hub Stores",
        accountNumber: "1122334455",
        ifscCode: "SCBL0001",
      },
    });

    // Categories
    const categories = await Category.create([
      { name: "Electronics", slug: "electronics" },
      { name: "Clothing", slug: "clothing" },
      { name: "Accessories", slug: "accessories" },
    ]);

    // Products
    const products = await Product.create([
      {
        vendor: vendor._id,
        category: categories[0]._id,
        name: "iPhone 15 Pro Max",
        slug: "iphone-15-pro-max",
        description: "Latest Apple flagship smartphone with advanced features",
        shortDescription: "Premium smartphone",
        price: 159999,
        compareAtPrice: 179999,
        sku: "SKU-001",
        images: [
          "https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=400&fit=crop",
        ],
        thumbnail:
          "https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=400&fit=crop",
        stock: 25,
        status: "active",
        isActive: true,
      },
      {
        vendor: vendor._id,
        category: categories[0]._id,
        name: "Samsung Galaxy S24",
        slug: "samsung-galaxy-s24",
        description: "Powerful Android smartphone with great display",
        shortDescription: "Android flagship",
        price: 89999,
        compareAtPrice: 99999,
        sku: "SKU-002",
        images: [
          "https://images.unsplash.com/photo-1512941691920-25bda36dc643?w=400&h=400&fit=crop",
        ],
        thumbnail:
          "https://images.unsplash.com/photo-1512941691920-25bda36dc643?w=400&h=400&fit=crop",
        stock: 40,
        status: "active",
        isActive: true,
      },
      {
        vendor: vendor._id,
        category: categories[0]._id,
        name: "Sony WH-1000XM5 Headphones",
        slug: "sony-wh1000xm5",
        description: "Noise-canceling wireless headphones",
        shortDescription: "Premium headphones",
        price: 29999,
        compareAtPrice: 34999,
        sku: "SKU-003",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        ],
        thumbnail:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        stock: 60,
        status: "active",
        isActive: true,
      },
      {
        vendor: vendor._id,
        category: categories[0]._id,
        name: "iPad Air",
        slug: "ipad-air",
        description: "Versatile tablet for work and entertainment",
        shortDescription: "Premium tablet",
        price: 79999,
        compareAtPrice: 89999,
        sku: "SKU-004",
        images: [
          "https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=400&h=400&fit=crop",
        ],
        thumbnail:
          "https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=400&h=400&fit=crop",
        stock: 30,
        status: "active",
        isActive: true,
      },
      {
        vendor: vendor._id,
        category: categories[1]._id,
        name: "Cotton T-Shirt",
        slug: "cotton-tshirt",
        description: "Comfortable 100% cotton t-shirt",
        shortDescription: "Casual wear",
        price: 699,
        compareAtPrice: 899,
        sku: "SKU-005",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        ],
        thumbnail:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        stock: 150,
        status: "active",
        isActive: true,
      },
      {
        vendor: vendor._id,
        category: categories[1]._id,
        name: "Denim Jeans",
        slug: "denim-jeans",
        description: "Classic blue denim jeans",
        shortDescription: "Durable jeans",
        price: 1799,
        compareAtPrice: 2299,
        sku: "SKU-006",
        images: [
          "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400&h=400&fit=crop",
        ],
        thumbnail:
          "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=400&h=400&fit=crop",
        stock: 80,
        status: "active",
        isActive: true,
      },
      {
        vendor: vendor._id,
        category: categories[2]._id,
        name: "Leather Wallet",
        slug: "leather-wallet",
        description: "Genuine leather wallet with multiple compartments",
        shortDescription: "Premium wallet",
        price: 2999,
        compareAtPrice: 3999,
        sku: "SKU-007",
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
        ],
        thumbnail:
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
        stock: 100,
        status: "active",
        isActive: true,
      },
      {
        vendor: vendor._id,
        category: categories[2]._id,
        name: "Smartwatch",
        slug: "smartwatch",
        description: "Feature-rich smartwatch with health tracking",
        shortDescription: "Smart wearable",
        price: 19999,
        compareAtPrice: 24999,
        sku: "SKU-008",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        ],
        thumbnail:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        stock: 45,
        status: "active",
        isActive: true,
      },
      {
        vendor: vendor._id,
        category: categories[0]._id,
        name: "Portable Power Bank",
        slug: "portable-power-bank",
        description: "20000mAh fast charging power bank",
        shortDescription: "Power bank",
        price: 1999,
        compareAtPrice: 2499,
        sku: "SKU-009",
        images: [
          "https://images.unsplash.com/photo-1590584473555-42072f3be51d?w=400&h=400&fit=crop",
        ],
        thumbnail:
          "https://images.unsplash.com/photo-1590584473555-42072f3be51d?w=400&h=400&fit=crop",
        stock: 120,
        status: "active",
        isActive: true,
      },
      {
        vendor: vendor._id,
        category: categories[0]._id,
        name: "Wireless Mouse",
        slug: "wireless-mouse",
        description: "Ergonomic wireless mouse for productivity",
        shortDescription: "Computer accessory",
        price: 1499,
        compareAtPrice: 1999,
        sku: "SKU-010",
        images: [
          "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
        ],
        thumbnail:
          "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
        stock: 90,
        status: "active",
        isActive: true,
      },
    ]);

    console.log(" Seeded database:");
    console.log("   👤 Admin:    admin@dokan.com    / admin123");
    console.log("   🏪 Vendor:   seller@dokan.com   / seller123");
    console.log("   🛍️  Customer: customer@dokan.com / customer123");
    console.log(`   📦 ${products.length} Products, 3 Categories`);
    console.log("   ⏳ 1 pending vendor application (Fashion Hub)");
    process.exit(0);
  } catch (error) {
    console.error(" Seed error:", error);
    process.exit(1);
  }
};

seedData();
