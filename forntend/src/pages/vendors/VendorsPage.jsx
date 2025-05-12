import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getVendors,
  deleteVendor as apiDeleteVendor,
} from "../../data/mockVendors";
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
  Download,
} from "lucide-react"; // Added Download
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../../utils/toastNotifications"; // Added showInfoToast
import { exportToCsv } from "../../utils/exportUtils"; // Import the export utility

const ITEMS_PER_PAGE = 7;

const VendorsPage = () => {
  const [allVendors, setAllVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      setPageError(null);
      try {
        const data = await getVendors();
        setAllVendors(data || []);
      } catch (err) {
        console.error("Failed to fetch vendors:", err);
        setPageError("Failed to load vendors. Please try again later.");
        showErrorToast("Error loading vendors list.");
        setAllVendors([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filteredVendors = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm) {
      return allVendors;
    }
    return allVendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(lowerSearchTerm) ||
        (vendor.email &&
          vendor.email.toLowerCase().includes(lowerSearchTerm)) ||
        (vendor.category &&
          vendor.category.toLowerCase().includes(lowerSearchTerm))
    );
  }, [searchTerm, allVendors]);

  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredVendors.slice(startIndex, endIndex);
  }, [filteredVendors, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && filteredVendors.length > 0) {
      setCurrentPage(1);
    } else if (currentPage === 0 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [searchTerm, filteredVendors.length, totalPages, currentPage]);

  const vendorExportColumns = [
    { key: "id", header: "Internal ID" },
    { key: "name", header: "Vendor Name" },
    { key: "contactPerson", header: "Contact Person" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "category", header: "Category" },
    { key: "status", header: "Status" },
    { key: "address", header: "Address" },
    { key: "joinedDate", header: "Joined Date" },
    { key: "notes", header: "Notes" },
  ];

  const handleExportVendors = () => {
    if (filteredVendors.length === 0) {
      showInfoToast("No vendors to export based on current filters.");
      return;
    }
    // Pass a copy of filteredVendors to avoid potential mutation issues if exportToCsv modifies it
    exportToCsv([...filteredVendors], vendorExportColumns, "vendors_list");
    showInfoToast("Vendors list is being downloaded.");
  };

  const handleDelete = async (vendorId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this vendor? This action cannot be undone."
      )
    ) {
      try {
        await apiDeleteVendor(vendorId);
        const updatedVendors = allVendors.filter((v) => v.id !== vendorId);
        setAllVendors(updatedVendors);
        showSuccessToast("Vendor deleted successfully!");
        if (paginatedVendors.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error("Failed to delete vendor:", err);
        showErrorToast("Failed to delete vendor.");
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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

  if (isLoading && !allVendors.length && !pageError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading vendors...</p>
      </div>
    );
  }

  if (pageError && !allVendors.length) {
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
        <h1 className="text-3xl font-semibold text-gray-800">Manage Vendors</h1>
        <div className="flex items-center space-x-2 sm:space-x-3">
          {" "}
          {/* Group for buttons */}
          <Button
            variant="outline"
            IconLeft={Download}
            onClick={handleExportVendors}
            disabled={isLoading || filteredVendors.length === 0}
            size="md" // Ensure consistent button size
          >
            Export CSV
          </Button>
          <Link to="/vendors/new">
            <Button variant="primary" IconLeft={PlusCircle} size="md">
              Add New Vendor
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or category..."
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
                Name
              </th>
              <th scope="col" className="table-header">
                Contact Person
              </th>
              <th scope="col" className="table-header">
                Email
              </th>
              <th scope="col" className="table-header">
                Category
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
            {isLoading && paginatedVendors.length === 0 && !pageError && (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    <p className="ml-3">Loading data...</p>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && paginatedVendors.length === 0 && !pageError && (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  No vendors found matching your criteria.
                  {searchTerm &&
                    allVendors.length > 0 &&
                    " Try a different search term."}
                  {!searchTerm &&
                    allVendors.length === 0 &&
                    " No vendors available yet."}
                </td>
              </tr>
            )}
            {paginatedVendors.map((vendor) => (
              <tr
                key={vendor.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="table-cell">
                  <div className="font-medium text-gray-900">{vendor.name}</div>
                  <div className="text-xs text-gray-500">ID: {vendor.id}</div>
                </td>
                <td className="table-cell">{vendor.contactPerson || "-"}</td>
                <td className="table-cell">{vendor.email || "-"}</td>
                <td className="table-cell">{vendor.category || "-"}</td>
                <td className="table-cell">
                  <span
                    className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      vendor.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : vendor.status === "Inactive"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {vendor.status}
                  </span>
                </td>
                <td className="table-cell-actions space-x-1">
                  <Link to={`/vendors/${vendor.id}`} title="View Details">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-accent p-1.5"
                    >
                      <Eye size={18} />
                    </Button>
                  </Link>
                  <Link to={`/vendors/${vendor.id}/edit`} title="Edit Vendor">
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
                    onClick={() => handleDelete(vendor.id)}
                    title="Delete Vendor"
                  >
                    <Trash2 size={18} />
                  </Button>
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
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredVendors.length)}
            </span>{" "}
            of
            <span className="font-semibold">
              {" "}
              {filteredVendors.length}
            </span>{" "}
            vendors
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
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} />
                  <span className="hidden md:inline ml-1">Prev</span>
                </Button>
              </li>
              {getPageNumbers().map((page, index) => (
                <li key={`page-${page === "..." ? `ellipsis-${index}` : page}`}>
                  {page === "..." ? (
                    <span className="px-2 py-1.5 md:px-3 md:py-2 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      className="px-2.5 py-1.5 md:px-3.5 md:py-2"
                      onClick={() => handlePageChange(page)}
                      aria-current={currentPage === page ? "page" : undefined}
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
                  aria-label="Next"
                >
                  <span className="hidden md:inline mr-1">Next</span>
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

export default VendorsPage;
