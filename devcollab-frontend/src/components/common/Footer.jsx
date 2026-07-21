import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-textSecondary">
          &copy; {new Date().getFullYear()} DevCollab. Built for developer project collaboration.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
