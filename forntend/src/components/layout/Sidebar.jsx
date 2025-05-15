// src/components/layout/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next"; // Import useTranslation
import {
  LayoutDashboard,
  Users,
  Package,
  Briefcase,
  Settings,
  X,
  ShoppingCart,
  Users as CrmIcon,
  ClipboardList as SalesIcon,
  FileSpreadsheet as InvoicingIcon,
  BookOpen as AccountingIcon,
  ListChecks as JournalIcon,
} from "lucide-react";

// Define menu items with translation keys for labels
const allMenuItemsConfig = [
  {
    path: "/dashboard",
    i18nKey: "dashboard",
    icon: LayoutDashboard,
    roles: [
      "administrator",
      "manager",
      "employee",
      "hr_manager",
      "sales_rep",
      "purchasing_agent",
      "warehouse_staff",
      "accountant",
    ],
  },
  {
    path: "/vendors",
    i18nKey: "vendors",
    icon: Users,
    roles: ["administrator", "manager", "purchasing_agent"],
  },
  {
    path: "/inventory",
    i18nKey: "inventory",
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
    path: "/crm/customers",
    i18nKey: "crm",
    icon: CrmIcon,
    roles: ["administrator", "manager", "sales_rep"],
  },
  {
    path: "/sales/sales-orders",
    i18nKey: "sales",
    icon: SalesIcon,
    roles: ["administrator", "manager", "sales_rep"],
  },
  {
    path: "/purchasing/purchase-orders",
    i18nKey: "purchasing",
    icon: ShoppingCart,
    roles: ["administrator", "manager", "purchasing_agent"],
  },
  {
    path: "/invoicing/invoices",
    i18nKey: "invoicing",
    icon: InvoicingIcon,
    roles: ["administrator", "manager", "accountant", "sales_rep"],
  },
  // Example of a parent "Accounting" menu that would ideally expand
  // For now, we link directly. A real expanding menu needs more complex state.
  {
    path: "/accounting/chart-of-accounts",
    i18nKey: "chartOfAccounts",
    parentI18nKey: "accounting",
    icon: AccountingIcon,
    roles: ["administrator", "accountant", "manager"],
  },
  {
    path: "/accounting/journal-entries",
    i18nKey: "journalEntries",
    parentI18nKey: "accounting",
    icon: JournalIcon,
    roles: ["administrator", "accountant", "manager"],
  },
  {
    path: "/hr/employees",
    i18nKey: "hr",
    icon: Briefcase,
    roles: ["administrator", "hr_manager"],
  },
  // Settings is handled separately at the bottom for now
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { t } = useTranslation(); // Initialize the t function for translations

  const accessibleMenuItems = currentUser
    ? allMenuItemsConfig.filter((item) => item.roles.includes(currentUser.role))
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
            {t("appTitle")} {/* Use t function for app title */}
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
                key={item.i18nKey}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-3 mb-1 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon size={20} className="mr-3 flex-shrink-0" />
                {t(item.i18nKey)} {/* Use t function for menu item labels */}
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
              {t("settings")} {/* Use t function for settings */}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};
export default Sidebar;
