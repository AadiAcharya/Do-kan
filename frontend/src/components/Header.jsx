import React from "react";
import { ShoppingCart, Heart, User, LogIn } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-primary-500">Do-Kan</h1>
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium hover:text-primary-500">
              Help
            </button>
            <button className="text-sm font-medium hover:text-primary-500">
              Cart
            </button>
            <button className="text-sm font-medium hover:text-primary-500">
              Sign In
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
          />
          <ShoppingCart className="text-primary-500 cursor-pointer" size={24} />
        </div>
      </div>
    </header>
  );
};

export default Header;
