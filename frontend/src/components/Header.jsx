import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1
            className="text-3xl font-bold text-blue-600 cursor-pointer"
            onClick={() => navigate("/")}
          >
            Do-Kan
          </h1>
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/help")}
              className="text-sm text-gray-500 hidden sm:block hover:text-blue-600"
            >
              Help &amp; Support
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="relative text-sm font-medium hover:text-blue-600"
            >
              🛒 Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:block">
                  Hi, {user?.name?.split(" ")[0]}
                </span>
                <button
                  onClick={() => navigate("/profile")}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600"
                >
                  Profile
                </button>
                {user?.role === "customer" && (
                  <button
                    onClick={() => navigate("/orders")}
                    className="text-sm font-medium text-gray-600 hover:text-blue-600"
                  >
                    My Orders
                  </button>
                )}
                {user?.role === "vendor" && (
                  <button
                    onClick={() => navigate("/vendor/dashboard")}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Dashboard
                  </button>
                )}
                {user?.role === "admin" && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-500 hover:underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate(`/?search=${e.target.value}`);
            }}
          />
          <button
            onClick={() => navigate("/cart")}
            className="text-blue-600 text-xl"
          >
            🛒
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
