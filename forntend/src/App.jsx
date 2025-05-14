// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
// Vendor Imports
import VendorsPage from "./pages/vendors/VendorsPage";
import AddVendorPage from "./pages/vendors/AddVendorPage";
import EditVendorPage from "./pages/vendors/EditVendorPage";
import VendorDetailPage from "./pages/vendors/VendorDetailPage";
// Inventory Imports
import InventoryPage from "./pages/inventory/InventoryPage";
import ProductDetailPage from "./pages/inventory/ProductDetailPage";
// HR Imports
import EmployeesPage from "./pages/hr/EmployeesPage";
import EmployeeDetailPage from "./pages/hr/EmployeeDetailPage";
// Purchasing Imports
import PurchaseOrdersPage from "./pages/purchasing/PurchaseOrdersPage";
import CreatePurchaseOrderPage from "./pages/purchasing/CreatePurchaseOrderPage";
import PurchaseOrderDetailPage from "./pages/purchasing/PurchaseOrderDetailPage";
import EditPurchaseOrderPage from "./pages/purchasing/EditPurchaseOrderPage";
// CRM Imports
import CustomersPage from "./pages/crm/CustomersPage";
import CustomerDetailPage from "./pages/crm/CustomerDetailPage";
import EditCustomerPage from "./pages/crm/EditCustomerPage"; // Assuming you created this
// Sales Imports
import SalesOrdersPage from "./pages/sales/SalesOrdersPage";
import CreateSalesOrderPage from "./pages/sales/CreateSalesOrderPage";
import SalesOrderDetailPage from "./pages/sales/SalesOrderDetailPage";
import EditSalesOrderPage from "./pages/sales/EditSalesOrderPage";
// User & Settings Imports
import ProfilePage from "./pages/user/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppLayout = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

function App() {
  return (
    <>
      <Routes>
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

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route
          path="*"
          element={
            <div className="p-8 text-center">
              <h2>404 - Page Not Found</h2>
            </div>
          }
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
}
export default App;
