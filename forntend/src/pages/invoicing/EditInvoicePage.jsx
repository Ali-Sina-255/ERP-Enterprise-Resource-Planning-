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
    /* Fetch logic using getInvoiceById */
    const fetchInv = async () => {
      /* ... */
    };
    fetchInv();
  }, [id, navigate]);

  const handleSubmit = async (invData) => {
    /* Submit logic using apiUpdateInvoice */
    setIsSubmitting(true);
    try {
      const updatedInv = await apiUpdateInvoice(id, invData);
      showSuccessToast(`Invoice ${updatedInv.invoiceNumber} updated!`);
      navigate(`/invoicing/invoices/${updatedInv.id}`);
    } catch (err) {
      showErrorToast(`Update failed: ${err.message || ""}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    /* ... */
  }
  if (pageError && !initialInvData) {
    /* ... */
  }
  if (!initialInvData && !isLoading) {
    /* ... */
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
          Back to Invoice
        </Button>
        <h1 className="text-3xl font-semibold ...">
          <FileSpreadsheet className="mr-2 ..." />
          Edit Invoice:{" "}
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
