// src/components/invoicing/InvoiceForm.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../common/Input";
import Button from "../common/Button";
import {
  Save,
  XCircle,
  PlusCircle,
  Trash2,
  DollarSign,
  Percent,
} from "lucide-react";
import { getCustomers } from "../../data/mockCustomers";
import {
  getSalesOrders,
  getSalesOrderForInvoice,
} from "../../data/mockSalesOrders"; // To select SO
import { showInfoToast, showErrorToast } from "../../utils/toastNotifications";
import { calculateInvoiceTotals } from "../../data/mockInvoices"; // Use the calculation from mock

const InvoiceForm = ({
  initialData,
  onSubmit,
  isEditMode = false,
  isSubmitting = false,
}) => {
  const navigate = useNavigate();
  const defaultFormData = {
    customerId: "",
    salesOrderId: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "Draft",
    items: [],
    paymentTerms: "Net 30",
    notesToCustomer: "",
    internalNotes: "",
    subtotal: 0,
    discountApplied: 0,
    taxPercent: 7,
    taxAmount: 0,
    shippingAmount: 0,
    totalAmount: 0,
    amountPaid: 0,
    balanceDue: 0,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [availableSOs, setAvailableSOs] = useState([]); // SOs for the selected customer
  const [productSearchTerm, setProductSearchTerm] = useState(""); // For manually adding items
  // In a real app, products would be fetched for manual item addition
  const [allProducts, setAllProducts] = useState([
    { id: "manual01", name: "Consulting Service", sellingPrice: 100 },
    { id: "manual02", name: "Custom Widget", sellingPrice: 50 },
  ]);
  const [productSearchResults, setProductSearchResults] = useState([]);
  const productSearchRef = useRef(null);
  const [isProductSearchFocused, setIsProductSearchFocused] = useState(false);

  useEffect(() => {
    /* Fetch Customers */
    const fetchInitialData = async () => {
      try {
        const customerData = await getCustomers();
        setCustomers(customerData || []);
        // If editing, and SO ID exists, fetch that SO to potentially pre-fill or link
        if (isEditMode && initialData?.salesOrderId) {
          const soDetails = await getSalesOrderForInvoice(
            initialData.salesOrderId
          );
          // You might use soDetails to show linked SO info or for other logic
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchInitialData();
  }, [isEditMode, initialData?.salesOrderId]);

  useEffect(() => {
    /* Initialize or Reset Form */
    if (isEditMode && initialData) {
      setFormData({
        ...defaultFormData,
        ...initialData,
        items: initialData.items
          ? JSON.parse(JSON.stringify(initialData.items))
          : [],
      });
    } else if (!isEditMode) {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [initialData, isEditMode]);

  // Fetch Sales Orders for selected customer (if creating from SO)
  useEffect(() => {
    const fetchSOsForCustomer = async () => {
      if (formData.customerId && !isEditMode) {
        // Only fetch if customer selected and not editing (where SO is fixed)
        try {
          const allSOs = await getSalesOrders(); // In real app, filter by customerId on backend
          setAvailableSOs(
            allSOs.filter(
              (so) =>
                so.customerId === formData.customerId &&
                (so.status === "Shipped" ||
                  so.status === "Pending Fulfillment" ||
                  so.status === "Completed") /* Or other invoiceable statuses */
            )
          );
        } catch (error) {
          console.error("Error fetching SOs for customer:", error);
        }
      } else {
        setAvailableSOs([]);
      }
    };
    fetchSOsForCustomer();
  }, [formData.customerId, isEditMode]);

  const recalculateAndSetTotals = useCallback(() => {
    const calculated = calculateInvoiceTotals(
      formData.items,
      formData.taxPercent,
      formData.shippingAmount,
      formData.discountApplied
    );
    const currentAmountPaid = parseFloat(formData.amountPaid) || 0;
    setFormData((prev) => ({
      ...prev,
      items: calculated.items,
      subtotal: calculated.subtotal,
      // discountApplied: calculated.discountApplied, // This is an input field for overall discount
      taxAmount: calculated.taxAmount,
      // shippingAmount: calculated.shippingAmount, // This is an input field
      totalAmount: calculated.totalAmount,
      balanceDue: calculated.totalAmount - currentAmountPaid,
    }));
  }, [
    formData.items,
    formData.taxPercent,
    formData.shippingAmount,
    formData.discountApplied,
    formData.amountPaid,
  ]);

  useEffect(() => {
    recalculateAndSetTotals();
  }, [recalculateAndSetTotals]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === "customerId") {
      const customer = customers.find((c) => c.id === value);
      newFormData.salesOrderId = ""; // Reset SO selection
      // You might prefill customer's default payment terms or addresses here
      if (customer) {
        newFormData.paymentTerms = customer.paymentTerms || "Net 30"; // Example
      }
    }
    if (name === "salesOrderId" && value) {
      const selectedSO =
        availableSOs.find((so) => so.id === value) ||
        (isEditMode && initialData?.salesOrderId === value
          ? initialData
          : null); // Check initialData if editing
      // If an SO is selected, pre-fill items and other relevant data
      const prefillFromSO = async (soId) => {
        if (!soId) {
          // If SO is deselected, clear items
          setFormData((prev) => ({ ...prev, items: [], salesOrderId: "" }));
          return;
        }
        const soDetails = await getSalesOrderForInvoice(soId);
        if (soDetails) {
          const invoiceItems = soDetails.items.map((item) => ({
            description: `${item.productName} (from ${soDetails.soNumber})`,
            quantity: item.quantity,
            unitPrice: item.unitPrice, // Or item.totalPrice / item.quantity if complex pricing
            totalPrice: item.totalPrice, // This line total from SO might include item discounts
            // We don't copy SO's item-level discount here, assume unitPrice is final for invoice
          }));
          setFormData((prev) => ({
            ...prev,
            salesOrderId: soId,
            items: invoiceItems,
            // Potentially pre-fill other fields from SO like shipping if applicable
            shippingAmount: soDetails.shippingCost || 0,
            // Tax percent might come from SO or company settings
            // For discount, SO's total discount could be a starting point for invoice discount
            discountApplied: soDetails.discountTotal || 0,
          }));
        }
      };
      prefillFromSO(value); // Call the async prefill
    } else {
      setFormData(newFormData);
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleItemChange = (index, field, value) => {
    /* Similar to SalesOrderForm, for manual item entry */
    const newItems = JSON.parse(JSON.stringify(formData.items));
    newItems[index][field] = value;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };
  const handleAddManualItem = (product) => {
    /* For adding items not from SO */
    const newItem = {
      description: product.name, // Or allow custom description
      quantity: 1,
      unitPrice: product.sellingPrice || 0,
      totalPrice: product.sellingPrice || 0,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setProductSearchTerm("");
    setProductSearchResults([]);
    setIsProductSearchFocused(false);
  };
  const handleRemoveItem = (index) => {
    /* Same as other forms */
    if (window.confirm("Remove item?"))
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
  };

  useEffect(() => {
    /* Product search for manual items */
    if (productSearchTerm.trim() === "") {
      setProductSearchResults([]);
      return;
    }
    setProductSearchResults(
      allProducts
        .filter((p) =>
          p.name.toLowerCase().includes(productSearchTerm.toLowerCase())
        )
        .slice(0, 5)
    );
  }, [productSearchTerm, allProducts]);
  useEffect(() => {
    /* Click outside for product search */
  }, [productSearchRef]);

  const validate = () => {
    /* Validation: customer, issue/due dates, items, amounts */
    let tempErrors = {};
    if (!formData.customerId) tempErrors.customerId = "Customer is required.";
    if (!formData.issueDate) tempErrors.issueDate = "Issue date is required.";
    if (!formData.dueDate) tempErrors.dueDate = "Due date is required.";
    else if (new Date(formData.dueDate) < new Date(formData.issueDate))
      tempErrors.dueDate = "Due date cannot be before issue date.";
    if (formData.items.length === 0)
      tempErrors.items = "At least one line item is required.";
    // ... more validation for amounts, item qty/price
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    /* onSubmit with formData */
    e.preventDefault();
    if (validate()) {
      // The calculateInvoiceTotals in mockInvoices will handle final numbers
      const dataToSubmit = {
        ...formData,
        // Ensure numbers are numbers
        taxPercent: parseFloat(formData.taxPercent) || 0,
        shippingAmount: parseFloat(formData.shippingAmount) || 0,
        discountApplied: parseFloat(formData.discountApplied) || 0,
        amountPaid: parseFloat(formData.amountPaid) || 0,
        items: formData.items.map((it) => ({
          ...it,
          quantity: parseFloat(it.quantity) || 0,
          unitPrice: parseFloat(it.unitPrice) || 0,
        })),
      };
      onSubmit(dataToSubmit);
    } else {
      showErrorToast("Please correct form errors.");
    }
  };

  const invStatusOptions = [
    "Draft",
    "Sent",
    "Partially Paid",
    "Paid",
    "Overdue",
    "Void",
  ];
  const paymentTermsOptions = [
    "Due on Receipt",
    "Net 15",
    "Net 30",
    "Net 60",
    "Custom",
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl"
    >
      {/* Header: Customer, SO (optional), Dates, Status */}
      <fieldset className="border p-4 rounded-md shadow-sm">
        <legend className="text-lg font-semibold px-2 text-gray-700">
          Invoice Details
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 mt-2">
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium">
              Customer *
            </label>
            <select
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleHeaderChange}
              disabled={
                isSubmitting || (isEditMode && formData.status !== "Draft")
              }
              required
              className={`w-full mt-1 ... ${
                isEditMode && formData.status !== "Draft"
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName || `${c.firstName} ${c.lastName}`}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-xs text-red-500 mt-1">{errors.customerId}</p>
            )}
          </div>
          <div>
            <label htmlFor="salesOrderId" className="block text-sm font-medium">
              Link Sales Order (Optional)
            </label>
            <select
              id="salesOrderId"
              name="salesOrderId"
              value={formData.salesOrderId}
              onChange={handleHeaderChange}
              disabled={
                isSubmitting ||
                !formData.customerId ||
                (isEditMode && formData.status !== "Draft")
              }
              className={`w-full mt-1 ... ${
                isEditMode && formData.status !== "Draft"
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            >
              <option value="">-- Select SO to Pre-fill Items --</option>
              {availableSOs.map((so) => (
                <option key={so.id} value={so.id}>
                  {so.soNumber} ({so.status})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Issue Date *"
            type="date"
            id="issueDate"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleHeaderChange}
            error={errors.issueDate}
            required
            disabled={
              isSubmitting || (isEditMode && formData.status !== "Draft")
            }
            className={
              isEditMode && formData.status !== "Draft"
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }
          />
          <Input
            label="Due Date *"
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleHeaderChange}
            error={errors.dueDate}
            required
            disabled={isSubmitting}
          />
          <div>
            <label htmlFor="status" className="block text-sm font-medium">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleHeaderChange}
              disabled={isSubmitting}
              required
              className="w-full mt-1 ..."
            >
              {invStatusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="paymentTerms" className="block text-sm font-medium">
              Payment Terms
            </label>
            <select
              id="paymentTerms"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleHeaderChange}
              disabled={isSubmitting}
              className="w-full mt-1 ..."
            >
              {paymentTermsOptions.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Line Items: Can be pre-filled from SO or added manually */}
      <fieldset className="border p-4 rounded-md shadow-sm">
        <legend className="text-lg font-semibold px-2 text-gray-700">
          Line Items
        </legend>
        {/* Optional: Product search for manual item addition */}
        {!formData.salesOrderId && ( // Show manual add if no SO is linked or items are cleared
          <div
            className="my-4 p-3 bg-gray-50 rounded-md"
            ref={productSearchRef}
          >
            {/* ... Product search input & results list for manual items (similar to SO/PO form) ... */}
          </div>
        )}
        {/* Items Table - similar to SO/PO form, but 'description' might be primary */}
        {formData.items.length > 0 ? (
          <div className="overflow-x-auto mt-4 -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Description *</th>
                  <th className="px-3 py-2 text-right w-24">Qty *</th>
                  <th className="px-3 py-2 text-right w-32">Unit Price *</th>
                  <th className="px-3 py-2 text-right w-32">Total</th>
                  <th className="px-3 py-2 text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2">
                      <Input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        required
                        className="w-full"
                        disabled={isSubmitting}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        min="0.01"
                        step="any"
                        required
                        className="w-full text-right"
                        disabled={isSubmitting}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(index, "unitPrice", e.target.value)
                        }
                        step="0.01"
                        min="0"
                        required
                        className="w-full text-right"
                        disabled={isSubmitting}
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      ${(parseFloat(item.totalPrice) || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        IconLeft={Trash2}
                        className="p-1.5"
                        disabled={isSubmitting}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center ...">
            No items. Add manually or select a Sales Order.
          </p>
        )}
        {errors.items && (
          <p className="text-xs text-red-500 mt-1 text-center">
            {errors.items}
          </p>
        )}
      </fieldset>

      {/* Summary (Subtotal, Discount, Tax, Shipping, Total, Amount Paid, Balance Due) & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
        <div className="md:col-span-2 space-y-4">
          <div>
            <label
              htmlFor="notesToCustomer"
              className="block text-sm font-medium"
            >
              Notes to Customer
            </label>
            <textarea
              id="notesToCustomer"
              name="notesToCustomer"
              rows="3"
              value={formData.notesToCustomer}
              onChange={handleHeaderChange}
              disabled={isSubmitting}
              className="w-full mt-1 ..."
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="internalNotes"
              className="block text-sm font-medium"
            >
              Internal Notes
            </label>
            <textarea
              id="internalNotes"
              name="internalNotes"
              rows="3"
              value={formData.internalNotes}
              onChange={handleHeaderChange}
              disabled={isSubmitting}
              className="w-full mt-1 ..."
            ></textarea>
          </div>
        </div>
        <div className="space-y-3 p-4 bg-gray-50 rounded-md shadow-sm border">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">
              ${(formData.subtotal || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <label htmlFor="discountApplied" className="text-gray-600 mr-2">
              Order Discount:
            </label>
            <Input
              type="number"
              id="discountApplied"
              name="discountApplied"
              value={formData.discountApplied}
              onChange={handleHeaderChange}
              step="0.01"
              min="0"
              className="w-28 text-right ..."
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <label htmlFor="taxPercent" className="text-gray-600 mr-2">
              Tax (%):
            </label>
            <Input
              type="number"
              id="taxPercent"
              name="taxPercent"
              value={formData.taxPercent}
              onChange={handleHeaderChange}
              step="0.01"
              min="0"
              className="w-28 text-right ..."
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>Calculated Tax:</span>
            <span className="font-medium">
              ${(formData.taxAmount || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <label htmlFor="shippingAmount" className="text-gray-600 mr-2">
              Shipping:
            </label>
            <Input
              type="number"
              id="shippingAmount"
              name="shippingAmount"
              value={formData.shippingAmount}
              onChange={handleHeaderChange}
              step="0.01"
              min="0"
              className="w-28 text-right ..."
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
            <span>Total Amount:</span>
            <span className="text-accent">
              ${(formData.totalAmount || 0).toFixed(2)}
            </span>
          </div>

          {isEditMode && ( // Show payment fields only in edit mode
            <>
              <div className="flex justify-between items-center text-sm pt-2 border-t mt-2">
                <label htmlFor="amountPaid" className="text-gray-600 mr-2">
                  Amount Paid:
                </label>
                <Input
                  type="number"
                  id="amountPaid"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleHeaderChange}
                  step="0.01"
                  min="0"
                  className="w-28 text-right ..."
                  disabled={
                    isSubmitting ||
                    formData.status === "Paid" ||
                    formData.status === "Void"
                  }
                />
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Balance Due:</span>
                <span>${(formData.balanceDue || 0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end ... pt-6 border-t mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            navigate(
              isEditMode
                ? `/invoicing/invoices/${initialData?.id}`
                : "/invoicing/invoices"
            )
          }
          disabled={isSubmitting}
          IconLeft={XCircle}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          IconLeft={Save}
          className="w-full sm:w-auto ml-0 sm:ml-3 mt-2 sm:mt-0"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Invoice"
            : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;
