// src/components/accounting/AccountForm.jsx
import React, { useState, useEffect } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import { Save, XCircle } from "lucide-react";
import {
  ACCOUNT_TYPES,
  getParentAccountOptions,
} from "../../data/mockChartOfAccounts"; // Import types and helper



const AccountForm = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode = false,
  isSubmitting = false,
  existingAccountIds = [],
}) => {
  const defaultFormData = {
    accountId: "",
    accountName: "",
    accountType: ACCOUNT_TYPES.EXPENSE, // Default type
    parentAccountId: "",
    description: "",
    isActive: true,
    isCategory: false,
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [parentOptions, setParentOptions] = useState([]);

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const options = await getParentAccountOptions();
        // Filter out the current account itself if editing, to prevent self-parenting
        setParentOptions(
          options.filter(
            (opt) => !initialData || opt.accountId !== initialData.accountId
          )
        );
      } catch (error) {
        console.error("Failed to fetch parent accounts:", error);
      }
    };
    fetchParents();
  }, [initialData]); // Re-fetch if initialData changes (e.g. editing different accounts)

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        accountId: initialData.accountId || "",
        accountName: initialData.accountName || "",
        accountType: initialData.accountType || ACCOUNT_TYPES.EXPENSE,
        parentAccountId: initialData.parentAccountId || "",
        description: initialData.description || "",
        isActive:
          initialData.isActive !== undefined ? initialData.isActive : true,
        isCategory:
          initialData.isCategory !== undefined ? initialData.isCategory : false,
      });
    } else if (!isEditMode) {
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.accountId.trim())
      tempErrors.accountId = "Account ID is required.";
    else if (!/^\d+$/.test(formData.accountId.trim()))
      tempErrors.accountId = "Account ID must be numeric.";
    else if (
      !isEditMode &&
      existingAccountIds.includes(formData.accountId.trim())
    ) {
      tempErrors.accountId = "This Account ID already exists.";
    } else if (
      isEditMode &&
      initialData.accountId !== formData.accountId.trim() &&
      existingAccountIds.includes(formData.accountId.trim())
    ) {
      tempErrors.accountId =
        "This Account ID already exists for another account.";
    }

    if (!formData.accountName.trim())
      tempErrors.accountName = "Account Name is required.";
    if (!formData.accountType)
      tempErrors.accountType = "Account Type is required.";

    // Prevent circular parenting
    if (
      formData.parentAccountId &&
      formData.parentAccountId === formData.accountId
    ) {
      tempErrors.parentAccountId = "Account cannot be its own parent.";
    }
    // Further validation could check if parent is suitable (e.g. not making a leaf node a parent of a category)

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
    <form onSubmit={handleSubmit} className="space-y-5 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input
          label="Account ID *"
          id="accountId"
          name="accountId"
          value={formData.accountId}
          onChange={handleChange}
          error={errors.accountId}
          required
          disabled={isSubmitting}
          placeholder="e.g., 1011 or 6020"
        />
        <Input
          label="Account Name *"
          id="accountName"
          name="accountName"
          value={formData.accountName}
          onChange={handleChange}
          error={errors.accountName}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label
            htmlFor="accountType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Account Type *
          </label>
          <select
            id="accountType"
            name="accountType"
            value={formData.accountType}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            className={`w-full mt-1 px-3 py-2.5 border ${
              errors.accountType ? "border-red-500" : "border-gray-300"
            } rounded-md ...`}
          >
            {Object.values(ACCOUNT_TYPES).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.accountType && (
            <p className="text-xs text-red-500 mt-1">{errors.accountType}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="parentAccountId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Parent Account
          </label>
          <select
            id="parentAccountId"
            name="parentAccountId"
            value={formData.parentAccountId}
            onChange={handleChange}
            disabled={isSubmitting}
            className={`w-full mt-1 px-3 py-2.5 border ${
              errors.parentAccountId ? "border-red-500" : "border-gray-300"
            } rounded-md ...`}
          >
            <option value="">-- No Parent (Root Level) --</option>
            {parentOptions.map((opt) => (
              <option key={opt.accountId} value={opt.accountId}>
                {opt.accountId} - {opt.accountName}
              </option>
            ))}
          </select>
          {errors.parentAccountId && (
            <p className="text-xs text-red-500 mt-1">
              {errors.parentAccountId}
            </p>
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md ..."
        ></textarea>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent"
          />
          <label
            htmlFor="isActive"
            className="ml-2 block text-sm text-gray-900"
          >
            Active Account
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="isCategory"
            name="isCategory"
            type="checkbox"
            checked={formData.isCategory}
            onChange={handleChange}
            disabled={isSubmitting}
            className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent"
          />
          <label
            htmlFor="isCategory"
            className="ml-2 block text-sm text-gray-900"
          >
            Is Category/Header Account
          </label>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-5 border-t mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          IconLeft={XCircle}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          IconLeft={Save}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Update Account"
            : "Create Account"}
        </Button>
      </div>
    </form>
  );
};

export default AccountForm;
