// src/pages/invoicing/InvoiceDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getInvoiceById,
  recordInvoicePayment,
  voidInvoice as apiVoidInvoice,
} from "../../data/mockInvoices";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal"; // For record payment
import Input from "../../components/common/Input"; // For record payment form
import {
  ArrowLeft,
  Edit,
  Printer,
  FileText,
  AlertTriangle,
  DollarSign,
  CalendarCheck,
  UserCircle as CustomerIcon,
  Tag,
  Info,
  Mail as SendIcon,
  Calendar,
} from "lucide-react";
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toastNotifications";

const DetailField = ({ label, value, icon, children, className = "" }) => {
  /* ... */
};
const getStatusColor = (status) => {
  /* ... from InvoicesPage ... */
};

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // For Record Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const fetchInvoiceDetails = async () => {
    /* Similar to other detail pages */
    if (!id) {
      /* ... */ return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedInv = await getInvoiceById(id);
      if (fetchedInv) setInvoice(fetchedInv);
      else {
        setError(`Invoice "${id}" not found.`);
      }
    } catch (err) {
      setError("Failed to load invoice.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchInvoiceDetails();
  }, [id, navigate]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showErrorToast("Please enter a valid payment amount.");
      return;
    }
    if (parseFloat(paymentAmount) > invoice.balanceDue) {
      showErrorToast("Payment amount cannot exceed balance due.");
      return;
    }
    setIsSubmittingPayment(true);
    try {
      await recordInvoicePayment(
        invoice.id,
        parseFloat(paymentAmount),
        paymentDate,
        paymentMethod
      );
      showSuccessToast("Payment recorded successfully!");
      setIsPaymentModalOpen(false);
      setPaymentAmount(""); // Reset form
      fetchInvoiceDetails(); // Re-fetch to update details
    } catch (err) {
      showErrorToast(`Failed to record payment: ${err.message}`);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleVoidInvoice = async () => {
    if (
      window.confirm(
        `Are you sure you want to VOID invoice ${invoice.invoiceNumber}?`
      )
    ) {
      try {
        await apiVoidInvoice(invoice.id);
        showSuccessToast(`Invoice ${invoice.invoiceNumber} voided!`);
        fetchInvoiceDetails(); // Re-fetch
      } catch (err) {
        showErrorToast(`Failed to void: ${err.message}`);
      }
    }
  };

  if (isLoading) {
    /* ... */
  }
  if (error) {
    /* ... */
  }
  if (!invoice) {
    /* ... */ return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 bg-gray-50 min-h-screen">
      {/* Header: Title, Status, Actions */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/invoicing/invoices")}
            IconLeft={ArrowLeft}
          >
            Back to Invoices
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-2 sm:mt-0 flex items-center">
            <FileText size={28} className="mr-3 text-accent" /> Invoice:{" "}
            {invoice.invoiceNumber}
          </h1>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <span
            className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(
              invoice.status
            )}`}
          >
            Status: {invoice.status}
          </span>
          <div className="flex flex-wrap gap-2 mt-1">
            {invoice.status !== "Paid" && invoice.status !== "Void" && (
              <Link to={`/invoicing/invoices/${invoice.id}/edit`}>
                <Button variant="secondary" size="sm" IconLeft={Edit}>
                  Edit
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              IconLeft={Printer}
              onClick={() => window.print()}
            >
              Print
            </Button>
            {invoice.status !== "Paid" && invoice.status !== "Void" && (
              <Button
                variant="outline"
                size="sm"
                IconLeft={SendIcon}
                onClick={() => showInfoToast("Send invoice functionality TBD.")}
              >
                Send
              </Button>
            )}
            {invoice.status !== "Paid" &&
              invoice.status !== "Void" &&
              invoice.balanceDue > 0 && (
                <Button
                  variant="success"
                  size="sm"
                  IconLeft={DollarSign}
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  Record Payment
                </Button>
              )}
            {invoice.status !== "Paid" && invoice.status !== "Void" && (
              <Button
                variant="danger_outline"
                size="sm"
                IconLeft={AlertTriangle}
                onClick={handleVoidInvoice}
              >
                Void Invoice
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Invoice Details Card - Adapt from PODetailPage */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-6 border-b">
          <DetailField
            label="Customer"
            icon={CustomerIcon}
            value={invoice.customerName}
          />
          <DetailField
            label="Issue Date"
            icon={Calendar}
            value={new Date(invoice.issueDate).toLocaleDateString()}
          />
          <DetailField
            label="Due Date"
            icon={CalendarCheck}
            value={new Date(invoice.dueDate).toLocaleDateString()}
          />
        </div>
        {invoice.salesOrderId && (
          <DetailField
            label="Linked Sales Order"
            icon={FileText}
            value={invoice.salesOrderId}
            className="mb-6 pb-6 border-b"
          />
        )}

        {/* Items Table - similar to SO/PO detail page */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold ...">Invoice Items</h2>
          <div className="overflow-x-auto border ...">
            <table className="min-w-full ...">
              <thead>
                <tr>
                  <th>Desc</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>${item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary and Notes - adapt from SO/PO detail page */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <DetailField
              label="Payment Terms"
              icon={Tag}
              value={invoice.paymentTerms}
            />
            <DetailField label="Notes to Customer" icon={Info}>
              <p className="whitespace-pre-line ...">
                {invoice.notesToCustomer || "-"}
              </p>
            </DetailField>
            <DetailField label="Internal Notes" icon={Info}>
              <p className="whitespace-pre-line ...">
                {invoice.internalNotes || "-"}
              </p>
            </DetailField>
          </div>
          <div className="space-y-2 p-4 bg-gray-100 rounded-lg border">
            <div className="flex justify-between ...">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discountApplied > 0 && (
              <div className="flex justify-between ... text-red-600">
                <span>Discount:</span>
                <span>-${invoice.discountApplied.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between ...">
              <span>Tax:</span>
              <span>${invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between ...">
              <span>Shipping:</span>
              <span>${invoice.shippingAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold ...">
              <span>Total Amount:</span>
              <span className="text-accent">
                ${invoice.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t mt-2">
              <span>Amount Paid:</span>
              <span className="font-medium text-green-600">
                ${invoice.amountPaid.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Balance Due:</span>
              <span
                className={`${
                  invoice.balanceDue <= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${invoice.balanceDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment"
        size="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Input
            label="Payment Amount"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            step="0.01"
            min="0.01"
            max={invoice.balanceDue}
            required
            disabled={isSubmittingPayment}
          />
          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
            disabled={isSubmittingPayment}
          />
          <div>
            <label
              htmlFor="paymentMethod"
              className="block text-sm font-medium"
            >
              Payment Method
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={isSubmittingPayment}
              className="w-full mt-1 ..."
            >
              <option>Bank Transfer</option>
              <option>Credit Card</option>
              <option>Cash</option>
              <option>Check</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={isSubmittingPayment}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              disabled={isSubmittingPayment}
            >
              {isSubmittingPayment ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default InvoiceDetailPage;
