import React from "react";
import { Link } from "react-router-dom";

const Homepage = ({ handleLogin }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex items-center justify-center bg-gradient-to-tr from-blue-50 to-blue-200">
        <div className="max-w-3xl text-center px-6">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Welcome to <span className="text-blue-600">SplitMate</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10">
            Simplify group expenses — Upload a CSV, let members opt-in, and
            split fairly.
          </p>
          <button
            onClick={handleLogin}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
