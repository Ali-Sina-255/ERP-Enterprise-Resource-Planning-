import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Briefcase,
  Settings,
  X,
  ShoppingCart,
} from "lucide-react";

 const menuItems = [
   {
     path: "/dashboard",
     label: "Dashboard",
     icon: LayoutDashboard,
     roles: ["administrator", "manager", "employee"],
   },
   {
     path: "/vendors",
     label: "Vendors",
     icon: Users,
     roles: ["administrator", "manager"],
   },
   {
     path: "/inventory",
     label: "Inventory",
     icon: Package,
     roles: ["administrator", "manager"],
   },
   {
     path: "/hr/employees",
     label: "HR (Employees)",
     icon: Briefcase,
     roles: ["administrator", "hr_manager"],
   },
   {
     path: "/purchasing/purchase-orders",
     label: "Purchasing",
     icon: ShoppingCart,
     roles: ["administrator", "manager"],
   },
   {
     path: "/settings",
     label: "Settings",
     icon: Settings,
     roles: ["administrator"],
   },
 ];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden"
        ></div>
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary text-primary-foreground transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700">
          <Link to="/dashboard" className="text-2xl font-bold text-accent">
            AUKTO ERP
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-primary-foreground"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="mt-4 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-3 mb-1 rounded-md text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <Link
            to="/settings"
            className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors
                 ${
                   location.pathname.startsWith("/settings")
                     ? "bg-accent text-accent-foreground"
                     : "text-gray-300 hover:bg-gray-700 hover:text-white"
                 }`}
          >
            <Settings size={20} className="mr-3" />
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
/// ne whcane 