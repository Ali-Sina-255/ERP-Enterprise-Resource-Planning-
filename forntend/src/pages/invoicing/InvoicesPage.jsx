// src/pages/invoicing/InvoicesPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getInvoices,
  voidInvoice as apiVoidInvoice,
} from "../../data/mockInvoices";
import Button from "../../components/common/Button";
import {
  PlusCircle,
  Edit,
  Eye,
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Download,
  Printer,
  DollarSign as RecordPaymentIcon,
} from "lucide-react";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../../utils/toastNotifications";
import { exportToCsv } from "../../utils/exportUtils";
// Modal and Input for Record Payment could be here if not on detail page, but detail page is better
// For now, Record Payment will be initiated from Detail Page

const ITEMS_PER_PAGE = 10;
const INVOICE_STATUS_OPTIONS = [
  "Draft",
  "Sent",
  "Partially Paid",
  "Paid",
  "Overdue",
  "Void",
  "",
]; // Empty for 'All'

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-300";
    case "sent":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "partially paid":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "paid":
      return "bg-green-100 text-green-800 border-green-300";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-300";
    case "void":
      return "bg-slate-200 text-slate-600 border-slate-400 line-through";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-300"; // Default for other/unknown
  }
};

const InvoicesPage = () => {
  const [allInvoices, setAllInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchInvoicesList = async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const data = await getInvoices();
      setAllInvoices(data || []);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      setPageError("Failed to load invoices. Please try again later.");
      showErrorToast("Error loading invoices list.");
      setAllInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesList();
  }, []);

  const filteredInvoices = useMemo(() => {
    let results = allInvoices;
    if (statusFilter) {
      results = results.filter((inv) => inv.status === statusFilter);
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm) return results;
    return results.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(lowerSearchTerm) ||
        (inv.customerName &&
          inv.customerName.toLowerCase().includes(lowerSearchTerm)) ||
        (inv.salesOrderId &&
          inv.salesOrderId.toLowerCase().includes(lowerSearchTerm))
    );
  }, [searchTerm, statusFilter, allInvoices]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInvoices, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    else if (
      totalPages === 0 &&
      filteredInvoices.length > 0 &&
      currentPage !== 1
    )
      setCurrentPage(1); // If filter results in 0 pages but there are results
    else if (currentPage === 0 && totalPages > 0) setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    filteredInvoices.length,
    totalPages,
    currentPage,
  ]);

  const invoiceExportColumns = [
    { key: "invoiceNumber", header: "Invoice #" },
    { key: "customerName", header: "Customer" },
    { key: "salesOrderId", header: "SO #" },
    { key: "issueDate", header: "Issue Date" },
    { key: "dueDate", header: "Due Date" },
    { key: "status", header: "Status" },
    { key: "subtotal", header: "Subtotal" },
    { key: "discountApplied", header: "Discount" },
    { key: "taxAmount", header: "Tax" },
    { key: "shippingAmount", header: "Shipping" },
    { key: "totalAmount", header: "Total Amount" },
    { key: "amountPaid", header: "Amount Paid" },
    { key: "balanceDue", header: "Balance Due" },
    { key: "paymentTerms", header: "Payment Terms" },
  ];

  const handleExportInvoices = () => {
    if (filteredInvoices.length === 0) {
      showInfoToast("No invoices to export.");
      return;
    }
    exportToCsv([...filteredInvoices], invoiceExportColumns, "invoices_list");
    showInfoToast("Invoices list is being downloaded.");
  };

  const handleVoidInvoice = async (invoiceId, invoiceNumber) => {
    const invToVoid = allInvoices.find((inv) => inv.id === invoiceId);
    if (
      invToVoid &&
      (invToVoid.status === "Paid" || invToVoid.status === "Void")
    ) {
      showErrorToast(
        `Invoice ${invoiceNumber} is already ${invToVoid.status.toLowerCase()} and cannot be voided again.`
      );
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to VOID invoice ${invoiceNumber}? This action marks it as unusable.`
      )
    ) {
      try {
        await apiVoidInvoice(invoiceId);
        fetchInvoicesList(); // Re-fetch to get the updated status
        showSuccessToast(`Invoice ${invoiceNumber} voided successfully!`);
      } catch (err) {
        showErrorToast(`Failed to void invoice. ${err.message || ""}`);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };
  const getPageNumbers = () => {
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
        endPage = Math.min(totalPages - 1, maxPagesToShow - 2); // Adjust for 1 and ...
      if (currentPage >= totalPages - halfPagesToShow)
        startPage = Math.max(2, totalPages - maxPagesToShow + 1); // Adjust for ... and last page
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) pageNumbers.push(i);
      }
      if (
        currentPage < totalPages - halfPagesToShow - 1 &&
        endPage < totalPages - 1
      )
        pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
    return pageNumbers.filter(
      (item, index) => pageNumbers.indexOf(item) === index || item === "..."
    );
  };

  if (isLoading && !allInvoices.length && !pageError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading Invoices...</p>
      </div>
    );
  }
  if (pageError && !allInvoices.length) {
    return (
      <div className="container mx-auto p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold mr-2">
            <AlertTriangle className="inline-block mr-2" size={20} />
            Error:
          </strong>
          <span className="block sm:inline">{pageError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
          <FileSpreadsheet size={32} className="mr-3 text-accent" /> Customer
          Invoices
        </h1>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button
            variant="outline"
            IconLeft={Download}
            onClick={handleExportInvoices}
            disabled={isLoading || filteredInvoices.length === 0}
            size="md"
          >
            Export CSV
          </Button>
          <Link to="/invoicing/invoices/new">
            <Button variant="primary" IconLeft={PlusCircle} size="md">
              Create New Invoice
            </Button>
          </Link>
        </div>
      </div>
      <div className="mb-6 p-4 bg-white shadow rounded-lg flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full sm:w-1/2">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search Invoice #, Customer, SO #..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/80 focus:border-accent sm:text-sm placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto sm:min-w-[200px]">
          <label htmlFor="statusFilter" className="sr-only">
            Filter by Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full px-3 py-2.5 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
          >
            <option value="">All Statuses</option>
            {INVOICE_STATUS_OPTIONS.filter((s) => s).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="table-header">
                Invoice #
              </th>
              <th scope="col" className="table-header">
                Customer
              </th>
              <th scope="col" className="table-header">
                Issue Date
              </th>
              <th scope="col" className="table-header">
                Due Date
              </th>
              <th scope="col" className="table-header">
                Total
              </th>
              <th scope="col" className="table-header">
                Balance Due
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
            {isLoading && paginatedInvoices.length === 0 && !pageError && (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    <p className="ml-3">Loading data...</p>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && paginatedInvoices.length === 0 && !pageError && (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500">
                  No invoices found matching your criteria.
                </td>
              </tr>
            )}

            {paginatedInvoices.map((inv) => (
              <tr
                key={inv.id}
                className={`hover:bg-gray-50 ${
                  inv.status === "Void" ? "opacity-60" : ""
                }`}
              >
                <td className="table-cell">
                  <Link
                    to={`/invoicing/invoices/${inv.id}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {inv.invoiceNumber}
                  </Link>
                  {inv.salesOrderId && (
                    <div className="text-xs text-gray-500">
                      SO: {inv.salesOrderId}
                    </div>
                  )}
                </td>
                <td className="table-cell">{inv.customerName || "N/A"}</td>
                <td className="table-cell">
                  {inv.issueDate
                    ? new Date(inv.issueDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="table-cell">
                  {inv.dueDate
                    ? new Date(inv.dueDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="table-cell font-semibold">
                  ${inv.totalAmount?.toFixed(2) || "0.00"}
                </td>
                <td
                  className={`table-cell font-bold ${
                    inv.balanceDue > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ${inv.balanceDue?.toFixed(2) || "0.00"}
                </td>
                <td className="table-cell">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                      inv.status
                    )}`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="table-cell-actions space-x-1">
                  <Link
                    to={`/invoicing/invoices/${inv.id}`}
                    title="View Invoice"
                  >
                    <Button variant="ghost" size="sm" className="p-1.5">
                      <Eye size={18} />
                    </Button>
                  </Link>
                  {(inv.status === "Draft" ||
                    inv.status === "Sent" ||
                    inv.status === "Overdue" ||
                    inv.status === "Partially Paid") && (
                    <Link
                      to={`/invoicing/invoices/${inv.id}/edit`}
                      title="Edit Invoice"
                    >
                      <Button variant="ghost" size="sm" className="p-1.5">
                        <Edit size={18} />
                      </Button>
                    </Link>
                  )}
                  {inv.status !== "Paid" && inv.status !== "Void" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5 text-orange-500 hover:text-orange-700"
                      onClick={() =>
                        handleVoidInvoice(inv.id, inv.invoiceNumber)
                      }
                      title="Void Invoice"
                    >
                      <AlertTriangle size={18} />
                    </Button>
                  )}
                  {/* Record Payment button is better on Detail Page for context */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
          <div className="mb-2 sm:mb-0">
            Showing{" "}
            <span className="font-semibold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to
            <span className="font-semibold">
              {" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)}
            </span>{" "}
            of
            <span className="font-semibold">
              {" "}
              {filteredInvoices.length}
            </span>{" "}
            invoices
          </div>
          <nav aria-label="Pagination">
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-md px-2 py-1.5 md:px-3 md:py-2"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />{" "}
                  <span className="hidden md:inline ml-1">Prev</span>
                </Button>
              </li>
              {getPageNumbers().map((page, index) => (
                <li key={`page-${page === "..." ? `ellipsis-${index}` : page}`}>
                  {page === "..." ? (
                    <span className="px-2 py-1.5 md:px-3 md:py-2">...</span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      className="px-2.5 py-1.5 md:px-3.5 md:py-2"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )}
                </li>
              ))}
              <li>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-md px-2 py-1.5 md:px-3 md:py-2"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <span className="hidden md:inline mr-1">Next</span>{" "}
                  <ChevronRight size={18} />
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};
export default InvoicesPage;
