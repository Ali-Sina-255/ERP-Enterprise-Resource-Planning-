// src/components/layout/Navbar.jsx
import React, { useState } from "react";
import { Menu, Bell, UserCircle, Search, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth
import { Link } from "react-router-dom"; // For potential profile link

const Navbar = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth(); // Get currentUser and logout function
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false); // Close dropdown on logout
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {" "}
      {/* Added sticky and z-index */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 focus:outline-none lg:hidden mr-3"
        >
          <Menu size={24} />
        </button>
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <Search size={18} className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
          />
        </div>
      </div>
      <div className="flex items-center space-x-3 md:space-x-4">
        <button className="p-1 text-gray-500 hover:text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
          <Bell size={22} />
          {/* Add a badge for notifications later */}
          {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500" /> */}
        </button>

        {/* Profile Dropdown */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              <UserCircle size={28} />
              <span className="ml-2 hidden md:block text-sm font-medium">
                {currentUser.firstName || currentUser.username}
              </span>
              {/* Chevron icon for dropdown indicator if needed */}
            </button>
            {profileDropdownOpen && (
              <div
                onMouseLeave={() => setProfileDropdownOpen(false)} // Close on mouse leave for convenience
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 py-1 border"
              >
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-semibold text-gray-800">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser.email}
                  </p>
                </div>
                <Link
                  to="/profile" // Placeholder for profile page
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={() => {
                    showErrorToast("Profile page not yet implemented.");
                    setProfileDropdownOpen(false);
                  }}
                >
                  My Profile
                </Link>
                <Link
                  to="/settings" // Placeholder for settings page
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={() => {
                    showErrorToast("Settings page not yet implemented.");
                    setProfileDropdownOpen(false);
                  }}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
