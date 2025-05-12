// src/components/vendors/VendorForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../common/Input";
import Button from "../common/Button";
import { Save, XCircle } from "lucide-react";

const VendorForm = ({
  initialData,
  onSubmit,
  isEditMode = false,
  isSubmitting = false,
}) => {
  // Removed default {} for initialData here
  const navigate = useNavigate();

  // Initialize formData based on initialData OR defaults for a new form
  const [formData, setFormData] = useState(() => {
    const defaults = {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      category: "",
      status: "Active",
      address: "",
      notes: "",
    };
    // If initialData is provided (for editing), use it, otherwise use defaults
    return initialData ? { ...defaults, ...initialData } : defaults;
  });

  const [errors, setErrors] = useState({});

  // This useEffect is now ONLY for when initialData actually changes
  // (e.g., when switching from editing one vendor to another, or from add to edit in a modal)
  // It's less critical if you always navigate to a new page for add/edit.
  useEffect(() => {
    if (initialData) {
      // Only update if initialData is explicitly provided and changes
      setFormData((prevData) => ({
        ...prevData, // Keep any existing fields not in initialData (though unlikely here)
        name: initialData.name || "",
        contactPerson: initialData.contactPerson || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        category: initialData.category || "",
        status: initialData.status || "Active",
        address: initialData.address || "",
        notes: initialData.notes || "",
      }));
      setErrors({}); // Clear errors when data reloads
    } else if (!isEditMode) {
      // If not in edit mode and no initial data, ensure form is reset to defaults
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        category: "",
        status: "Active",
        address: "",
        notes: "",
      });
      setErrors({});
    }
  }, [initialData, isEditMode]); // Add isEditMode to dependencies if you rely on it for resetting

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Vendor name is required.";
    if (!formData.contactPerson.trim())
      tempErrors.contactPerson = "Contact person is required.";
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is not valid.";
    }
    if (!formData.category.trim())
      tempErrors.category = "Category is required.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 md:p-8 rounded-lg shadow-md"
    >
      {/* Vendor Name and Contact Person */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input
          label="Vendor Name"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="e.g., Acme Corp"
          required
          disabled={isSubmitting}
        />
        <Input
          label="Contact Person"
          id="contactPerson"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          error={errors.contactPerson}
          placeholder="e.g., John Doe"
          required
          disabled={isSubmitting}
        />
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="e.g., contact@acme.com"
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
          placeholder="e.g., (555) 123-4567"
          disabled={isSubmitting}
        />
      </div>

      {/* Category and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input
          label="Category"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          error={errors.category}
          placeholder="e.g., Office Supplies, Electronics"
          required
          disabled={isSubmitting}
        />
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`block w-full px-3 py-2 border ${
              errors.status ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm 
                        focus:outline-none ${
                          errors.status
                            ? "focus:ring-red-500 focus:border-red-500"
                            : "focus:ring-accent focus:border-accent"
                        } 
                        sm:text-sm bg-white disabled:bg-gray-50`}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending Review</option>
            <option value="On Hold">On Hold</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-xs text-red-600">{errors.status}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Address
        </label>
        <textarea
          id="address"
          name="address"
          rows="3"
          value={formData.address}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="123 Main Street, Anytown, USA 12345"
          className={`block w-full px-3 py-2 border ${
            errors.address ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm 
                      focus:outline-none ${
                        errors.address
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-accent focus:border-accent"
                      } 
                      sm:text-sm disabled:bg-gray-50`}
        ></textarea>
        {errors.address && (
          <p className="mt-1 text-xs text-red-600">{errors.address}</p>
        )}
      </div>

      {/* Notes */}
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
          placeholder="Any additional information about the vendor..."
          className={`block w-full px-3 py-2 border ${
            errors.notes ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm 
                      focus:outline-none ${
                        errors.notes
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-accent focus:border-accent"
                      } 
                      sm:text-sm disabled:bg-gray-50`}
        ></textarea>
        {errors.notes && (
          <p className="mt-1 text-xs text-red-600">{errors.notes}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 mt-8">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            navigate(isEditMode ? `/vendors/${initialData?.id}` : "/vendors")
          } // Navigate back appropriately
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
            ? isEditMode
              ? "Saving Changes..."
              : "Creating Vendor..."
            : isEditMode
            ? "Save Changes"
            : "Create Vendor"}
        </Button>
      </div>
    </form>
  );
};

export default VendorForm;
