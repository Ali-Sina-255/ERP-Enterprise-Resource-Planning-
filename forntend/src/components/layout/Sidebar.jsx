// src/components/layout/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Package,
  Briefcase,
  Settings,
  X,
  ShoppingCart,
  Users as CrmIcon,
  ClipboardList as SalesIcon, // Example icons
} from "lucide-react";

const allMenuItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [
      "administrator",
      "manager",
      "employee",
      "hr_manager",
      "sales_rep",
      "purchasing_agent",
      "warehouse_staff",
    ],
  },
  {
    path: "/vendors",
    label: "Vendors",
    icon: Users,
    roles: ["administrator", "manager", "purchasing_agent"],
  },
  {
    path: "/inventory",
    label: "Inventory",
    icon: Package,
    roles: [
      "administrator",
      "manager",
      "warehouse_staff",
      "sales_rep",
      "purchasing_agent",
    ],
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
    roles: ["administrator", "manager", "purchasing_agent"],
  },
  {
    path: "/crm/customers",
    label: "CRM (Customers)",
    icon: CrmIcon,
    roles: ["administrator", "manager", "sales_rep"],
  },
  {
    path: "/sales/sales-orders",
    label: "Sales Orders",
    icon: SalesIcon,
    roles: ["administrator", "manager", "sales_rep"],
  },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const accessibleMenuItems = currentUser
    ? allMenuItems.filter((item) => item.roles.includes(currentUser.role))
    : [];

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
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700 flex-shrink-0">
          <Link to="/dashboard" className="text-2xl font-bold text-accent">
            AUKTO ERP
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-primary-foreground focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="mt-4 px-2 flex-grow overflow-y-auto">
          {accessibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname.startsWith(item.path) &&
              (item.path !== "/" || location.pathname === "/");
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-3 mb-1 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon size={20} className="mr-3 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {currentUser && currentUser.role === "administrator" && (
          <div className="p-2 border-t border-gray-700 flex-shrink-0">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                location.pathname.startsWith("/settings")
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Settings size={20} className="mr-3 flex-shrink-0" />
              Settings
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};
export default Sidebar;
