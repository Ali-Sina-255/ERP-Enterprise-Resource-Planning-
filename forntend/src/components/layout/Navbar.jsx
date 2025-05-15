// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import LanguageSwitcher from "../common/LanguageSwitcher";
import {
  Menu,
  Bell,
  UserCircle,
  Search,
  LogOut,
  Settings,
  User as ProfileIcon,
} from "lucide-react"; // Added ProfileIcon for clarity

const Navbar = ({ toggleSidebar }) => {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false); // Ensure dropdown closes
  };

  // Effect to close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Left side: Menu toggle and Search bar */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 dark:text-gray-400 focus:outline-none lg:hidden me-3" // margin-end for RTL
        >
          <Menu size={24} />
        </button>
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
            {" "}
            {/* padding-start for RTL */}
            <Search size={18} className="text-gray-400 dark:text-gray-500" />
          </span>
          <input
            type="text"
            placeholder={t("searchPlaceholder", "Search...")}
            className="block w-full max-w-xs ps-10 pe-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 dark:text-slate-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
          />
        </div>
      </div>

      {/* Right side: Language Switcher, Notifications, Profile Dropdown */}
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
        {" "}
        {/* space-x works with RTL by reversing order */}
        <LanguageSwitcher />
        <button
          className="relative p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-accent"
          aria-label={t("notifications", "Notifications")}
        >
          <span className="sr-only">
            {t("viewNotifications", "View notifications")}
          </span>
          <Bell size={22} />
          {/* Example Notification Badge - uncomment and style if needed
          <span className="absolute -top-1 -end-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          */}
        </button>
        {currentUser && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none p-1 rounded-full focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-accent"
              aria-expanded={profileDropdownOpen}
              aria-haspopup="true"
              id="user-menu-button"
            >
              <span className="sr-only">
                {t("openUserMenu", "Open user menu")}
              </span>
              <UserCircle size={28} />
              <span className="ms-2 hidden md:block text-sm font-medium">
                {" "}
                {/* margin-start for RTL */}
                {currentUser.firstName || currentUser.username}
              </span>
              {/* Optional: Chevron icon for dropdown indicator
              <ChevronDown size={16} className={`ms-1 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} /> 
              */}
            </button>

            {profileDropdownOpen && (
              <div
                className="absolute end-0 mt-2 w-56 origin-top-end bg-white dark:bg-slate-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20 py-1 border dark:border-slate-600" // end-0 for RTL
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-600">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                    {currentUser.email}
                  </p>
                </div>
                <div role="none">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 w-full text-start" // text-start for RTL
                    role="menuitem"
                    onClick={() => setProfileDropdownOpen(false)} // Close dropdown on click
                  >
                    <ProfileIcon
                      size={16}
                      className="me-2 text-gray-400 dark:text-slate-500"
                    />{" "}
                    {/* margin-end */}
                    {t("myProfile", "My Profile")}
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 w-full text-start"
                    role="menuitem"
                    onClick={() => setProfileDropdownOpen(false)} // Close dropdown on click
                  >
                    <Settings
                      size={16}
                      className="me-2 text-gray-400 dark:text-slate-500"
                    />{" "}
                    {/* margin-end */}
                    {t("settings", "Settings")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-700/20 text-start" // text-start for RTL
                    role="menuitem"
                  >
                    <LogOut size={16} className="me-2" /> {/* margin-end */}
                    {t("logoutButton", "Logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
// new changes on the navbar 