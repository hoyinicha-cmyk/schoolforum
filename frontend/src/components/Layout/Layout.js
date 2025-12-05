import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex relative">
        {/* Hamburger Menu Button */}
        {isAuthenticated && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`fixed top-20 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 ${
              sidebarOpen ? 'left-[17rem]' : 'left-4'
            }`}
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            )}
          </button>
        )}

        {/* Sidebar with toggle */}
        {isAuthenticated && (
          <div
            className={`fixed left-0 top-16 h-[calc(100vh-4rem)] transition-transform duration-300 ease-in-out z-40 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar />
          </div>
        )}

        {/* Overlay for mobile */}
        {isAuthenticated && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main
          className={`flex-1 min-w-0 transition-all duration-300 ${
            isAuthenticated && sidebarOpen ? 'lg:ml-64' : 'ml-0'
          }`}
        >
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;