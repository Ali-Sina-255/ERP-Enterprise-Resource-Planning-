// src/pages/invoicing/EditInvoicePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InvoiceForm from "../../components/invoicing/InvoiceForm";
import {
  getInvoiceById,
  updateInvoice as apiUpdateInvoice,
} from "../../data/mockInvoices";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toastNotifications";
import Button from "../../components/common/Button";
import { ArrowLeft, AlertTriangle, FileSpreadsheet } from "lucide-react";

const EditInvoicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialInvData, setInitialInvData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    const fetchInv = async () => {
      if (!id) {
        setPageError("No Invoice ID.");
        showErrorToast("Invalid Invoice ID.");
        setIsLoading(false);
        navigate("/invoicing/invoices");
        return;
      }
      setIsLoading(true);
      setPageError(null);
      try {
        const fetchedInv = await getInvoiceById(id);
        if (fetchedInv) {
          // Cannot edit Paid or Void invoices (or allow only very limited edits)
          if (fetchedInv.status === "Paid" || fetchedInv.status === "Void") {
            showErrorToast(
              `Cannot edit a ${fetchedInv.status.toLowerCase()} invoice. View only.`
            );
            navigate(`/invoicing/invoices/${id}`); // Redirect to detail view
            return;
          }
          setInitialInvData(fetchedInv);
        } else {
          setPageError(`Invoice "${id}" not found.`);
          showWarningToast(`Invoice "${id}" not found.`);
          navigate("/invoicing/invoices");
        }
      } catch (err) {
        console.error("Edit Invoice Fetch Error:", err);
        setPageError("Failed to load invoice for editing.");
        showErrorToast("Error loading invoice.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInv();
  }, [id, navigate]);

  const handleSubmit = async (invData) => {
    setIsSubmitting(true);
    try {
      const updatedInv = await apiUpdateInvoice(id, invData);
      showSuccessToast(
        `Invoice ${updatedInv.invoiceNumber} updated successfully!`
      );
      navigate(`/invoicing/invoices/${updatedInv.id}`);
    } catch (err) {
      console.error("Update Invoice Error:", err);
      showErrorToast(`Failed to update invoice. ${err.message || ""}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent"></div>
        <p className="ml-4 text-xl">Loading Invoice for Editing...</p>
      </div>
    );
  }
  if (pageError && !initialInvData) {
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
              onClick={() => navigate("/invoicing/invoices")}
              IconLeft={ArrowLeft}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (!initialInvData && !isLoading) {
    return (
      <div className="p-8 text-center">Could not load invoice for editing.</div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/invoicing/invoices/${id}`)}
          IconLeft={ArrowLeft}
          className="mr-4"
        >
          Back to Invoice Details
        </Button>
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
          <FileSpreadsheet size={28} className="mr-2 text-accent" />
          Edit Invoice:
          <span className="text-accent ml-2">
            {initialInvData?.invoiceNumber}
          </span>
        </h1>
      </div>
      {initialInvData && (
        <InvoiceForm
          initialData={initialInvData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditMode={true}
        />
      )}
    </div>
  );
};
export default EditInvoicePage;
