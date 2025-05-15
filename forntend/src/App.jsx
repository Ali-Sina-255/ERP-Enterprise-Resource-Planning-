// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute"; // For protecting routes
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

// Vendor Imports
import VendorsPage from "./pages/vendors/VendorsPage";
import AddVendorPage from "./pages/vendors/AddVendorPage"; // If you use separate Add page
import EditVendorPage from "./pages/vendors/EditVendorPage";
import VendorDetailPage from "./pages/vendors/VendorDetailPage";

// Inventory Imports
import InventoryPage from "./pages/inventory/InventoryPage";
import ProductDetailPage from "./pages/inventory/ProductDetailPage";
// Note: Add/Edit for Inventory is via modal in InventoryPage, so no separate routes typically

// HR Imports
import EmployeesPage from "./pages/hr/EmployeesPage";
import EmployeeDetailPage from "./pages/hr/EmployeeDetailPage";
// Note: Add/Edit for Employees is via modal in EmployeesPage

// Purchasing Imports
import PurchaseOrdersPage from "./pages/purchasing/PurchaseOrdersPage";
import CreatePurchaseOrderPage from "./pages/purchasing/CreatePurchaseOrderPage";
import PurchaseOrderDetailPage from "./pages/purchasing/PurchaseOrderDetailPage";
import EditPurchaseOrderPage from "./pages/purchasing/EditPurchaseOrderPage";

// CRM Imports
import CustomersPage from "./pages/crm/CustomersPage";
import CustomerDetailPage from "./pages/crm/CustomerDetailPage";
import EditCustomerPage from "./pages/crm/EditCustomerPage"; // Dedicated edit page for customers
// Note: Add for Customers is via modal in CustomersPage

// Sales Imports
import SalesOrdersPage from "./pages/sales/SalesOrdersPage";
import CreateSalesOrderPage from "./pages/sales/CreateSalesOrderPage";
import SalesOrderDetailPage from "./pages/sales/SalesOrderDetailPage";
import EditSalesOrderPage from "./pages/sales/EditSalesOrderPage";

// Invoicing Imports
import InvoicesPage from "./pages/invoicing/InvoicesPage";
import CreateInvoicePage from "./pages/invoicing/CreateInvoicePage";
import InvoiceDetailPage from "./pages/invoicing/InvoiceDetailPage";
import EditInvoicePage from "./pages/invoicing/EditInvoicePage";

// accounting 
import ChartOfAccountsPage from "./pages/accounting/ChartOfAccountsPage";
// User & Settings Imports
import ProfilePage from "./pages/user/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import JournalEntriesPage from "./pages/accounting/JournalEntriesPage"; // <<<< ADD THIS IMPORT
import CreateJournalEntryPage from "./pages/accounting/CreateJournalEntryPage"; // <<<< ADD THIS IMPORT
import JournalEntryDetailPage from "./pages/accounting/JournalEntryDetailPage"; // <<<< ADD THIS IMPORT
import EditJournalEntryPage from "./pages/accounting/EditJournalEntryPage"; //

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "./components/common/Button"; // For 404 page
import { Link } from "react-router-dom"; // For 404 page

// AppLayout component to wrap MainLayout for protected routes
const AppLayout = () => (
  <MainLayout>
    <Outlet /> {/* Child protected routes will render here */}
  </MainLayout>
);

function App() {
  return (
    <>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* ... (All other existing Vendor, Inventory, HR, Purchasing, CRM, Sales, Invoicing routes) ... */}
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/vendors/new" element={<AddVendorPage />} />
          <Route path="/vendors/:id" element={<VendorDetailPage />} />
          <Route path="/vendors/:id/edit" element={<EditVendorPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/:id" element={<ProductDetailPage />} />
          <Route path="/hr/employees" element={<EmployeesPage />} />
          <Route path="/hr/employees/:id" element={<EmployeeDetailPage />} />
          <Route
            path="/purchasing/purchase-orders"
            element={<PurchaseOrdersPage />}
          />
          <Route
            path="/purchasing/purchase-orders/new"
            element={<CreatePurchaseOrderPage />}
          />
          <Route
            path="/purchasing/purchase-orders/:id"
            element={<PurchaseOrderDetailPage />}
          />
          <Route
            path="/purchasing/purchase-orders/:id/edit"
            element={<EditPurchaseOrderPage />}
          />
          <Route path="/crm/customers" element={<CustomersPage />} />
          <Route path="/crm/customers/:id" element={<CustomerDetailPage />} />
          <Route
            path="/crm/customers/:id/edit"
            element={<EditCustomerPage />}
          />
          <Route path="/sales/sales-orders" element={<SalesOrdersPage />} />
          <Route
            path="/sales/sales-orders/new"
            element={<CreateSalesOrderPage />}
          />
          <Route
            path="/sales/sales-orders/:id"
            element={<SalesOrderDetailPage />}
          />
          <Route
            path="/sales/sales-orders/:id/edit"
            element={<EditSalesOrderPage />}
          />
          <Route path="/invoicing/invoices" element={<InvoicesPage />} />
          <Route
            path="/invoicing/invoices/new"
            element={<CreateInvoicePage />}
          />
          <Route
            path="/invoicing/invoices/:id"
            element={<InvoiceDetailPage />}
          />
          <Route
            path="/invoicing/invoices/:id/edit"
            element={<EditInvoicePage />}
          />
          {/* Accounting Routes */}
          <Route
            path="/accounting/chart-of-accounts"
            element={<ChartOfAccountsPage />}
          />
          <Route
            path="/accounting/journal-entries"
            element={<JournalEntriesPage />}
          />{" "}
          {/* <<<< ADD THIS ROUTE */}
          <Route
            path="/accounting/journal-entries/new"
            element={<CreateJournalEntryPage />}
          />{" "}
          {/* <<<< ADD THIS ROUTE */}
          <Route
            path="/accounting/journal-entries/:id"
            element={<JournalEntryDetailPage />}
          />{" "}
          {/* <<<< ADD THIS ROUTE */}
          <Route
            path="/accounting/journal-entries/:id/edit"
            element={<EditJournalEntryPage />}
          />
          {/* <<<< ADD THIS ROUTE */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4 text-center">
              <h2 className="text-6xl font-bold text-red-500 mb-4">404</h2>
              <p className="text-2xl text-gray-700 mb-3">
                Oops! Page Not Found.
              </p>
              <p className="text-gray-500 mb-8 max-w-md">
                The page you are looking for might have been removed, had its
                name changed, or is temporarily unavailable.
              </p>
              <Link to="/">
                {" "}
                {/* Changed to Link component */}
                <Button variant="primary" size="lg">
                  Go Back to Homepage
                </Button>
              </Link>
            </div>
          }
        />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3500} // Slightly longer default
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // "light", "dark", or "colored"
      />
    </>
  );
}

export default App;
