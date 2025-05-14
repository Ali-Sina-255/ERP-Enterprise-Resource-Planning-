// src/pages/invoicing/CreateInvoicePage.jsx
import React, { useState, useEffect } from "react"; // Added useEffect
import { useNavigate, useLocation } from "react-router-dom";
import InvoiceForm from "../../components/invoicing/InvoiceForm";
import {
  addInvoice as apiAddInvoice,
  getSalesOrderForInvoice,
} from "../../data/mockInvoices"; // getSalesOrderForInvoice might be needed if we only pass SO ID
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../../utils/toastNotifications";
import Button from "../../components/common/Button";
import { ArrowLeft } from "lucide-react";

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null); // State to hold prefill data
  const [isLoadingPrefill, setIsLoadingPrefill] = useState(true); // Loading state for prefill

  useEffect(() => {
    const prefillFromSO = location.state?.fromSalesOrder;

    if (prefillFromSO) {
      showInfoToast("Pre-filling invoice from Sales Order...");
      // The fromSalesOrder object passed from SalesOrderDetailPage should already contain
      // customerId, salesOrderId, items (mapped), shippingAddress, billingAddress, paymentTerms,
      // taxPercent, shippingAmount, discountApplied.
      // We just need to set it as initial data for the InvoiceForm.

      // Construct the initial data for InvoiceForm based on prefillDataFromSO
      // Ensure items have 'description', 'quantity', 'unitPrice'
      const preparedInitialData = {
        customerId: prefillDataFromSO.customerId || "",
        salesOrderId: prefillDataFromSO.salesOrderId || "",
        issueDate: new Date().toISOString().split("T")[0], // Default to today
        dueDate: "", // User should set this, or derive from paymentTerms
        status: "Draft", // Default for new invoice
        items: prefillDataFromSO.items || [],
        shippingAddress: prefillDataFromSO.shippingAddress || "",
        billingAddress: prefillDataFromSO.billingAddress || "",
        paymentTerms: prefillDataFromSO.paymentTerms || "Net 30",
        notesToCustomer: `Based on Sales Order: ${
          prefillDataFromSO.salesOrderNumber || prefillDataFromSO.salesOrderId
        }`, // Add a note
        internalNotes: "",
        // Financials from SO are starting points; InvoiceForm's calculations will take over
        // The InvoiceForm itself will use its own default taxPercent if not provided here.
        taxPercent:
          prefillDataFromSO.taxPercent !== undefined
            ? prefillDataFromSO.taxPercent
            : 7,
        shippingAmount:
          prefillDataFromSO.shippingAmount !== undefined
            ? prefillDataFromSO.shippingAmount
            : 0,
        discountApplied:
          prefillDataFromSO.discountApplied !== undefined
            ? prefillDataFromSO.discountApplied
            : 0,
        // amountPaid and balanceDue will be 0 initially for a new invoice
      };
      setInitialFormData(preparedInitialData);
      setIsLoadingPrefill(false);
    } else {
      // No prefill data, use default empty form for manual invoice creation
      setInitialFormData({
        /* You can set your default empty state here or let InvoiceForm handle it */
      });
      setIsLoadingPrefill(false);
    }
  }, [location.state]);

  const handleSubmit = async (invoiceData) => {
    setIsSubmitting(true);
    try {
      // The invoiceData from InvoiceForm should be ready for submission
      const newInvoice = await apiAddInvoice(invoiceData);
      showSuccessToast(
        `Invoice ${newInvoice.invoiceNumber} created successfully!`
      );
      navigate(`/invoicing/invoices/${newInvoice.id}`); // Navigate to new invoice's detail page
    } catch (error) {
      console.error("Failed to create Invoice:", error);
      showErrorToast(
        `Failed to create Invoice. ${error.message || "Please try again."}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPrefill) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent"></div>
        <p className="ml-4 text-xl text-gray-600">Preparing Invoice Form...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/invoicing/invoices")}
          IconLeft={ArrowLeft}
          className="mr-4"
        >
          Back to Invoices
        </Button>
        <h1 className="text-3xl font-semibold text-gray-800">
          {initialFormData?.salesOrderId
            ? "Create Invoice from Sales Order"
            : "Create New Invoice"}
        </h1>
      </div>
      <InvoiceForm
        initialData={initialFormData || {}} // Pass fetched/prepared initial data or empty object
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEditMode={false} // This is always for creating a new invoice
      />
    </div>
  );
};

export default CreateInvoicePage;
