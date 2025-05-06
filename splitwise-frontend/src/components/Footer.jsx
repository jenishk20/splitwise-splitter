import React from "react";

const Footer = () => {
  return (
    <footer className="mt-auto bg-gray-100 text-gray-500 text-center py-4">
      © {new Date().getFullYear()} SplitMate. All rights reserved.
    </footer>
  );
};

export default Footer;
