// src/pages/sales/SalesOrderDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getSalesOrderById } from "../../data/mockSalesOrders";
import Button from "../../components/common/Button";
import {
  ArrowLeft,
  Edit,
  Printer,
  FileText,
  AlertTriangle,
  ShoppingBag,
  UserCircle as CustomerIcon,
  User as SalespersonIcon,
  Calendar,
  Truck,
  DollarSign,
  Percent,
  Tag,
  Info,
  Home,
} from "lucide-react";
import { showErrorToast } from "../../utils/toastNotifications";

const DetailField = ({ label, value, icon, children, className = "" }) => {
  /* Same as before */
  const IconComponent = icon;
  return (
    <div className={`flex items-start py-3 sm:py-2 ${className}`}>
      {IconComponent && (
        <IconComponent
          size={16}
          className="text-gray-500 mr-3 mt-1 flex-shrink-0"
        />
      )}
      <div className="flex-grow">
        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm text-gray-900 break-words">
          {children
            ? children
            : value !== null && value !== undefined && value !== ""
            ? String(value)
            : "-"}
        </dd>
      </div>
    </div>
  );
};

const SalesOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salesOrder, setSalesOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /* Fetch logic similar to PODetailPage, using getSalesOrderById */
    const fetchSODetails = async () => {
      if (!id) {
        setError("SO ID not provided.");
        showErrorToast("Invalid SO ID.");
        setIsLoading(false);
        navigate("/sales/sales-orders");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const fetchedSO = await getSalesOrderById(id);
        if (fetchedSO) setSalesOrder(fetchedSO);
        else {
          setError(`SO with ID "${id}" not found.`);
          showErrorToast(`SO "${id}" not found.`);
        }
      } catch (err) {
        setError("Failed to load SO details.");
        showErrorToast("Error loading SO details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSODetails();
  }, [id, navigate]);

  const getStatusColor = (status) => {
    /* Same as SalesOrdersPage */
    switch (status?.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "pending approval":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "pending fulfillment":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "partially shipped":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "invoiced":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-200 text-gray-700 border-gray-400";
    }
  };

  if (isLoading) {
    /* Loading JSX */
  }
  if (error) {
    /* Error JSX */
  }
  if (!salesOrder) {
    /* Not Found JSX */ return (
      <div className="p-8 text-center">Sales Order not found.</div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/sales/sales-orders")}
            IconLeft={ArrowLeft}
          >
            Back to SO List
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-2 sm:mt-0 flex items-center">
            <FileText size={28} className="mr-3 text-accent" /> Sales Order:{" "}
            {salesOrder.soNumber}
          </h1>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <span
            className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(
              salesOrder.status
            )}`}
          >
            Status: {salesOrder.status}
          </span>
          <div className="flex space-x-2 mt-1">
            <Link to={`/sales/sales-orders/${salesOrder.id}/edit`}>
              <Button variant="secondary" size="sm" IconLeft={Edit}>
                Edit SO
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              IconLeft={Printer}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-6 border-b border-gray-200">
          <DetailField
            label="Customer"
            icon={CustomerIcon}
            value={salesOrder.customerName || "N/A"}
          />
          <DetailField
            label="Order Date"
            icon={Calendar}
            value={
              salesOrder.orderDate
                ? new Date(salesOrder.orderDate).toLocaleDateString()
                : "-"
            }
          />
          <DetailField
            label="Expected Ship Date"
            icon={Truck}
            value={
              salesOrder.expectedShipDate
                ? new Date(salesOrder.expectedShipDate).toLocaleDateString()
                : "-"
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8 pb-6 border-b">
          <div>
            <h3 className="text-md font-semibold text-gray-600 mb-2 flex items-center">
              <Home size={18} className="mr-2 text-gray-400" />
              Shipping Address
            </h3>
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {salesOrder.shippingAddress || "-"}
            </p>
          </div>
          <div>
            <h3 className="text-md font-semibold text-gray-600 mb-2 flex items-center">
              <Home size={18} className="mr-2 text-gray-400" />
              Billing Address
            </h3>
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {salesOrder.billingAddress || "-"}
            </p>
          </div>
        </div>

        <div className="mb-8">
          {" "}
          {/* Items Table */}
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Order Items
          </h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Product (SKU)
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Discount/Unit
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Line Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesOrder.items.map((item, index) => (
                  <tr key={item.productId + index}>
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      {item.productName}{" "}
                      <span className="text-xs text-gray-500">
                        ({item.sku || item.productId})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      ${parseFloat(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      ${parseFloat(item.discount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ${parseFloat(item.totalPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {" "}
          {/* Notes and Summary */}
          <div className="md:col-span-2 space-y-4">
            <DetailField
              label="Payment Terms"
              icon={Tag}
              value={salesOrder.paymentTerms}
            />
            <DetailField
              label="Salesperson"
              icon={SalespersonIcon}
              value={
                salesOrder.salespersonId
                  ? `Employee ID: ${salesOrder.salespersonId}`
                  : "-"
              }
            />
            <DetailField label="Notes" icon={Info}>
              <p className="whitespace-pre-line ...">
                {salesOrder.notes || "-"}
              </p>
            </DetailField>
          </div>
          <div className="space-y-2 p-4 bg-gray-100 rounded-lg border">
            {" "}
            {/* Financial Summary */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                ${salesOrder.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Discount:</span>
              <span className="font-medium text-red-600">
                -${salesOrder.discountTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Tax (
                {(
                  (salesOrder.tax /
                    (salesOrder.subtotal - salesOrder.discountTotal)) *
                    100 || 0
                ).toFixed(1)}
                %):
              </span>
              <span className="font-medium">${salesOrder.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium">
                ${salesOrder.shippingCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t mt-2">
              <span className="font-bold">Grand Total:</span>
              <span className="font-bold text-accent">
                ${salesOrder.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SalesOrderDetailPage;
