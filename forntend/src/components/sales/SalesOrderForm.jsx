// src/components/sales/SalesOrderForm.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../common/Input";
import Button from "../common/Button";
import {
  Save,
  XCircle,
  PlusCircle,
  Trash2,
  Search,
  X as ClearIcon,
} from "lucide-react";
import { getCustomers } from "../../data/mockCustomers";
import { getProducts } from "../../data/mockProducts";
import { showInfoToast, showErrorToast } from "../../utils/toastNotifications";

const calculateSOTotalsInternal = (
  items = [],
  taxPercentInput = 7,
  shippingInput = 0,
  orderDiscountAmountInput = 0
) => {
  let subtotal = 0;
  let itemLevelDiscountTotal = 0;
  const taxPercent = parseFloat(taxPercentInput) || 0;
  const shipping = parseFloat(shippingInput) || 0;
  const orderDiscountAmount = parseFloat(orderDiscountAmountInput) || 0;

  const processedItems = items.map((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    const itemDiscountPerUnit = parseFloat(item.discount) || 0;

    const lineItemTotalDiscount = qty * itemDiscountPerUnit;
    const lineTotalAfterItemDiscount = qty * price - lineItemTotalDiscount;

    subtotal += lineTotalAfterItemDiscount;
    itemLevelDiscountTotal += lineItemTotalDiscount;
    return {
      ...item,
      totalPrice: lineTotalAfterItemDiscount,
      quantity: qty,
      unitPrice: price,
      discount: itemDiscountPerUnit,
    };
  });

  const subtotalAfterOrderDiscount = subtotal - orderDiscountAmount;
  const taxAmount = subtotalAfterOrderDiscount * (taxPercent / 100); // taxPercent is already a percentage like 7
  const totalAmount = subtotalAfterOrderDiscount + taxAmount + shipping;

  return {
    subtotal: subtotal,
    discountTotalApplied: itemLevelDiscountTotal + orderDiscountAmount, // Total discount that was applied
    tax: taxAmount,
    shippingCost: shipping, // Return the parsed shipping cost
    totalAmount: totalAmount,
    items: processedItems,
  };
};

const SalesOrderForm = ({
  initialData,
  onSubmit,
  isEditMode = false,
  isSubmitting = false,
}) => {
  const navigate = useNavigate();
  const defaultFormData = {
    customerId: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedShipDate: "",
    status: "Draft",
    items: [],
    shippingAddress: "",
    billingAddress: "",
    paymentTerms: "Net 30",
    notes: "",
    salespersonId: "",
    subtotal: 0,
    discountTotal: 0, // This will be total order discount input field
    taxPercent: 7,
    tax: 0,
    shippingCost: 0,
    totalAmount: 0,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [allAvailableProducts, setAllAvailableProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [isProductSearchFocused, setIsProductSearchFocused] = useState(false);
  const productSearchRef = useRef(null);
  const mockSalespersons = [
    { id: "emp003", name: "Robert Johnson (Sales Rep)" },
    { id: "emp001", name: "John Doe (Manager)" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerData, productData] = await Promise.all([
          getCustomers(),
          getProducts(),
        ]);
        setCustomers(customerData || []);
        setAllAvailableProducts(productData || []);
      } catch (error) {
        console.error("Error fetching data for SO form:", error);
        showErrorToast("Failed to load form data.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        ...defaultFormData,
        ...initialData,
        items: initialData.items
          ? JSON.parse(JSON.stringify(initialData.items))
          : [],
        // If tax amount is stored, derive taxPercent, or assume taxPercent was stored.
        // For simplicity, if initialData has tax and subtotal, we can estimate taxPercent.
        // But our mock SOs have tax amount, so we'll prefer initialData.tax if present.
        tax: initialData.tax !== undefined ? initialData.tax : 0,
        taxPercent:
          initialData.taxPercent !== undefined ? initialData.taxPercent : 7, // Assuming taxPercent is stored or default to 7
        shippingCost:
          initialData.shippingCost !== undefined ? initialData.shippingCost : 0,
        discountTotal:
          initialData.discountTotalInput !== undefined
            ? initialData.discountTotalInput
            : 0, // Use a different name if `discountTotal` is calculated sum
      });
    } else if (!isEditMode) {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [initialData, isEditMode]);

  const recalculateAndSetTotals = useCallback(() => {
    const calculated = calculateSOTotalsInternal(
      formData.items,
      formData.taxPercent,
      formData.shippingCost,
      formData.discountTotal // This is the overall order discount from input
    );
    setFormData((prev) => ({
      ...prev,
      items: calculated.items,
      subtotal: calculated.subtotal,
      // discountTotal: calculated.discountTotalApplied, // This is the total discount APPLIED (item + order)
      tax: calculated.tax,
      totalAmount: calculated.totalAmount,
    }));
  }, [
    formData.items,
    formData.taxPercent,
    formData.shippingCost,
    formData.discountTotal,
  ]);

  useEffect(() => {
    recalculateAndSetTotals();
  }, [recalculateAndSetTotals]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (["taxPercent", "shippingCost", "discountTotal"].includes(name)) {
      // discountTotal is the input for overall order discount
      processedValue = value === "" ? "" : parseFloat(value); // Allow empty for typing, handle NaN later
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));

    if (name === "customerId" && value) {
      const selectedCustomer = customers.find((c) => c.id === value);
      if (selectedCustomer) {
        setFormData((prev) => ({
          ...prev,
          shippingAddress: selectedCustomer.address || "",
          billingAddress: selectedCustomer.address || "",
        }));
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = JSON.parse(JSON.stringify(formData.items));
    const item = newItems[index];

    if (["quantity", "unitPrice", "discount"].includes(field)) {
      item[field] = value === "" ? "" : value; // Keep as string for input, parse on calculation/validation
    } else {
      item[field] = value;
    }
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleAddProductItem = (product) => {
    if (formData.items.find((item) => item.productId === product.id)) {
      showInfoToast(
        `${product.name} is already in the order. Adjust quantity if needed.`
      );
      setProductSearchTerm("");
      setProductSearchResults([]);
      setIsProductSearchFocused(false);
      return;
    }
    const newItem = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: 1,
      unitPrice: product.sellingPrice || 0,
      discount: 0,
      totalPrice: product.sellingPrice || 0,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setProductSearchTerm("");
    setProductSearchResults([]);
    setIsProductSearchFocused(false);
  };

  const handleRemoveItem = (index) => {
    if (window.confirm("Remove this item from the order?")) {
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
            p.sku.toLowerCase().includes(lowerSearch)
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
    if (!formData.orderDate) tempErrors.orderDate = "Order date is required.";
    if (!formData.expectedShipDate)
      tempErrors.expectedShipDate = "Expected ship date is required.";
    else if (new Date(formData.expectedShipDate) < new Date(formData.orderDate))
      tempErrors.expectedShipDate = "Ship date cannot be before order date.";

    if (formData.items.length === 0)
      tempErrors.items = "At least one item is required.";
    formData.items.forEach((item, index) => {
      const qty = parseFloat(item.quantity);
      const price = parseFloat(item.unitPrice);
      const disc = parseFloat(item.discount);
      if (isNaN(qty) || qty <= 0)
        tempErrors[`item_${index}_quantity`] = "Qty > 0.";
      if (isNaN(price) || price < 0)
        tempErrors[`item_${index}_unitPrice`] = "Price >= 0.";
      if (item.discount !== "" && (isNaN(disc) || disc < 0))
        tempErrors[`item_${index}_discount`] = "Discount >= 0.";
      if (!isNaN(disc) && !isNaN(price) && disc > price)
        tempErrors[`item_${index}_discount`] = "Discount > Price.";
    });

    const taxP = parseFloat(formData.taxPercent);
    const shipC = parseFloat(formData.shippingCost);
    const discT = parseFloat(formData.discountTotal); // This is the overall order discount input
    if (formData.taxPercent === "" || isNaN(taxP) || taxP < 0)
      tempErrors.taxPercent = "Tax % >= 0.";
    if (formData.shippingCost === "" || isNaN(shipC) || shipC < 0)
      tempErrors.shippingCost = "Shipping >= 0.";
    if (formData.discountTotal === "" || isNaN(discT) || discT < 0)
      tempErrors.discountTotal = "Order Discount >= 0.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const dataToSubmit = {
        customerId: formData.customerId,
        orderDate: formData.orderDate,
        expectedShipDate: formData.expectedShipDate,
        status: formData.status,
        items: formData.items.map((item) => ({
          productId: item.productId,
          quantity: parseFloat(item.quantity) || 0,
          unitPrice: parseFloat(item.unitPrice) || 0,
          discount: parseFloat(item.discount) || 0,
        })),
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddress,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes,
        salespersonId: formData.salespersonId,
        taxPercent: parseFloat(formData.taxPercent) || 0,
        shippingCost: parseFloat(formData.shippingCost) || 0,
        discountTotal: parseFloat(formData.discountTotal) || 0, // Overall order discount
      };
      onSubmit(dataToSubmit);
    } else {
      showErrorToast("Please correct the errors highlighted in the form.");
    }
  };

  const soStatusOptions = [
    "Draft",
    "Pending Approval",
    "Pending Fulfillment",
    "Partially Shipped",
    "Shipped",
    "Invoiced",
    "Completed",
    "Cancelled",
  ];
  const paymentTermsOptions = [
    "Due on Receipt",
    "Net 15",
    "Net 30",
    "Net 60",
    "COD",
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
          Order Information
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
              disabled={isSubmitting}
              required
              className={`block w-full px-3 py-2.5 border ${
                errors.customerId
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-100`}
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName || `${c.firstName} ${c.lastName}`} (ID: {c.id})
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="mt-1 text-xs text-red-600">{errors.customerId}</p>
            )}
          </div>
          <Input
            label="Order Date *"
            id="orderDate"
            name="orderDate"
            type="date"
            value={formData.orderDate}
            onChange={handleHeaderChange}
            error={errors.orderDate}
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
            label="Expected Ship Date *"
            id="expectedShipDate"
            name="expectedShipDate"
            type="date"
            value={formData.expectedShipDate}
            onChange={handleHeaderChange}
            error={errors.expectedShipDate}
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
              {soStatusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-red-600">{errors.status}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="salespersonId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Salesperson
            </label>
            <select
              id="salespersonId"
              name="salespersonId"
              value={formData.salespersonId}
              onChange={handleHeaderChange}
              disabled={isSubmitting}
              className={`block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-100`}
            >
              <option value="">-- Select Salesperson --</option>
              {mockSalespersons.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
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

      <fieldset className="border p-4 rounded-md shadow-sm">
        <legend className="text-lg font-semibold px-2 text-gray-700">
          Addresses
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-2">
          <div>
            <label
              htmlFor="shippingAddress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Shipping Address
            </label>
            <textarea
              id="shippingAddress"
              name="shippingAddress"
              rows="3"
              value={formData.shippingAddress}
              onChange={handleHeaderChange}
              disabled={isSubmitting}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm disabled:bg-gray-100"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="billingAddress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Billing Address
            </label>
            <textarea
              id="billingAddress"
              name="billingAddress"
              rows="3"
              value={formData.billingAddress}
              onChange={handleHeaderChange}
              disabled={isSubmitting}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm disabled:bg-gray-100"
            ></textarea>
          </div>
        </div>
      </fieldset>

      <fieldset className="border p-4 rounded-md shadow-sm">
        <legend className="text-lg font-semibold px-2 text-gray-700">
          Order Items
        </legend>
        <div className="my-4 p-3 bg-gray-50 rounded-md" ref={productSearchRef}>
          <label
            htmlFor="productSearchSO"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Add Product to Order
          </label>
          <div className="relative flex items-center">
            <Search
              size={18}
              className="absolute left-3 text-gray-400 pointer-events-none z-10"
            />
            <Input
              id="productSearchSO"
              name="productSearchSO"
              type="text"
              placeholder="Search product by name or SKU..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              onFocus={() => setIsProductSearchFocused(true)}
              className="pl-10 pr-10 w-full"
              disabled={isSubmitting}
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
            <ul className="relative z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
              {productSearchResults.map((p) => (
                <li
                  key={p.id}
                  onClick={() => handleAddProductItem(p)}
                  className="px-4 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b last:border-b-0"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">
                    SKU: {p.sku} | Stock: {p.stock} | Price: $
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

        {formData.items.length > 0 ? (
          <div className="overflow-x-auto mt-4 -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 sm:px-3 py-3 text-left font-medium text-gray-600 w-10 hidden sm:table-cell">
                    #
                  </th>
                  <th className="px-2 sm:px-3 py-3 text-left font-medium text-gray-600">
                    Product
                  </th>
                  <th className="px-2 sm:px-3 py-3 text-left font-medium text-gray-600 w-24">
                    Qty *
                  </th>
                  <th className="px-2 sm:px-3 py-3 text-left font-medium text-gray-600 w-32">
                    Unit Price *
                  </th>
                  <th className="px-2 sm:px-3 py-3 text-left font-medium text-gray-600 w-28">
                    Discount/Unit
                  </th>
                  <th className="px-2 sm:px-3 py-3 text-left font-medium text-gray-600 w-32">
                    Line Total
                  </th>
                  <th className="px-2 sm:px-3 py-3 text-center font-medium text-gray-600 w-16">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.items.map((item, index) => (
                  <tr
                    key={item.productId + "_" + index}
                    className={`${
                      errors[`item_${index}_quantity`] ||
                      errors[`item_${index}_unitPrice`] ||
                      errors[`item_${index}_discount`]
                        ? "bg-red-50"
                        : ""
                    }`}
                  >
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-gray-500 hidden sm:table-cell">
                      {index + 1}.
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                      <div className="font-medium text-gray-800">
                        {item.productName}
                      </div>
                      <div className="text-xs text-gray-500">
                        SKU: {item.sku || item.productId}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        min="0.01"
                        step="any"
                        required
                        className={`w-full text-sm py-1.5 ${
                          errors[`item_${index}_quantity`]
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-300"
                        }`}
                        error={errors[`item_${index}_quantity`]}
                        disabled={isSubmitting}
                      />
                    </td>
                    <td className="px-2 sm:px-3 py-2">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(index, "unitPrice", e.target.value)
                        }
                        step="0.01"
                        min="0"
                        required
                        className={`w-full text-sm py-1.5 ${
                          errors[`item_${index}_unitPrice`]
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-300"
                        }`}
                        error={errors[`item_${index}_unitPrice`]}
                        disabled={isSubmitting}
                      />
                    </td>
                    <td className="px-2 sm:px-3 py-2">
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) =>
                          handleItemChange(index, "discount", e.target.value)
                        }
                        step="0.01"
                        min="0"
                        className={`w-full text-sm py-1.5 ${
                          errors[`item_${index}_discount`]
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-gray-300"
                        }`}
                        error={errors[`item_${index}_discount`]}
                        disabled={isSubmitting}
                      />
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-gray-700 font-medium">
                      ${(parseFloat(item.totalPrice) || 0).toFixed(2)}
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-center">
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        IconLeft={Trash2}
                        className="p-1.5"
                        disabled={isSubmitting}
                        title="Remove Item"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            No items added to this order yet.
          </p>
        )}
        {errors.items && (
          <p className="mt-2 text-sm text-red-600 text-center">
            {errors.items}
          </p>
        )}
      </fieldset>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
        <div className="md:col-span-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes / Internal Comments
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="4"
            value={formData.notes}
            onChange={handleHeaderChange}
            disabled={isSubmitting}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm disabled:bg-gray-100"
          ></textarea>
        </div>
        <div className="space-y-3 p-4 bg-gray-50 rounded-md shadow-sm border">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items Subtotal:</span>
            <span className="font-medium">
              ${(formData.subtotal || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <label
              htmlFor="discountTotal"
              className="text-gray-600 mr-2 shrink-0"
            >
              Order Discount:
            </label>
            <Input
              type="number"
              id="discountTotal"
              name="discountTotal"
              value={formData.discountTotal}
              onChange={handleHeaderChange}
              step="0.01"
              min="0"
              className={`w-28 text-sm py-1.5 text-right ${
                errors.discountTotal
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
              error={errors.discountTotal}
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
            <span className="font-medium">
              ${(formData.tax || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <label
              htmlFor="shippingCost"
              className="text-gray-600 mr-2 shrink-0"
            >
              Shipping Cost:
            </label>
            <Input
              type="number"
              id="shippingCost"
              name="shippingCost"
              value={formData.shippingCost}
              onChange={handleHeaderChange}
              step="0.01"
              min="0"
              className={`w-28 text-sm py-1.5 text-right ${
                errors.shippingCost
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
              error={errors.shippingCost}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between text-lg pt-2 border-t mt-2">
            <span className="font-bold">Grand Total:</span>
            <span className="font-bold text-accent">
              ${(formData.totalAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 mt-8">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            navigate(
              isEditMode
                ? `/sales/sales-orders/${initialData?.id}`
                : "/sales/sales-orders"
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
          className="w-full sm:w-auto"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Sales Order"
            : "Create Sales Order"}
        </Button>
      </div>
    </form>
  );
};

export default SalesOrderForm;
