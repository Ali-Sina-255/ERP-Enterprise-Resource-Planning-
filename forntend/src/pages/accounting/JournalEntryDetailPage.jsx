// src/pages/accounting/JournalEntryDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getJournalEntryById,
  voidJournalEntry,
  deleteDraftJournalEntry,
} from "../../data/mockJournalEntries";
import Button from "../../components/common/Button";
import {
  ArrowLeft,
  Edit,
  FileText,
  AlertTriangle,
  Calendar,
  Hash,
  DollarSign,
  ListChecks,
  Info,
  Trash2,
  Archive,
  UserCircle,
  Clock,
} from "lucide-react"; // Added UserCircle, Clock
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toastNotifications";

const DetailField = ({ label, value, icon, children, className = "" }) => {
  const IconComponent = icon;
  return (
    <div className={`py-3 sm:py-2 ${className}`}>
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

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "posted":
      return "bg-green-100 text-green-800 border-green-300";
    case "voided":
      return "bg-slate-200 text-slate-600 border-slate-400 line-through opacity-70";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const JournalEntryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journalEntry, setJournalEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJEDetails = async () => {
    if (!id) {
      setError("JE ID not provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getJournalEntryById(id);
      if (data) {
        setJournalEntry(data);
      } else {
        setError(`Journal Entry with ID "${id}" not found.`);
        showErrorToast(`Journal Entry "${id}" not found.`);
      }
    } catch (err) {
      console.error("Fetch JE Detail Error:", err);
      setError("Failed to load Journal Entry details.");
      showErrorToast("Error loading Journal Entry details.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchJEDetails();
  }, [id]); // Removed navigate from deps as it's stable

  const handleDeleteDraft = async () => {
    if (!journalEntry || journalEntry.status !== "Draft") {
      showErrorToast("Only draft entries can be deleted.");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to delete DRAFT Journal Entry ${journalEntry.entryNumber}?`
      )
    ) {
      try {
        await deleteDraftJournalEntry(journalEntry.id);
        showSuccessToast("Draft JE deleted successfully!");
        navigate("/accounting/journal-entries");
      } catch (err) {
        showErrorToast(`Delete failed: ${err.message}`);
      }
    }
  };

  const handleVoid = async () => {
    if (!journalEntry || journalEntry.status !== "Posted") {
      showErrorToast("Only posted entries can be voided.");
      return;
    }
    const reason = prompt(
      `Enter reason for voiding JE ${journalEntry.entryNumber}:`,
      "Correction of error."
    );
    if (reason && reason.trim() !== "") {
      try {
        await voidJournalEntry(journalEntry.id, reason);
        showSuccessToast("Journal Entry voided successfully!");
        fetchJEDetails(); // Re-fetch to show updated status
      } catch (err) {
        showErrorToast(`Void failed: ${err.message}`);
      }
    } else if (reason !== null) {
      showInfoToast("Void reason cannot be empty.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent"></div>
        <p className="ml-4 text-xl">Loading Journal Entry...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow"
          role="alert"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3" />
            <div>
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
          <div className="mt-4 text-right">
            <Button
              variant="secondary"
              onClick={() => navigate("/accounting/journal-entries")}
              IconLeft={ArrowLeft}
            >
              Back to Journal
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (!journalEntry) {
    return (
      <div className="p-8 text-center text-gray-500">
        Journal Entry not found or could not be loaded.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/accounting/journal-entries")}
            IconLeft={ArrowLeft}
          >
            Back to Journal Entries
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-2 sm:mt-0 flex items-center">
            <FileText size={28} className="mr-3 text-accent" />
            Journal Entry: {journalEntry.entryNumber}
          </h1>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <span
            className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(
              journalEntry.status
            )}`}
          >
            Status: {journalEntry.status}
          </span>
          <div className="flex flex-wrap gap-2 mt-1">
            {journalEntry.status === "Draft" && (
              <Link to={`/accounting/journal-entries/${id}/edit`}>
                <Button variant="secondary" size="sm" IconLeft={Edit}>
                  Edit Draft
                </Button>
              </Link>
            )}
            {journalEntry.status === "Draft" && (
              <Button
                variant="danger_outline"
                size="sm"
                IconLeft={Trash2}
                onClick={handleDeleteDraft}
              >
                Delete Draft
              </Button>
            )}
            {journalEntry.status === "Posted" && (
              <Button
                variant="warning_outline"
                size="sm"
                IconLeft={Archive}
                onClick={handleVoid}
              >
                Void Entry
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-200">
          <DetailField
            label="Entry Date"
            icon={Calendar}
            value={new Date(journalEntry.entryDate).toLocaleDateString()}
          />
          <DetailField
            label="Reference #"
            icon={Hash}
            value={journalEntry.referenceNumber}
          />
          <DetailField
            label="Internal ID"
            icon={Hash}
            value={journalEntry.id}
          />
        </div>
        <DetailField
          label="Description / Memo"
          icon={Info}
          value={journalEntry.description}
          className="mb-6 pb-6 border-b border-gray-200"
        />

        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Journal Lines
        </h2>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium w-1/4">
                  Account ID
                </th>
                <th className="px-4 py-3 text-left font-medium w-2/5">
                  Account Name
                </th>
                <th className="px-4 py-3 text-right font-medium">Debit</th>
                <th className="px-4 py-3 text-right font-medium">Credit</th>
                <th className="px-4 py-3 text-left font-medium">
                  Line Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {journalEntry.lines.map((line, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-gray-700">{line.accountId}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {line.accountName}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-mono">
                    {line.debit > 0 ? `$${line.debit.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-mono">
                    {line.credit > 0 ? `$${line.credit.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {line.description || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold text-gray-800">
              <tr>
                <td colSpan="2" className="px-4 py-3 text-right uppercase">
                  Totals:
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  ${journalEntry.totalDebits.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  ${journalEntry.totalCredits.toFixed(2)}
                </td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          <DetailField
            label="Created By (User ID)"
            icon={UserCircle}
            value={journalEntry.createdBy}
          />
          {journalEntry.postedDate && (
            <DetailField
              label="Posted Date"
              icon={Clock}
              value={new Date(journalEntry.postedDate).toLocaleString()}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default JournalEntryDetailPage;
