// src/pages/accounting/EditJournalEntryPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import JournalEntryForm from "../../components/accounting/JournalEntryForm";
import {
  getJournalEntryById,
  updateJournalEntry,
} from "../../data/mockJournalEntries";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toastNotifications";
import Button from "../../components/common/Button";
import { ArrowLeft, AlertTriangle, Edit as EditIcon } from "lucide-react";

const EditJournalEntryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialJEData, setInitialJEData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    const fetchJE = async () => {
      if (!id) {
        setPageError("No Journal Entry ID provided.");
        showErrorToast("Invalid Journal Entry ID.");
        setIsLoading(false);
        navigate("/accounting/journal-entries");
        return;
      }
      setIsLoading(true);
      setPageError(null);
      try {
        const fetchedJE = await getJournalEntryById(id);
        if (fetchedJE) {
          if (fetchedJE.status === "Posted" || fetchedJE.status === "Voided") {
            showWarningToast(
              `Cannot edit a ${fetchedJE.status.toLowerCase()} journal entry. View only.`
            );
            navigate(`/accounting/journal-entries/${id}`); // Redirect to detail view
            return;
          }
          setInitialJEData(fetchedJE);
        } else {
          setPageError(`Journal Entry with ID "${id}" not found.`);
          showWarningToast(`Journal Entry "${id}" not found.`);
          navigate("/accounting/journal-entries");
        }
      } catch (err) {
        console.error("Fetch JE for Edit Error:", err);
        setPageError("Failed to load Journal Entry for editing.");
        showErrorToast("Error loading Journal Entry.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJE();
  }, [id, navigate]);

  const handleSubmit = async (jeData) => {
    setIsSubmitting(true);
    try {
      const updatedJE = await updateJournalEntry(id, jeData);
      showSuccessToast(
        `Journal Entry ${updatedJE.entryNumber} updated successfully!`
      );
      navigate(`/accounting/journal-entries/${updatedJE.id}`);
    } catch (error) {
      console.error("Update Journal Entry Error:", error);
      showErrorToast(`Failed to update JE. ${error.message || ""}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent"></div>
        <p className="ml-4 text-xl">Loading JE for Editing...</p>
      </div>
    );
  }
  if (pageError && !initialJEData) {
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
              <p>{pageError}</p>
            </div>
          </div>
          <div className="mt-4 text-right">
            <Button
              variant="secondary"
              onClick={() => navigate("/accounting/journal-entries")}
              IconLeft={ArrowLeft}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (!initialJEData && !isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Could not load Journal Entry data for editing.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/accounting/journal-entries/${id}`)}
          IconLeft={ArrowLeft}
          className="mr-4"
        >
          Back to JE Details
        </Button>
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
          <EditIcon size={28} className="mr-3 text-accent" />
          Edit Journal Entry:
          <span className="text-accent ml-2">{initialJEData?.entryNumber}</span>
        </h1>
      </div>
      {initialJEData && (
        <JournalEntryForm
          initialData={initialJEData}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/accounting/journal-entries/${id}`)}
          isEditMode={true}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
export default EditJournalEntryPage;
