// src/pages/invoicing/InvoiceDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getInvoiceById,
  recordInvoicePayment,
  voidInvoice as apiVoidInvoice,
} from "../../data/mockInvoices";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
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
  CheckCircle,
} from "lucide-react";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../../utils/toastNotifications";

const DetailField = ({ label, value, icon, children, className = "" }) => {
  const IconComponent = icon;
  return (
    <div className={`flex items-start py-3 sm:py-2 ${className}`}>
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
      return "bg-gray-100 text-gray-800 border-gray-300";
    case "sent":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "partially paid":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "paid":
      return "bg-green-100 text-green-800 border-green-300";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-300";
    case "void":
      return "bg-slate-200 text-slate-600 border-slate-400 line-through opacity-70"; // Added opacity
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
  }
};

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const fetchInvoiceDetails = async () => {
    if (!id) {
      setError("Invoice ID not provided.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedInv = await getInvoiceById(id);
      if (fetchedInv) {
        setInvoice(fetchedInv);
        setPaymentAmount(
          fetchedInv.balanceDue > 0 ? fetchedInv.balanceDue.toFixed(2) : ""
        ); // Pre-fill payment amount
      } else {
        setError(`Invoice "${id}" not found.`);
      }
    } catch (err) {
      console.error("Fetch Invoice Detail Error:", err);
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
      showErrorToast("Valid payment amount required.");
      return;
    }
    if (parseFloat(paymentAmount) > invoice.balanceDue) {
      showErrorToast("Payment exceeds balance due.");
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
      setPaymentAmount("");
      fetchInvoiceDetails();
    } catch (err) {
      showErrorToast(`Payment record failed: ${err.message}`);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleVoidInvoice = async () => {
    if (invoice.status === "Paid") {
      showErrorToast("Cannot void a paid invoice.");
      return;
    }
    if (invoice.status === "Void") {
      showInfoToast("Invoice is already void.");
      return;
    }
    if (
      window.confirm(
        `VOID invoice ${invoice.invoiceNumber}? This cannot be undone.`
      )
    ) {
      try {
        await apiVoidInvoice(invoice.id);
        showSuccessToast(`Invoice ${invoice.invoiceNumber} voided!`);
        fetchInvoiceDetails();
      } catch (err) {
        showErrorToast(`Failed to void: ${err.message}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent"></div>
        <p className="ml-4 text-xl">Loading Invoice...</p>
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
  if (!invoice) {
    return <div className="p-8 text-center">Invoice not found.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 bg-gray-50 min-h-screen">
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
            {(invoice.status === "Draft" ||
              invoice.status === "Sent" ||
              invoice.status === "Overdue" ||
              invoice.status === "Partially Paid") && (
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
            {(invoice.status === "Draft" || invoice.status === "Sent") && (
              <Button
                variant="outline"
                size="sm"
                IconLeft={SendIcon}
                onClick={() =>
                  showInfoToast(
                    `Simulating sending invoice ${invoice.invoiceNumber}...`
                  )
                }
              >
                Send Email
              </Button>
            )}
            {invoice.status !== "Paid" &&
              invoice.status !== "Void" &&
              invoice.balanceDue > 0 && (
                <Button
                  variant="success"
                  size="sm"
                  IconLeft={DollarSign}
                  onClick={() => {
                    setPaymentAmount(invoice.balanceDue.toFixed(2));
                    setIsPaymentModalOpen(true);
                  }}
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

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Invoice Items
          </h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Total Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      ${(parseFloat(item.unitPrice) || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      ${(parseFloat(item.totalPrice) || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {invoice.items.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">
                      No items on this invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <DetailField
              label="Payment Terms"
              icon={Tag}
              value={invoice.paymentTerms}
            />
            <DetailField label="Notes to Customer" icon={Info}>
              <p className="whitespace-pre-line p-3 bg-gray-50 rounded-md border min-h-[60px] text-sm">
                {invoice.notesToCustomer || "-"}
              </p>
            </DetailField>
            <DetailField label="Internal Notes" icon={Info}>
              <p className="whitespace-pre-line p-3 bg-gray-50 rounded-md border min-h-[60px] text-sm">
                {invoice.internalNotes || "-"}
              </p>
            </DetailField>
          </div>
          <div className="space-y-2 p-4 bg-gray-100 rounded-lg border">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">
                ${invoice.subtotal.toFixed(2)}
              </span>
            </div>
            {invoice.discountApplied > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount Applied:</span>
                <span>-${invoice.discountApplied.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Tax Amount:</span>
              <span className="font-medium">
                ${invoice.taxAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping:</span>
              <span className="font-medium">
                ${invoice.shippingAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
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
            <div
              className={`flex justify-between text-lg font-bold ${
                invoice.balanceDue <= 0 && invoice.totalAmount > 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              <span>Balance Due:</span>
              <span>${invoice.balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment"
        size="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-1 bg-blue-50 border border-blue-200 rounded-md text-center">
            <p className="text-sm text-blue-700">
              Invoice:{" "}
              <span className="font-semibold">{invoice.invoiceNumber}</span>
            </p>
            <p className="text-sm text-blue-700">
              Current Balance Due:{" "}
              <span className="font-semibold">
                ${invoice.balanceDue.toFixed(2)}
              </span>
            </p>
          </div>
          <Input
            label="Payment Amount"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            step="0.01"
            min="0.01"
            max={invoice.balanceDue.toFixed(2)}
            required
            disabled={isSubmittingPayment}
            autoFocus
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Method
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={isSubmittingPayment}
              className="block w-full px-3 py-2.5 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
            >
              <option>Bank Transfer</option>
              <option>Credit Card</option>
              <option>Cash</option>
              <option>Check</option>
              <option>Online Payment</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-3">
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
              IconLeft={CheckCircle}
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
