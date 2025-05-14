// src/pages/sales/SalesOrdersPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getSalesOrders,
  deleteSalesOrder as apiDeleteSO,
} from "../../data/mockSalesOrders";
import Button from "../../components/common/Button";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
} from "lucide-react"; // Changed Icon
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../../utils/toastNotifications";
import { exportToCsv } from "../../utils/exportUtils";

const ITEMS_PER_PAGE = 10;

const SalesOrdersPage = () => {
  const [allSOs, setAllSOs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchSOs = async () => {
      setIsLoading(true);
      setPageError(null);
      try {
        const data = await getSalesOrders();
        setAllSOs(data || []);
      } catch (err) {
        console.error("Failed to fetch sales orders:", err);
        setPageError("Failed to load sales orders.");
        showErrorToast("Error loading sales orders.");
        setAllSOs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSOs();
  }, []);

  const filteredSOs = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm) return allSOs;
    return allSOs.filter(
      (so) =>
        so.soNumber.toLowerCase().includes(lowerSearchTerm) ||
        (so.customerName &&
          so.customerName.toLowerCase().includes(lowerSearchTerm)) ||
        so.status.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm, allSOs]);

  const totalPages = Math.ceil(filteredSOs.length / ITEMS_PER_PAGE);
  const paginatedSOs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSOs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSOs, currentPage]);

  useEffect(() => {
    /* Page reset logic - same as other list pages */
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    else if (totalPages === 0 && filteredSOs.length > 0) setCurrentPage(1);
    else if (currentPage === 0 && totalPages > 0) setCurrentPage(1);
  }, [searchTerm, filteredSOs.length, totalPages, currentPage]);

  const salesOrderExportColumns = [
    { key: "soNumber", header: "SO Number" },
    { key: "customerName", header: "Customer Name" },
    { key: "orderDate", header: "Order Date" },
    { key: "expectedShipDate", header: "Expected Ship Date" },
    { key: "status", header: "Status" },
    { key: "subtotal", header: "Subtotal" },
    { key: "discountTotal", header: "Total Discount" },
    { key: "tax", header: "Tax Amount" },
    { key: "shippingCost", header: "Shipping Cost" },
    { key: "totalAmount", header: "Grand Total" },
    { key: "paymentTerms", header: "Payment Terms" },
    { key: "salespersonId", header: "Salesperson ID" },
    { key: "notes", header: "Notes" },
  ];

  const handleExportSOs = () => {
    if (filteredSOs.length === 0) {
      showInfoToast("No sales orders to export.");
      return;
    }
    exportToCsv([...filteredSOs], salesOrderExportColumns, "sales_orders_list");
    showInfoToast("Sales orders list is being downloaded.");
  };

  const handleDelete = async (soId) => {
    if (
      window.confirm("Delete this Sales Order? This might be irreversible.")
    ) {
      try {
        await apiDeleteSO(soId);
        setAllSOs((prevSOs) => prevSOs.filter((so) => so.id !== soId));
        showSuccessToast("Sales Order deleted successfully!");
        if (paginatedSOs.length === 1 && currentPage > 1)
          setCurrentPage(currentPage - 1);
      } catch (err) {
        showErrorToast("Failed to delete Sales Order.");
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };
  const getPageNumbers = () => {
    /* ... same pagination number logic ... */
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      if (currentPage > halfPagesToShow + 2) pageNumbers.push("...");
      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);
      if (currentPage <= halfPagesToShow + 1)
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      if (currentPage >= totalPages - halfPagesToShow)
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (currentPage < totalPages - halfPagesToShow - 1)
        pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
    return pageNumbers.filter(
      (item, index) => pageNumbers.indexOf(item) === index
    );
  };

  const getStatusColor = (status) => {
    /* ... same as PODetailPage ... */
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

  if (isLoading && !allSOs.length && !pageError) {
    /* Loading JSX */
  }
  if (pageError && !allSOs.length) {
    /* Error JSX */
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
          <ClipboardList size={32} className="mr-3 text-accent" /> Sales Orders
        </h1>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button
            variant="outline"
            IconLeft={Download}
            onClick={handleExportSOs}
            disabled={isLoading || filteredSOs.length === 0}
            size="md"
          >
            Export CSV
          </Button>
          <Link to="/sales/sales-orders/new">
            <Button variant="primary" IconLeft={PlusCircle} size="md">
              Create New SO
            </Button>
          </Link>
        </div>
      </div>
      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        {" "}
        {/* Search Bar */}
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search SO #, Customer, or Status..."
            className="block w-full md:w-2/3 lg:w-1/2 pl-10 pr-3 py-2.5 border ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        {" "}
        {/* Table */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="table-header">
                SO Number
              </th>
              <th scope="col" className="table-header">
                Customer
              </th>
              <th scope="col" className="table-header">
                Order Date
              </th>
              <th scope="col" className="table-header">
                Expected Ship
              </th>
              <th scope="col" className="table-header">
                Total Amount
              </th>
              <th scope="col" className="table-header">
                Status
              </th>
              <th scope="col" className="table-header text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && paginatedSOs.length === 0 && !pageError && (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && paginatedSOs.length === 0 && !pageError && (
              <tr>
                <td colSpan="7" className="text-center py-10">
                  No sales orders found.
                </td>
              </tr>
            )}
            {paginatedSOs.map((so) => (
              <tr key={so.id} className="hover:bg-gray-50">
                <td className="table-cell">
                  <Link
                    to={`/sales/sales-orders/${so.id}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {so.soNumber}
                  </Link>
                  <div className="text-xs text-gray-500">ID: {so.id}</div>
                </td>
                <td className="table-cell">{so.customerName || "N/A"}</td>
                <td className="table-cell">
                  {so.orderDate
                    ? new Date(so.orderDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="table-cell">
                  {so.expectedShipDate
                    ? new Date(so.expectedShipDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="table-cell font-semibold">
                  $
                  {so.totalAmount?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"}
                </td>
                <td className="table-cell">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(
                      so.status
                    )}`}
                  >
                    {so.status}
                  </span>
                </td>
                <td className="table-cell-actions space-x-1">
                  <Link to={`/sales/sales-orders/${so.id}`} title="View SO">
                    <Button variant="ghost" size="sm" className="p-1.5">
                      <Eye size={18} />
                    </Button>
                  </Link>
                  <Link
                    to={`/sales/sales-orders/${so.id}/edit`}
                    title="Edit SO"
                  >
                    <Button variant="ghost" size="sm" className="p-1.5">
                      <Edit size={18} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1.5"
                    onClick={() => handleDelete(so.id)}
                    title="Delete SO"
                  >
                    <Trash2 size={18} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 /* Pagination Controls JSX */ && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
          <div className="mb-2 sm:mb-0">
            Showing{" "}
            <span className="font-semibold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to
            <span className="font-semibold">
              {" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredSOs.length)}
            </span>{" "}
            of
            <span className="font-semibold"> {filteredSOs.length}</span> SOs
          </div>
          <nav aria-label="Pagination">
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-md..."
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </Button>
              </li>
              {getPageNumbers().map((page, index) => (
                <li key={index}>
                  {page === "..." ? (
                    "..."
                  ) : (
                    <Button onClick={() => handlePageChange(page)}>
                      {page}
                    </Button>
                  )}
                </li>
              ))}
              <li>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-md..."
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};
export default SalesOrdersPage;
