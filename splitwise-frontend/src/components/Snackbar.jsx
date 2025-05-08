import React from "react";

const Snackbar = ({ message, visible }) => {
  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white text-sm transition-all duration-300 z-50
        ${
          visible ? "bg-green-600 opacity-100" : "opacity-0 pointer-events-none"
        }`}
    >
      {message}
    </div>
  );
};

export default Snackbar;
