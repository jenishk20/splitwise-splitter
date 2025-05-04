// src/components/Navbar.jsx
import React from "react";

function Navbar({ user, handleLogin }) {
  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-indigo-600">
          Splitwise Splitter
        </div>
        <div>
          {user ? (
            <span className="text-gray-700 font-medium">
              Welcome, {user.first_name}
            </span>
          ) : (
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
