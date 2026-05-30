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

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Vendor.deleteMany({});
    await User.deleteMany({});

    // Create sample user
    const user = await User.create({
      name: "John Seller",
      email: "seller@example.com",
      password: "hashed_password",
      role: "vendor",
    });

    // Create sample vendor
    const vendor = await Vendor.create({
      user: user._id,
      storeName: "Tech Store",
      storeSlug: "tech-store",
      storeDescription: "Premium electronics and gadgets",
      approvalStatus: "approved",
    });

    // Create sample categories
    const categories = await Category.create([
      { name: "Electronics", slug: "electronics" },
      { name: "Clothing", slug: "clothing" },
      { name: "Accessories", slug: "accessories" },
    ]);

    // Create sample products
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
        images: ["https://via.placeholder.com/400x400?text=iPhone+15"],
        thumbnail: "https://via.placeholder.com/400x400?text=iPhone+15",
        stock: 25,
        status: "active",
        isActive: true,
        isFeatured: true,
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
        images: ["https://via.placeholder.com/400x400?text=Galaxy+S24"],
        thumbnail: "https://via.placeholder.com/400x400?text=Galaxy+S24",
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
        images: ["https://via.placeholder.com/400x400?text=Sony+Headphones"],
        thumbnail: "https://via.placeholder.com/400x400?text=Sony+Headphones",
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
        images: ["https://via.placeholder.com/400x400?text=iPad+Air"],
        thumbnail: "https://via.placeholder.com/400x400?text=iPad+Air",
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
        images: ["https://via.placeholder.com/400x400?text=T-Shirt"],
        thumbnail: "https://via.placeholder.com/400x400?text=T-Shirt",
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
        images: ["https://via.placeholder.com/400x400?text=Jeans"],
        thumbnail: "https://via.placeholder.com/400x400?text=Jeans",
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
        images: ["https://via.placeholder.com/400x400?text=Wallet"],
        thumbnail: "https://via.placeholder.com/400x400?text=Wallet",
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
        images: ["https://via.placeholder.com/400x400?text=Smartwatch"],
        thumbnail: "https://via.placeholder.com/400x400?text=Smartwatch",
        stock: 45,
        status: "active",
        isActive: true,
      },
      {
        vendor: vendor._id,
        category: categories[0]._id,
        name: "USB-C Cable",
        slug: "usb-c-cable",
        description: "High-quality USB-C charging cable",
        shortDescription: "Essential accessory",
        price: 599,
        compareAtPrice: 799,
        sku: "SKU-009",
        images: ["https://via.placeholder.com/400x400?text=USB-C+Cable"],
        thumbnail: "https://via.placeholder.com/400x400?text=USB-C+Cable",
        stock: 200,
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
        sku: "SKU-010",
        images: ["https://via.placeholder.com/400x400?text=Power+Bank"],
        thumbnail: "https://via.placeholder.com/400x400?text=Power+Bank",
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
        sku: "SKU-011",
        images: ["https://via.placeholder.com/400x400?text=Wireless+Mouse"],
        thumbnail: "https://via.placeholder.com/400x400?text=Wireless+Mouse",
        stock: 90,
        status: "active",
        isActive: true,
      },
      {
        vendor: vendor._id,
        category: categories[0]._id,
        name: "Mechanical Keyboard",
        slug: "mechanical-keyboard",
        description: "RGB mechanical keyboard for gaming and typing",
        shortDescription: "Gaming keyboard",
        price: 4999,
        compareAtPrice: 6999,
        sku: "SKU-012",
        images: ["https://via.placeholder.com/400x400?text=Keyboard"],
        thumbnail: "https://via.placeholder.com/400x400?text=Keyboard",
        stock: 50,
        status: "active",
        isActive: true,
      },
    ]);

    console.log(`✅ Seeded database with:`);
    console.log(`   - 1 User`);
    console.log(`   - 1 Vendor`);
    console.log(`   - 3 Categories`);
    console.log(`   - ${products.length} Products`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
