import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-orange-500 mb-4">Pasal</h3>
            <p className="text-sm text-gray-300">
              Pasal is a Local E-commerce site. You can buy all electronic and
              cloth item from our stores
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">About Us</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-orange-500">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500">
                  Return Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-orange-500">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-500">
                  Terms & Conditions
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <h5 className="font-semibold mb-3">Subscribe Us</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="flex-1 px-3 py-2 text-gray-900 rounded-l"
                />
                <button className="bg-orange-500 px-4 py-2 rounded-r hover:bg-orange-600">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>Copyright © 2024 All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
