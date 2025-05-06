import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ user, handleLogin }) => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
      <h1 className="text-2xl font-bold text-blue-700">SplitMate</h1>
      <div className="flex space-x-6 items-center text-gray-700 font-medium">
        <Link to="/" className="hover:text-blue-600">
          About Us
        </Link>
        <Link to="/" className="hover:text-blue-600">
          Contact Us
        </Link>
        {user ? (
          <span className="text-blue-700 font-semibold">
            Hi, {user.first_name}
          </span>
        ) : (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
