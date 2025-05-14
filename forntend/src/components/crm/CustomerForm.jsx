// src/components/crm/CustomerForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../common/Input";
import Button from "../common/Button";
import { Save, XCircle } from "lucide-react";

const CustomerForm = ({
  initialData,
  onSubmit,
  isEditMode = false,
  isSubmitting = false,
}) => {
  const navigate = useNavigate();
  const defaultFormData = {
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    customerType: "Individual",
    status: "Prospect",
    notes: "",
    taxId: "",
    joinedDate: new Date().toISOString().split("T")[0],
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        companyName: initialData.companyName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        zipCode: initialData.zipCode || "",
        country: initialData.country || "",
        customerType: initialData.customerType || "Individual",
        status: initialData.status || "Prospect",
        notes: initialData.notes || "",
        taxId: initialData.taxId || "",
        joinedDate:
          initialData.joinedDate || new Date().toISOString().split("T")[0],
      });
    } else if (!isEditMode) {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.firstName.trim() && !formData.companyName.trim()) {
      tempErrors.firstName = "Either First Name or Company Name is required.";
      tempErrors.companyName = "Either First Name or Company Name is required.";
    }
    if (
      formData.firstName.trim() &&
      !formData.lastName.trim() &&
      !formData.companyName.trim()
    ) {
      // If first name is provided, last name becomes somewhat expected for individuals if no company
      tempErrors.lastName =
        "Last name is required if first name is provided without a company.";
    }
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is not valid.";
    }
    if (!formData.customerType)
      tempErrors.customerType = "Customer type is required.";
    if (!formData.status) tempErrors.status = "Status is required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    } else {
      // showErrorToast can be called from parent component
    }
  };

  const customerTypeOptions = [
    "Individual",
    "Corporate",
    "Government",
    "Non-Profit/Organization",
    "Reseller",
    "Other",
  ];
  const statusOptions = ["Prospect", "Active", "Inactive", "On Hold", "Lead"];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <Input
          label="First Name"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          disabled={isSubmitting}
        />
        <Input
          label="Last Name"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          disabled={isSubmitting}
        />
      </div>
      <Input
        label="Company Name"
        id="companyName"
        name="companyName"
        value={formData.companyName}
        onChange={handleChange}
        error={errors.companyName}
        disabled={isSubmitting}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <Input
          label="Email Address *"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          disabled={isSubmitting}
        />
        <Input
          label="Phone Number"
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          disabled={isSubmitting}
        />
      </div>

      <fieldset className="border p-4 rounded-md mt-2">
        <legend className="text-sm font-medium px-1 text-gray-600">
          Address Details
        </legend>
        <div className="space-y-5 pt-2">
          <Input
            label="Street Address"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            disabled={isSubmitting}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
            <Input
              label="City"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
              disabled={isSubmitting}
            />
            <Input
              label="State / Province"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              error={errors.state}
              disabled={isSubmitting}
            />
            <Input
              label="ZIP / Postal Code"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              error={errors.zipCode}
              disabled={isSubmitting}
            />
          </div>
          <Input
            label="Country"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            error={errors.country}
            disabled={isSubmitting}
          />
        </div>
      </fieldset>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div>
          <label
            htmlFor="customerType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Customer Type *
          </label>
          <select
            id="customerType"
            name="customerType"
            value={formData.customerType}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            className={`block w-full px-3 py-2.5 border ${
              errors.customerType
                ? "border-red-500 ring-1 ring-red-500"
                : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-100`}
          >
            {customerTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.customerType && (
            <p className="mt-1 text-xs text-red-600">{errors.customerType}</p>
          )}
        </div>
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
            onChange={handleChange}
            disabled={isSubmitting}
            required
            className={`block w-full px-3 py-2.5 border ${
              errors.status
                ? "border-red-500 ring-1 ring-red-500"
                : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-100`}
          >
            {statusOptions.map((stat) => (
              <option key={stat} value={stat}>
                {stat}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-xs text-red-600">{errors.status}</p>
          )}
        </div>
      </div>
      <Input
        label="Tax ID / VAT Number"
        id="taxId"
        name="taxId"
        value={formData.taxId}
        onChange={handleChange}
        error={errors.taxId}
        disabled={isSubmitting}
      />
      <Input
        label="Joined Date"
        id="joinedDate"
        name="joinedDate"
        type="date"
        value={formData.joinedDate}
        onChange={handleChange}
        error={errors.joinedDate}
        disabled={isSubmitting || isEditMode}
        className={isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}
      />

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows="3"
          value={formData.notes}
          onChange={handleChange}
          disabled={isSubmitting}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm disabled:bg-gray-100"
        ></textarea>
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            navigate(
              isEditMode
                ? `/crm/customers/${initialData?.id}`
                : "/crm/customers"
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
            ? "Save Changes"
            : "Add Customer"}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
