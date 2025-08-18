import React from "react";
import logo from "/image.webp";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <header className="bg-[#0f0e0e] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-[90px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img
            fetchPriority="high"
            src={logo}
            alt="Logo"
            className="w-[150px] object-contain"
          />
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-6 text-white">
          <Link
            to="/"
            className="hover:text-blue-500 transition duration-200 font-medium"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="hover:text-blue-500 transition duration-200 font-medium"
          >
            About
          </Link>
          <Link
            to="/services"
            className="hover:text-blue-500 transition duration-200 font-medium"
          >
            Services
          </Link>
          <Link
            to="/contact"
            className="hover:text-blue-500 transition duration-200 font-medium"
          >
            Contact
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("isLoggedIn");
              window.location.reload();
            }}
            className="bg-red-700 hover:bg-red-400 text-white px-4 py-2 rounded-md font-medium transition duration-200"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
