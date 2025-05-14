// src/pages/accounting/CreateJournalEntryPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JournalEntryForm from "../../components/accounting/JournalEntryForm";
import { addJournalEntry } from "../../data/mockJournalEntries";
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toastNotifications";
import Button from "../../components/common/Button";
import { ArrowLeft, Edit as EditIcon } from "lucide-react"; // Using EditIcon for clarity

const CreateJournalEntryPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (jeData) => {
    setIsSubmitting(true);
    try {
      const newJE = await addJournalEntry(jeData);
      showSuccessToast(
        `Journal Entry ${newJE.entryNumber} created successfully!`
      );
      navigate(`/accounting/journal-entries/${newJE.id}`); // Navigate to detail page
    } catch (error) {
      console.error("Failed to create Journal Entry:", error);
      showErrorToast(`Failed to create JE. ${error.message || ""}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/accounting/journal-entries")}
          IconLeft={ArrowLeft}
          className="mr-4"
        >
          Back to Journal
        </Button>
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
          <EditIcon size={28} className="mr-3 text-accent" /> Create New Journal
          Entry
        </h1>
      </div>
      <JournalEntryForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/accounting/journal-entries")}
        isSubmitting={isSubmitting}
        isEditMode={false}
      />
    </div>
  );
};

export default CreateJournalEntryPage;
