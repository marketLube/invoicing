import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow page-container">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-neutral-200 py-4 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Marketlube LLP. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;