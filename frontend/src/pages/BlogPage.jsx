import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BlogPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (email.trim() === "") {
      alert("Please enter your email");
    } else {
      alert("Thank you for subscribing!");
      setEmail("");
    }
  };

  const blogArticles = [
    {
      id: 1,
      title: "How to Build a Capsule Wardrobe",
      category: "Fashion",
      description:
        "Learn how to create a stylish and minimal wardrobe with timeless fashion pieces.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop",
    },
    {
      id: 2,
      title: "Shopping Smarter Save Without Stress",
      category: "Shopping",
      description:
        "Smart shopping techniques that help you save money while buying quality products.",
      image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&h=300&fit=crop",
    },
    {
      id: 3,
      title: "Spring 2026 Color Palettes to Watch",
      category: "Trends",
      description:
        "Explore the most popular color combinations and trends for modern outfits.",
      image: "https://images.unsplash.com/photo-1517816131977-84ee28caeb82?w=500&h=300&fit=crop",
    },
    {
      id: 4,
      title: "Sustainable Style Eco-Friendly Brands",
      category: "Sustainability",
      description:
        "Fashion brands are moving towards sustainability and eco-friendly materials.",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=300&fit=crop",
    },
    {
      id: 5,
      title: "The Ultimate Sneaker Buying Guide",
      category: "Sneakers",
      description:
        "A complete guide for choosing stylish and comfortable sneakers for daily wear.",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=300&fit=crop",
    },
    {
      id: 6,
      title: "Accessories Like A Pro 2026 Edition",
      category: "Accessories",
      description:
        "Discover watches, bags and jewelry styling tips to improve your fashion look.",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=300&fit=crop",
    },
  ];

  const categories = [
    "All",
    "Fashion",
    "Lifestyle",
    "Shopping",
    "Trends",
    "Guides",
    "Sustainability",
  ];

  return (
    <div className="bg-gray-50">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div
            className="text-2xl font-bold text-blue-600 cursor-pointer"
            onClick={() => navigate("/")}
          >
            DOKAN
          </div>
          <div className="hidden md:flex gap-8">
            <button
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Shop
            </button>
            <button className="text-blue-600 font-semibold">Blog</button>
            <button
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-blue-600 transition"
            >
              About
            </button>
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-gray-700 text-sm w-40"
            />
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative bg-gray-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-red-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <p className="text-gray-400 text-sm mb-4">Home / Blog</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Blog</h1>
          <p className="text-gray-300 max-w-2xl text-lg leading-relaxed">
            Explore tips, trends and ideas from the world of fashion, lifestyle,
            shopping and modern accessories.
          </p>
        </div>
      </section>

      {/* BLOG CONTENT */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        {/* FEATURED ARTICLE */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 bg-gray-100 rounded-lg p-8 items-center">
          <img 
            src="https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=400&fit=crop" 
            alt="Fashion pieces" 
            className="h-64 w-full object-cover rounded-lg"
          />
          <div>
            <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
              Featured
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              10 Must-Have Fashion Pieces for This Season
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              By Admin • May 31, 2026 • 5 Min Read
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Discover the latest fashion essentials that will elevate your
              style this season. From trendy jackets to versatile shoes, we've
              curated the ultimate guide for modern fashion lovers.
            </p>
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition">
              Read More
            </button>
          </div>
        </div>

        {/* LATEST ARTICLES TITLE */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Latest Articles
        </h2>

        {/* BLOG GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg hover:-translate-y-2 transition"
            >
              <img 
                src={article.image} 
                alt={article.title} 
                className="h-48 w-full object-cover"
              />
              <div className="p-6">
                <span className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  {article.category}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {article.description}
                </p>
                <button className="text-red-500 font-semibold text-sm hover:text-red-600">
                  Read Article →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CATEGORIES */}
        <div className="flex flex-wrap gap-3 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition ${
                activeCategory === category
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* NEWSLETTER */}
        <div className="bg-gray-900 text-white rounded-lg p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to get the latest blog posts, new deals and exclusive
            content from DOKAN.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-6 py-3 rounded-lg outline-none text-gray-900 flex-1 max-w-md"
            />
            <button
              onClick={handleSubscribe}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-red-500 font-bold text-lg mb-4">DOKAN</h3>
              <p className="text-sm leading-relaxed">
                Your favorite destination for fashion & lifestyle.
              </p>
              <div className="flex gap-4 mt-4">
                <button className="text-gray-400 hover:text-red-500 transition">
                  f
                </button>
                <button className="text-gray-400 hover:text-red-500 transition">
                  @
                </button>
                <button className="text-gray-400 hover:text-red-500 transition">
                  𝕏
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-red-500 font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button className="hover:text-red-500 transition">
                    Shop
                  </button>
                </li>
                <li>
                  <button className="hover:text-red-500 transition">
                    Blog
                  </button>
                </li>
                <li>
                  <button className="hover:text-red-500 transition">
                    About Us
                  </button>
                </li>
                <li>
                  <button className="hover:text-red-500 transition">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-red-500 font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button className="hover:text-red-500 transition">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="hover:text-red-500 transition">
                    Returns
                  </button>
                </li>
                <li>
                  <button className="hover:text-red-500 transition">
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-red-500 font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button className="hover:text-red-500 transition">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button className="hover:text-red-500 transition">
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button className="hover:text-red-500 transition">
                    Sitemap
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            © 2026 DOKAN. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
