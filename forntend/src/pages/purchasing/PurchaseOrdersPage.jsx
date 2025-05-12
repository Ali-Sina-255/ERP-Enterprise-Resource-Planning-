import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getPurchaseOrders,
  deletePurchaseOrder as apiDeletePO,
} from "../../data/mockPurchaseOrders";
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
  ShoppingCart,
} from "lucide-react";
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toastNotifications";

const ITEMS_PER_PAGE = 10;

const PurchaseOrdersPage = () => {
  const [allPOs, setAllPOs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPOs = async () => {
      setIsLoading(true);
      setPageError(null);
      try {
        const data = await getPurchaseOrders();
        setAllPOs(data || []);
      } catch (err) {
        console.error("Failed to fetch purchase orders:", err);
        setPageError("Failed to load purchase orders. Please try again later.");
        showErrorToast("Error loading purchase orders.");
        setAllPOs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPOs();
  }, []);

  const filteredPOs = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm) return allPOs;
    return allPOs.filter(
      (po) =>
        po.poNumber.toLowerCase().includes(lowerSearchTerm) ||
        (po.vendorName &&
          po.vendorName.toLowerCase().includes(lowerSearchTerm)) ||
        po.status.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm, allPOs]);

  const totalPages = Math.ceil(filteredPOs.length / ITEMS_PER_PAGE);
  const paginatedPOs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPOs.slice(startIndex, endIndex);
  }, [filteredPOs, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    else if (totalPages === 0 && filteredPOs.length > 0) setCurrentPage(1);
    else if (currentPage === 0 && totalPages > 0) setCurrentPage(1);
  }, [searchTerm, filteredPOs.length, totalPages, currentPage]);

  const handleDelete = async (poId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this Purchase Order? This might be irreversible."
      )
    ) {
      try {
        await apiDeletePO(poId);
        setAllPOs((prevPOs) => prevPOs.filter((po) => po.id !== poId));
        showSuccessToast("Purchase Order deleted successfully!");
        if (paginatedPOs.length === 1 && currentPage > 1)
          setCurrentPage(currentPage - 1);
      } catch (err) {
        console.error("Failed to delete PO:", err);
        showErrorToast("Failed to delete Purchase Order.");
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
    switch (status?.toLowerCase()) {
      case "pending approval":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "ordered":
        return "bg-indigo-100 text-indigo-800";
      case "partially received":
        return "bg-purple-100 text-purple-800";
      case "received":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && !allPOs.length && !pageError) {
    /* Full page loader */
  }
  if (pageError && !allPOs.length) {
    /* Error display */
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold text-gray-800">
          Purchase Orders
        </h1>
        <Link to="/purchasing/purchase-orders/new">
          <Button variant="primary" IconLeft={ShoppingCart}>
            Create New PO
          </Button>
        </Link>
      </div>

      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by PO #, Vendor, or Status..."
            className="block w-full md:w-2/3 lg:w-1/2 pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-accent/80 focus:border-accent 
                       sm:text-sm placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="table-header">
                PO Number
              </th>
              <th scope="col" className="table-header">
                Vendor
              </th>
              <th scope="col" className="table-header">
                Order Date
              </th>
              <th scope="col" className="table-header">
                Expected Delivery
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
            {isLoading && paginatedPOs.length === 0 && !pageError && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && paginatedPOs.length === 0 && !pageError && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  No purchase orders found.
                </td>
              </tr>
            )}
            {paginatedPOs.map((po) => (
              <tr
                key={po.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="table-cell">
                  <Link
                    to={`/purchasing/purchase-orders/${po.id}`}
                    className="font-medium text-accent hover:text-accent/80"
                  >
                    {po.poNumber}
                  </Link>
                  <div className="text-xs text-gray-500">ID: {po.id}</div>
                </td>
                <td className="table-cell">{po.vendorName || "N/A"}</td>
                <td className="table-cell">
                  {po.orderDate
                    ? new Date(po.orderDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="table-cell">
                  {po.expectedDeliveryDate
                    ? new Date(po.expectedDeliveryDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="table-cell font-semibold">
                  $
                  {po.totalAmount
                    ? po.totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"}
                </td>
                <td className="table-cell">
                  <span
                    className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      po.status
                    )}`}
                  >
                    {po.status}
                  </span>
                </td>
                <td className="table-cell-actions space-x-1">
                  <Link
                    to={`/purchasing/purchase-orders/${po.id}`}
                    title="View PO"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-accent p-1.5"
                    >
                      <Eye size={18} />
                    </Button>
                  </Link>
                  <Link
                    to={`/purchasing/purchase-orders/${po.id}/edit`}
                    title="Edit PO"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-blue-600 p-1.5"
                    >
                      <Edit size={18} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-600 p-1.5"
                    onClick={() => handleDelete(po.id)}
                    title="Delete PO"
                  >
                    <Trash2 size={18} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 /* Pagination Controls JSX - same as VendorsPage */ && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
          <div className="mb-2 sm:mb-0">
            Showing{" "}
            <span className="font-semibold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to
            <span className="font-semibold">
              {" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredPOs.length)}
            </span>{" "}
            of
            <span className="font-semibold"> {filteredPOs.length}</span> POs
          </div>
          <nav aria-label="Pagination"> {/* ... pagination ul ... */} </nav>
        </div>
      )}
    </div>
  );
};
export default PurchaseOrdersPage;
