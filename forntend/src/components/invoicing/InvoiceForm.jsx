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
  Search, // Make sure Search is imported if used for product search
  X as ClearIcon, // Make sure ClearIcon is imported if used for product search
} from "lucide-react";
import { getCustomers } from "../../data/mockCustomers";
import { getSalesOrders } from "../../data/mockSalesOrders"; // To list available SOs for a customer
import { getProducts } from "../../data/mockProducts"; // For manual product addition search
import {
  getSalesOrderForInvoice,
  calculateInvoiceTotals,
} from "../../data/mockInvoices"; // CORRECTED import for helpers
import { showInfoToast, showErrorToast } from "../../utils/toastNotifications";

const InvoiceForm = ({
  initialData,
  onSubmit,
  isEditMode = false,
  isSubmitting = false,
}) => {
  const navigate = useNavigate();
  const defaultFormData = {
    customerId: "",
    salesOrderId: "", // This will store the ID of the linked SO
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "Draft",
    items: [],
    paymentTerms: "Net 30",
    notesToCustomer: "",
    internalNotes: "",
    subtotal: 0,
    discountApplied: 0, // Overall invoice discount amount
    taxPercent: 7, // Tax rate as a percentage
    taxAmount: 0, // Calculated tax amount
    shippingAmount: 0,
    totalAmount: 0,
    amountPaid: 0,
    balanceDue: 0,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [availableSOs, setAvailableSOs] = useState([]);
  const [allAvailableProducts, setAllAvailableProducts] = useState([]); // For manual item add
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productSearchResults, setProductSearchResults] = useState([]);
  const productSearchRef = useRef(null);
  const [isProductSearchFocused, setIsProductSearchFocused] = useState(false);

  useEffect(() => {
    const fetchInitialDropdownData = async () => {
      try {
        const customerData = await getCustomers();
        setCustomers(customerData || []);
        const productData = await getProducts(); // For manual item addition
        setAllAvailableProducts(productData || []);
      } catch (error) {
        console.error(
          "Error fetching customers/products for Invoice form:",
          error
        );
        showErrorToast("Failed to load customer/product data.");
      }
    };
    fetchInitialDropdownData();
  }, []);

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        ...defaultFormData, // Ensure all fields are present
        ...initialData,
        items: initialData.items
          ? JSON.parse(JSON.stringify(initialData.items)) // Deep copy
          : [],
        // If initialData only has taxAmount, and we want to show taxPercent, we might need to derive it
        // Or ensure initialData for edit also provides taxPercent.
        taxPercent:
          initialData.taxPercent !== undefined
            ? initialData.taxPercent
            : defaultFormData.taxPercent,
        discountApplied:
          initialData.discountApplied !== undefined
            ? initialData.discountApplied
            : defaultFormData.discountApplied,
        shippingAmount:
          initialData.shippingAmount !== undefined
            ? initialData.shippingAmount
            : defaultFormData.shippingAmount,
        amountPaid:
          initialData.amountPaid !== undefined
            ? initialData.amountPaid
            : defaultFormData.amountPaid,
      });
    } else if (!isEditMode) {
      // If initialData is passed for a new form (e.g., from SO), use it
      if (initialData && Object.keys(initialData).length > 0) {
        setFormData({
          ...defaultFormData,
          ...initialData,
          items: initialData.items
            ? JSON.parse(JSON.stringify(initialData.items))
            : [],
        });
      } else {
        setFormData(defaultFormData);
      }
    }
    setErrors({});
  }, [initialData, isEditMode]);

  useEffect(() => {
    const fetchSOsForCustomer = async () => {
      if (formData.customerId && !isEditMode) {
        // Fetch SOs when customer changes for a new invoice
        try {
          const allSOsData = await getSalesOrders();
          setAvailableSOs(
            allSOsData.filter(
              (so) =>
                so.customerId === formData.customerId &&
                // Define which SO statuses are invoiceable
                [
                  "Pending Fulfillment",
                  "Partially Shipped",
                  "Shipped",
                  "Completed",
                ].includes(so.status) &&
                so.status !== "Invoiced" // Don't show already invoiced SOs (simple check)
            )
          );
        } catch (error) {
          console.error("Error fetching SOs for customer:", error);
          setAvailableSOs([]); // Clear if error
        }
      } else if (!formData.customerId) {
        setAvailableSOs([]); // Clear if no customer selected
      }
      // For edit mode, SO is usually fixed, so we don't refetch based on customerId change
    };
    fetchSOsForCustomer();
  }, [formData.customerId, isEditMode]);

  const recalculateAndSetTotals = useCallback(() => {
    const calculated = calculateInvoiceTotals(
      // This comes from mockInvoices.js
      formData.items,
      formData.taxPercent,
      formData.shippingAmount,
      formData.discountApplied // This is the overall discount amount input
    );
    const currentAmountPaid = parseFloat(formData.amountPaid) || 0;
    setFormData((prev) => ({
      ...prev,
      items: calculated.items, // items with updated individual totalPrice
      subtotal: calculated.subtotal,
      // discountApplied is an input, so it's already in formData
      taxAmount: calculated.taxAmount, // This is the calculated tax amount
      // shippingAmount is an input
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
    let newFormState = { ...formData, [name]: value };

    if (name === "customerId") {
      newFormState.salesOrderId = ""; // Reset SO selection when customer changes
      const customer = customers.find((c) => c.id === value);
      if (customer) {
        newFormState.paymentTerms = customer.paymentTerms || "Net 30";
        // Potentially prefill billing/shipping address from customer if not linking SO
        if (!newFormState.salesOrderId) {
          // Only if not linking an SO which would override
          newFormState.shippingAddress = customer.address || "";
          newFormState.billingAddress = customer.address || "";
        }
      }
    }

    if (name === "salesOrderId") {
      const soIdToFetch = value; // The selected SO ID
      // Update formData immediately for the select to show selection
      setFormData((prev) => ({
        ...prev,
        salesOrderId: soIdToFetch,
        items: soIdToFetch ? prev.items : [],
      })); // Clear items if SO deselected

      const prefillFromSO = async (selectedSoId) => {
        if (!selectedSoId) {
          // If SO is deselected, reset relevant fields or keep existing manual entries?
          // For now, let's just clear items, assuming user wants to start over or add manually.
          setFormData((prev) => ({ ...prev, items: [] }));
          return;
        }
        try {
          const soDetails = await getSalesOrderForInvoice(selectedSoId); // Uses helper from mockInvoices
          if (soDetails) {
            const invoiceItems = soDetails.items.map((item) => ({
              description: `${item.productName || "Product"} (SKU: ${
                item.sku || item.productId
              }) - from SO: ${soDetails.soNumber}`,
              quantity: item.quantity,
              unitPrice: item.unitPrice, // This should be the final price from SO line
              totalPrice: item.totalPrice, // Calculated line total from SO
            }));
            setFormData((prev) => ({
              ...prev,
              // customerId: soDetails.customerId, // Already set or should match
              items: invoiceItems,
              shippingAddress:
                soDetails.shippingAddress || prev.shippingAddress,
              billingAddress: soDetails.billingAddress || prev.billingAddress,
              paymentTerms: soDetails.paymentTerms || prev.paymentTerms,
              // Financials from SO. Invoice form can then adjust tax % etc.
              shippingAmount:
                soDetails.shippingCost !== undefined
                  ? soDetails.shippingCost
                  : prev.shippingAmount,
              discountApplied:
                soDetails.discountTotal !== undefined
                  ? soDetails.discountTotal
                  : prev.discountApplied, // Overall SO discount
              // taxPercent will be based on form's default or user input, then taxAmount calculated
            }));
          }
        } catch (fetchError) {
          console.error("Error pre-filling from SO:", fetchError);
          showErrorToast("Could not load details from selected Sales Order.");
        }
      };
      prefillFromSO(soIdToFetch); // Call async prefill
    } else {
      setFormData(newFormState);
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = JSON.parse(JSON.stringify(formData.items));
    newItems[index][field] = value; // Value is kept as string from input
    // Recalculation will happen via useEffect watching formData.items
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleAddManualItem = (product) => {
    // Used if not linking an SO, or adding extra items
    const newItem = {
      description: product.name,
      quantity: 1,
      unitPrice: product.sellingPrice || 0,
      // totalPrice will be calculated
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setProductSearchTerm("");
    setProductSearchResults([]);
    setIsProductSearchFocused(false);
  };

  const handleRemoveItem = (index) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  useEffect(() => {
    if (productSearchTerm.trim() === "") {
      setProductSearchResults([]);
      return;
    }
    const lowerSearch = productSearchTerm.toLowerCase();
    setProductSearchResults(
      allAvailableProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(lowerSearch) ||
            (p.sku && p.sku.toLowerCase().includes(lowerSearch))
        )
        .slice(0, 7)
    );
  }, [productSearchTerm, allAvailableProducts]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        productSearchRef.current &&
        !productSearchRef.current.contains(event.target)
      ) {
        setIsProductSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [productSearchRef]);

  const validate = () => {
    let tempErrors = {};
    if (!formData.customerId) tempErrors.customerId = "Customer is required.";
    if (!formData.issueDate) tempErrors.issueDate = "Issue date is required.";
    if (!formData.dueDate) tempErrors.dueDate = "Due date is required.";
    else if (new Date(formData.dueDate) < new Date(formData.issueDate)) {
      tempErrors.dueDate = "Due date cannot be before issue date.";
    }
    if (formData.items.length === 0)
      tempErrors.items = "At least one line item is required.";

    formData.items.forEach((item, index) => {
      if (!item.description?.trim())
        tempErrors[`item_${index}_description`] = "Desc. required.";
      const qty = parseFloat(item.quantity);
      const price = parseFloat(item.unitPrice);
      if (isNaN(qty) || qty <= 0)
        tempErrors[`item_${index}_quantity`] = "Qty > 0.";
      if (isNaN(price) || price < 0)
        tempErrors[`item_${index}_unitPrice`] = "Price >= 0.";
    });

    const taxP = parseFloat(formData.taxPercent);
    const shipC = parseFloat(formData.shippingAmount);
    const discA = parseFloat(formData.discountApplied);
    if (formData.taxPercent === "" || isNaN(taxP) || taxP < 0)
      tempErrors.taxPercent = "Tax % must be >= 0.";
    if (formData.shippingAmount === "" || isNaN(shipC) || shipC < 0)
      tempErrors.shippingAmount = "Shipping must be >= 0.";
    if (formData.discountApplied === "" || isNaN(discA) || discA < 0)
      tempErrors.discountApplied = "Discount must be >= 0.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const dataToSubmit = {
        ...formData,
        taxPercent: parseFloat(formData.taxPercent) || 0,
        shippingAmount: parseFloat(formData.shippingAmount) || 0,
        discountApplied: parseFloat(formData.discountApplied) || 0,
        amountPaid: parseFloat(formData.amountPaid) || 0,
        items: formData.items.map((it) => ({
          description: it.description,
          quantity: parseFloat(it.quantity) || 0,
          unitPrice: parseFloat(it.unitPrice) || 0,
          // totalPrice is calculated by calculateInvoiceTotals in mockInvoices based on these
        })),
      };
      onSubmit(dataToSubmit);
    } else {
      showErrorToast("Please correct the errors highlighted in the form.");
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
      {/* Header Section */}
      <fieldset className="border p-4 rounded-md shadow-sm">
        <legend className="text-lg font-semibold px-2 text-gray-700">
          Invoice Details
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 mt-2">
          <div>
            <label
              htmlFor="customerId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
              className={`block w-full px-3 py-2.5 border ${
                errors.customerId
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName || `${c.firstName} ${c.lastName}`} (ID: {c.id})
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-xs text-red-500 mt-1">{errors.customerId}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="salesOrderId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
              className={`block w-full px-3 py-2.5 border ${
                errors.salesOrderId
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">-- Select SO to Pre-fill Items --</option>
              {availableSOs.map((so) => (
                <option key={so.id} value={so.id}>
                  {so.soNumber} (Status: {so.status})
                </option>
              ))}
            </select>
            {errors.salesOrderId && (
              <p className="text-xs text-red-500 mt-1">{errors.salesOrderId}</p>
            )}
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
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleHeaderChange}
              disabled={isSubmitting}
              required
              className={`block w-full px-3 py-2.5 border ${
                errors.status
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-100`}
            >
              {invStatusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-xs text-red-500 mt-1">{errors.status}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="paymentTerms"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Terms
            </label>
            <select
              id="paymentTerms"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleHeaderChange}
              disabled={isSubmitting}
              className={`block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-100`}
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

      {/* Line Items Section */}
      <fieldset className="border p-4 rounded-md shadow-sm">
        <legend className="text-lg font-semibold px-2 text-gray-700">
          Line Items
        </legend>
        {(!formData.salesOrderId || formData.items.length === 0) && ( // Show manual add if no SO is linked or items are empty
          <div
            className="my-4 p-3 bg-gray-50 rounded-md"
            ref={productSearchRef}
          >
            <label
              htmlFor="productSearchInv"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Add Item Manually
            </label>
            <div className="relative flex items-center">
              <Search
                size={18}
                className="absolute left-3 text-gray-400 pointer-events-none z-10"
              />
              <Input
                id="productSearchInv"
                name="productSearchInv"
                type="text"
                placeholder="Search product by name or SKU..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                onFocus={() => setIsProductSearchFocused(true)}
                className="pl-10 pr-10 w-full"
                disabled={isSubmitting || !!formData.salesOrderId}
                autoComplete="off"
              />
              {productSearchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setProductSearchTerm("");
                    setProductSearchResults([]);
                  }}
                  className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 z-10"
                >
                  <ClearIcon size={18} />
                </button>
              )}
            </div>
            {isProductSearchFocused && productSearchResults.length > 0 && (
              <ul className="relative z-20 w-full sm:w-1/2 md:w-2/3 lg:w-1/3 bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                {productSearchResults.map((p) => (
                  <li
                    key={p.id}
                    onClick={() => handleAddManualItem(p)}
                    className="px-4 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b last:border-b-0"
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      SKU: {p.sku || "N/A"} | Price: $
                      {p.sellingPrice?.toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {isProductSearchFocused &&
              productSearchTerm &&
              productSearchResults.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No products found matching "{productSearchTerm}".
                </p>
              )}
          </div>
        )}
        {formData.items.length > 0 ? (
          <div className="overflow-x-auto mt-4 -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Description *
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 w-24">
                    Qty *
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 w-32">
                    Unit Price *
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-gray-600 w-32">
                    Total
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600 w-16">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.items.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      errors[`item_${index}_description`] ||
                      errors[`item_${index}_quantity`] ||
                      errors[`item_${index}_unitPrice`]
                        ? "bg-red-50"
                        : ""
                    }`}
                  >
                    <td className="px-3 py-2">
                      <Input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        required
                        className={`w-full text-sm py-1.5 ${
                          errors[`item_${index}_description`]
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-300"
                        }`}
                        error={errors[`item_${index}_description`]}
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
                        className={`w-full text-sm py-1.5 text-right ${
                          errors[`item_${index}_quantity`]
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-300"
                        }`}
                        error={errors[`item_${index}_quantity`]}
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
                        className={`w-full text-sm py-1.5 text-right ${
                          errors[`item_${index}_unitPrice`]
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-300"
                        }`}
                        error={errors[`item_${index}_unitPrice`]}
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
          <p className="text-center text-gray-500 py-4">
            No items. Add manually or select a Sales Order to pre-fill.
          </p>
        )}
        {errors.items && (
          <p className="text-xs text-red-500 mt-1 text-center">
            {errors.items}
          </p>
        )}
      </fieldset>

      {/* Summary & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
        <div className="md:col-span-2 space-y-4">
          <div>
            <label
              htmlFor="notesToCustomer"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm disabled:bg-gray-100"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="internalNotes"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm disabled:bg-gray-100"
            ></textarea>
          </div>
        </div>
        <div className="space-y-3 p-4 bg-gray-50 rounded-md shadow-sm border">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items Subtotal:</span>
            <span className="font-medium text-gray-800">
              ${(formData.subtotal || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <label
              htmlFor="discountApplied"
              className="text-gray-600 mr-2 shrink-0"
            >
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
              className={`w-28 text-sm py-1.5 text-right ${
                errors.discountApplied
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
              error={errors.discountApplied}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <label htmlFor="taxPercent" className="text-gray-600 mr-2 shrink-0">
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
              className={`w-28 text-sm py-1.5 text-right ${
                errors.taxPercent
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
              error={errors.taxPercent}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Calculated Tax:</span>
            <span className="font-medium text-gray-800">
              ${(formData.taxAmount || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <label
              htmlFor="shippingAmount"
              className="text-gray-600 mr-2 shrink-0"
            >
              Shipping Cost:
            </label>
            <Input
              type="number"
              id="shippingAmount"
              name="shippingAmount"
              value={formData.shippingAmount}
              onChange={handleHeaderChange}
              step="0.01"
              min="0"
              className={`w-28 text-sm py-1.5 text-right ${
                errors.shippingAmount
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
              error={errors.shippingAmount}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
            <span className="text-gray-800">Grand Total:</span>
            <span className="text-accent">
              ${(formData.totalAmount || 0).toFixed(2)}
            </span>
          </div>

          {isEditMode && (
            <>
              <div className="flex justify-between items-center text-sm pt-2 border-t mt-2">
                <label
                  htmlFor="amountPaid"
                  className="text-gray-600 mr-2 shrink-0"
                >
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
                  className={`w-28 text-sm py-1.5 text-right ${
                    errors.amountPaid
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-gray-300"
                  }`}
                  error={errors.amountPaid}
                  disabled={
                    isSubmitting ||
                    formData.status === "Paid" ||
                    formData.status === "Void"
                  }
                />
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-600">Balance Due:</span>
                <span
                  className={`${
                    (formData.balanceDue || 0) <= 0 && formData.totalAmount > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ${(formData.balanceDue || 0).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 mt-6">
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
          IconLeft={XCircle}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          IconLeft={Save}
          disabled={isSubmitting}
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
