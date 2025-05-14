// src/pages/accounting/JournalEntriesPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getJournalEntries,
  deleteDraftJournalEntry,
  voidJournalEntry,
} from "../../data/mockJournalEntries";
import Button from "../../components/common/Button";
import {
  PlusCircle,
  Edit,
  Eye,
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Trash2,
  Archive,
} from "lucide-react";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../../utils/toastNotifications";
// CSV Export can be added later for JEs if needed, similar to other pages

const ITEMS_PER_PAGE = 10;
const JE_STATUS_OPTIONS = ["Draft", "Posted", "Voided", ""]; // Empty string for "All Statuses"

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "posted":
      return "bg-green-100 text-green-800 border-green-300";
    case "voided":
      return "bg-slate-200 text-slate-600 border-slate-400 line-through opacity-70";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"; // For unknown or empty
  }
};

const JournalEntriesPage = () => {
  const [allJEs, setAllJEs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchJEs = async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const data = await getJournalEntries();
      setAllJEs(data || []);
    } catch (err) {
      console.error("Failed to fetch Journal Entries:", err);
      setPageError("Failed to load Journal Entries. Please try again later.");
      showErrorToast("Error loading Journal Entries list.");
      setAllJEs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJEs();
  }, []);

  const filteredJEs = useMemo(() => {
    let results = allJEs;
    if (statusFilter) {
      results = results.filter((je) => je.status === statusFilter);
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm) return results;
    return results.filter(
      (je) =>
        je.entryNumber.toLowerCase().includes(lowerSearchTerm) ||
        je.description.toLowerCase().includes(lowerSearchTerm) ||
        // You could also search through line item descriptions or account names if needed
        (je.lines &&
          je.lines.some(
            (line) =>
              line.description?.toLowerCase().includes(lowerSearchTerm) ||
              line.accountName?.toLowerCase().includes(lowerSearchTerm)
          ))
    );
  }, [searchTerm, statusFilter, allJEs]);

  const totalPages = Math.ceil(filteredJEs.length / ITEMS_PER_PAGE);
  const paginatedJEs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJEs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredJEs, currentPage]);

  useEffect(() => {
    // Page reset logic
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (
      totalPages === 0 &&
      filteredJEs.length > 0 &&
      currentPage !== 1
    ) {
      setCurrentPage(1);
    } else if (currentPage === 0 && totalPages > 0) {
      // Ensure current page is at least 1
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, filteredJEs.length, totalPages, currentPage]);

  const handleDeleteDraft = async (jeId, jeNumber) => {
    if (
      window.confirm(
        `Are you sure you want to delete DRAFT Journal Entry ${jeNumber}? This action cannot be undone.`
      )
    ) {
      try {
        const result = await deleteDraftJournalEntry(jeId);
        if (result.success) {
          showSuccessToast("Draft Journal Entry deleted successfully!");
          fetchJEs(); // Re-fetch to update the list
        } else {
          showErrorToast(result.message || "Failed to delete draft JE.");
        }
      } catch (err) {
        showErrorToast(`Delete failed: ${err.message}`);
      }
    }
  };

  const handleVoid = async (jeId, jeNumber) => {
    const reason = prompt(
      `Please enter a reason for voiding Journal Entry ${jeNumber}:`,
      "Correction of error."
    );
    if (reason && reason.trim() !== "") {
      try {
        await voidJournalEntry(jeId, reason);
        showSuccessToast(`Journal Entry ${jeNumber} voided successfully!`);
        fetchJEs(); // Re-fetch
      } catch (err) {
        showErrorToast(`Void failed: ${err.message}`);
      }
    } else if (reason !== null) {
      // User didn't cancel prompt but left it empty
      showInfoToast("Void reason cannot be empty.");
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
      if (currentPage > halfPagesToShow + 2 && totalPages > maxPagesToShow)
        pageNumbers.push("...");

      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);

      if (currentPage <= halfPagesToShow + 1)
        endPage = Math.min(totalPages - 1, maxPagesToShow - 2);
      if (currentPage >= totalPages - halfPagesToShow)
        startPage = Math.max(2, totalPages - maxPagesToShow + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (i > 0 && i <= totalPages) pageNumbers.push(i);
      }

      if (
        currentPage < totalPages - halfPagesToShow - 1 &&
        totalPages > maxPagesToShow &&
        endPage < totalPages - 1
      )
        pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
    // Remove duplicate '...' or numbers if logic above creates overlaps with small totalPages
    return pageNumbers
      .filter((item, index, self) =>
        item === "..."
          ? self.indexOf(item, index - 1) === -1 ||
            self.indexOf(item, index + 1) === -1
          : self.indexOf(item) === index
      )
      .filter(Boolean); // Remove any potential undefined/null from complex logic
  };

  if (isLoading && !allJEs.length && !pageError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading Journal Entries...</p>
      </div>
    );
  }
  if (pageError && !allJEs.length) {
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
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
          <ListChecks size={32} className="mr-3 text-accent" /> Journal Entries
        </h1>
        <Link to="/accounting/journal-entries/new">
          <Button variant="primary" IconLeft={PlusCircle} size="md">
            New Journal Entry
          </Button>
        </Link>
      </div>

      <div className="mb-6 p-4 bg-white shadow rounded-lg flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full sm:w-1/2">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search Entry # or Description..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/80 focus:border-accent sm:text-sm placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto sm:min-w-[200px]">
          <label htmlFor="statusFilterJE" className="sr-only">
            Filter by Status
          </label>
          <select
            id="statusFilterJE"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full px-3 py-2.5 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
          >
            <option value="">All Statuses</option>
            {JE_STATUS_OPTIONS.filter((s) => s).map((s) => (
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
                Entry #
              </th>
              <th scope="col" className="table-header">
                Date
              </th>
              <th scope="col" className="table-header">
                Description
              </th>
              <th scope="col" className="table-header text-right">
                Total Debits
              </th>
              <th scope="col" className="table-header text-right">
                Total Credits
              </th>
              <th scope="col" className="table-header text-center">
                Status
              </th>
              <th scope="col" className="table-header text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && paginatedJEs.length === 0 && !pageError && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    <p className="ml-3">Loading data...</p>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && paginatedJEs.length === 0 && !pageError && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  No journal entries found
                  {searchTerm || statusFilter
                    ? " matching your criteria"
                    : ". Create one to get started"}
                  .
                </td>
              </tr>
            )}

            {paginatedJEs.map((je) => (
              <tr
                key={je.id}
                className={`hover:bg-gray-50 transition-colors duration-150 ${
                  je.status === "Voided" ? "opacity-60 bg-slate-50" : ""
                }`}
              >
                <td className="table-cell">
                  <Link
                    to={`/accounting/journal-entries/${je.id}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {je.entryNumber}
                  </Link>
                  <div className="text-xs text-gray-500">ID: {je.id}</div>
                </td>
                <td className="table-cell">
                  {je.entryDate
                    ? new Date(je.entryDate).toLocaleDateString()
                    : "-"}
                </td>
                <td
                  className="table-cell truncate max-w-sm"
                  title={je.description}
                >
                  {je.description}
                </td>
                <td className="table-cell text-right font-mono">
                  ${je.totalDebits?.toFixed(2) || "0.00"}
                </td>
                <td className="table-cell text-right font-mono">
                  ${je.totalCredits?.toFixed(2) || "0.00"}
                </td>
                <td className="table-cell text-center">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                      je.status
                    )}`}
                  >
                    {je.status}
                  </span>
                </td>
                <td className="table-cell-actions space-x-1">
                  <Link
                    to={`/accounting/journal-entries/${je.id}`}
                    title="View Journal Entry"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5 text-gray-500 hover:text-accent"
                    >
                      <Eye size={18} />
                    </Button>
                  </Link>
                  {je.status === "Draft" && (
                    <Link
                      to={`/accounting/journal-entries/${je.id}/edit`}
                      title="Edit Draft"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 text-gray-500 hover:text-blue-600"
                      >
                        <Edit size={18} />
                      </Button>
                    </Link>
                  )}
                  {je.status === "Draft" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5 text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteDraft(je.id, je.entryNumber)}
                      title="Delete Draft"
                    >
                      <Trash2 size={18} />
                    </Button>
                  )}
                  {je.status === "Posted" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1.5 text-orange-500 hover:text-orange-700"
                      onClick={() => handleVoid(je.id, je.entryNumber)}
                      title="Void Journal Entry"
                    >
                      <Archive size={18} />
                    </Button>
                  )}
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
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredJEs.length)}
            </span>{" "}
            of
            <span className="font-semibold"> {filteredJEs.length}</span> entries
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
                    <span className="px-2 py-1.5 md:px-3 md:py-2 text-gray-500">
                      ...
                    </span>
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
export default JournalEntriesPage;
