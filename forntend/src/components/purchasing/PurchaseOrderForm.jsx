// src/components/purchasing/PurchaseOrderForm.jsx
import React, { useState, useEffect, useCallback, useRef } from "react"; // Added useRef
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
} from "lucide-react"; // Added Search, ClearIcon
import { getVendors } from "../../data/mockVendors";
import { getProducts } from "../../data/mockProducts";
import { showInfoToast, showErrorToast } from "../../utils/toastNotifications";

const PurchaseOrderForm = ({
  initialData,
  onSubmit,
  isEditMode = false,
  isSubmitting = false,
}) => {
  const navigate = useNavigate();
  const defaultFormData = {
    vendorId: "",
    orderDate: new Date().toISOString().split("T")[0],
    expectedDeliveryDate: "",
    status: "Pending Approval",
    items: [],
    notes: "",
    subtotal: 0,
    tax: 0, // Can be a percentage or fixed amount
    shippingCost: 0,
    totalAmount: 0,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [vendors, setVendors] = useState([]);
  const [allAvailableProducts, setAllAvailableProducts] = useState([]); // Store all fetched products
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [isProductSearchFocused, setIsProductSearchFocused] = useState(false);
  const productSearchRef = useRef(null); // For managing focus/blur of search results

  // Fetch vendors and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorData, productData] = await Promise.all([
          getVendors(),
          getProducts(),
        ]);
        setVendors(vendorData || []);
        setAllAvailableProducts(productData || []);
      } catch (error) {
        console.error("Error fetching vendors/products for PO form:", error);
        showErrorToast("Could not load necessary data for the form.");
      }
    };
    fetchData();
  }, []);

  // Initialize form with initialData
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        vendorId: initialData.vendorId || "",
        orderDate:
          initialData.orderDate || new Date().toISOString().split("T")[0],
        expectedDeliveryDate: initialData.expectedDeliveryDate || "",
        status: initialData.status || "Pending Approval",
        items: initialData.items
          ? JSON.parse(JSON.stringify(initialData.items))
          : [],
        notes: initialData.notes || "",
        subtotal: initialData.subtotal || 0,
        tax: initialData.tax || 0,
        shippingCost: initialData.shippingCost || 0,
        totalAmount: initialData.totalAmount || 0,
      });
    } else if (!isEditMode) {
      setFormData(defaultFormData); // Reset for new form
    }
    setErrors({});
  }, [initialData, isEditMode]);

  const calculateTotals = useCallback(() => {
    const sub = formData.items.reduce(
      (acc, item) => acc + (parseFloat(item.totalPrice) || 0),
      0
    );
    const taxAmount = parseFloat(formData.tax) || 0;
    const shipping = parseFloat(formData.shippingCost) || 0;
    const total = sub + taxAmount + shipping;
    setFormData((prev) => ({
      ...prev,
      subtotal: sub,
      totalAmount: total,
      tax: taxAmount,
      shippingCost: shipping,
    })); // Ensure tax/shipping are numbers
  }, [formData.items, formData.tax, formData.shippingCost]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "tax" || name === "shippingCost") {
      processedValue = value === "" ? 0 : parseFloat(value); // Treat empty as 0 for calculation
    }
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    const item = newItems[index];

    if (field === "quantity" || field === "unitPrice") {
      item[field] = value === "" ? "" : parseFloat(value); // Allow empty for typing, convert to float
    } else {
      item[field] = value;
    }

    if (field === "quantity" || field === "unitPrice") {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      item.totalPrice = qty * price; // No .toFixed(2) here, do it for display only
    }
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleAddProductItem = (product) => {
    if (formData.items.find((item) => item.productId === product.id)) {
      showInfoToast(
        `${product.name} is already in the order. You can adjust its quantity.`
      );
      setProductSearchTerm("");
      setProductSearchResults([]);
      setIsProductSearchFocused(false);
      return;
    }
    const newItem = {
      productId: product.id,
      productName: product.name,
      sku: product.sku, // Store SKU for display
      quantity: 1,
      unitPrice: product.costPrice || 0,
      totalPrice: 1 * (product.costPrice || 0),
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setProductSearchTerm("");
    setProductSearchResults([]);
    setIsProductSearchFocused(false);
  };

  const handleRemoveItem = (index) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from the order?"
      )
    ) {
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
        .slice(0, 7) // Show a few more results
    );
  }, [productSearchTerm, allAvailableProducts]);

  // Handle click outside for product search results
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        productSearchRef.current &&
        !productSearchRef.current.contains(event.target)
      ) {
        setIsProductSearchFocused(false); // This will hide the dropdown
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [productSearchRef]);

  const validate = () => {
    // ... (validation logic remains largely the same, ensure it's thorough)
    let tempErrors = {};
    if (!formData.vendorId) tempErrors.vendorId = "Vendor is required.";
    if (!formData.orderDate) tempErrors.orderDate = "Order date is required.";
    if (!formData.expectedDeliveryDate) {
      tempErrors.expectedDeliveryDate = "Expected delivery date is required.";
    } else if (
      new Date(formData.expectedDeliveryDate) < new Date(formData.orderDate)
    ) {
      tempErrors.expectedDeliveryDate =
        "Expected delivery date cannot be before order date.";
    }
    if (formData.items.length === 0)
      tempErrors.items = "At least one item is required in the order.";

    formData.items.forEach((item, index) => {
      if (!item.productId)
        tempErrors[`item_${index}_productId`] = "Product selection is invalid."; // Should not happen with current UI
      if (
        item.quantity === "" ||
        item.quantity === null ||
        parseFloat(item.quantity) <= 0
      )
        tempErrors[`item_${index}_quantity`] = "Qty must be > 0.";
      if (
        item.unitPrice === "" ||
        item.unitPrice === null ||
        parseFloat(item.unitPrice) < 0
      )
        tempErrors[`item_${index}_unitPrice`] = "Price must be >= 0.";
    });

    if (formData.tax === "" || parseFloat(formData.tax) < 0)
      tempErrors.tax = "Tax cannot be negative.";
    if (formData.shippingCost === "" || parseFloat(formData.shippingCost) < 0)
      tempErrors.shippingCost = "Shipping cost cannot be negative.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Ensure numeric fields are numbers before submitting
      const dataToSubmit = {
        ...formData,
        tax: parseFloat(formData.tax) || 0,
        shippingCost: parseFloat(formData.shippingCost) || 0,
        items: formData.items.map((item) => ({
          ...item,
          quantity: parseFloat(item.quantity) || 0,
          unitPrice: parseFloat(item.unitPrice) || 0,
          totalPrice: parseFloat(item.totalPrice) || 0,
        })),
      };
      onSubmit(dataToSubmit);
    } else {
      showErrorToast("Please correct the errors highlighted in the form.");
    }
  };

  const poStatusOptions = [
    "Pending Approval",
    "Approved",
    "Ordered",
    "Partially Received",
    "Received",
    "Cancelled",
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-xl"
    >
      {/* PO Header */}
      <fieldset className="border p-4 rounded-md shadow-sm">
        <legend className="text-lg font-semibold px-2 text-gray-700">
          Order Details
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 mt-2">
          <div>
            <label
              htmlFor="vendorId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vendor *
            </label>
            <select
              id="vendorId"
              name="vendorId"
              value={formData.vendorId}
              onChange={handleHeaderChange}
              disabled={isSubmitting}
              required
              className={`block w-full px-3 py-2.5 border ${
                errors.vendorId
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">-- Select Vendor --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} (ID: {v.id})
                </option>
              ))}
            </select>
            {errors.vendorId && (
              <p className="mt-1 text-xs text-red-600">{errors.vendorId}</p>
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
            disabled={isSubmitting || isEditMode}
            className={isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}
          />
          <Input
            label="Expected Delivery Date *"
            id="expectedDeliveryDate"
            name="expectedDeliveryDate"
            type="date"
            value={formData.expectedDeliveryDate}
            onChange={handleHeaderChange}
            error={errors.expectedDeliveryDate}
            required
            disabled={isSubmitting}
          />

          {isEditMode && (
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
                } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                {poStatusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-xs text-red-600">{errors.status}</p>
              )}
            </div>
          )}
        </div>
      </fieldset>

      {/* Line Items */}
      <fieldset className="border p-4 rounded-md shadow-sm">
        <legend className="text-lg font-semibold px-2 text-gray-700">
          Items
        </legend>
        <div className="my-4 p-3 bg-gray-50 rounded-md" ref={productSearchRef}>
          <label
            htmlFor="productSearch"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Add Product to Order
          </label>
          <div className="relative flex items-center">
            <Search
              size={18}
              className="absolute left-3 text-gray-400 pointer-events-none"
            />
            <Input
              id="productSearch"
              name="productSearch"
              type="text"
              placeholder="Search product by name or SKU..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              onFocus={() => setIsProductSearchFocused(true)}
              // onBlur={() => setTimeout(() => setIsProductSearchFocused(false), 150)} // Delay to allow click on results
              className="pl-10 pr-10 w-full" // Make space for icons
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
                className="absolute right-3 p-1 text-gray-500 hover:text-gray-700"
              >
                <ClearIcon size={18} />
              </button>
            )}
          </div>
          {isProductSearchFocused && productSearchResults.length > 0 && (
            <ul className="absolute z-20 w-full sm:w-1/2 md:w-2/3 lg:w-1/3 bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
              {productSearchResults.map((p) => (
                <li
                  key={p.id}
                  onClick={() => handleAddProductItem(p)}
                  className="px-4 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b last:border-b-0"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-500">
                    SKU: {p.sku} | Stock: {p.stock} | Cost: $
                    {p.costPrice?.toFixed(2)}
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
            {" "}
            {/* Negative margin for small screens to use full width */}
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
                  <th className="px-2 sm:px-3 py-3 text-left font-medium text-gray-600 w-32">
                    Total
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
                      errors[`item_${index}_unitPrice`]
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
                        name={`quantity_${index}`}
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
                        name={`unitPrice_${index}`}
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
            Notes / Special Instructions
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="4"
            value={formData.notes}
            onChange={handleHeaderChange}
            disabled={isSubmitting}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          ></textarea>
        </div>
        <div className="space-y-3 p-4 bg-gray-50 rounded-md shadow-sm border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Subtotal:</span>
            <span className="text-sm font-semibold text-gray-800">
              ${(formData.subtotal || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <label
              htmlFor="tax"
              className="text-sm text-gray-600 mr-2 shrink-0"
            >
              Tax Amount:
            </label>
            <Input
              type="number"
              id="tax"
              name="tax"
              value={formData.tax}
              onChange={handleHeaderChange}
              step="0.01"
              min="0"
              className={`w-28 text-sm py-1.5 text-right ${
                errors.tax
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
              error={errors.tax}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between items-center">
            <label
              htmlFor="shippingCost"
              className="text-sm text-gray-600 mr-2 shrink-0"
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
          <div className="flex justify-between pt-2 border-t mt-2">
            <span className="text-lg font-bold text-gray-800">
              Grand Total:
            </span>
            <span className="text-lg font-bold text-accent">
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
                ? `/purchasing/purchase-orders/${initialData?.id}`
                : "/purchasing/purchase-orders"
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
            ? "Update Purchase Order"
            : "Create Purchase Order"}
        </Button>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;
