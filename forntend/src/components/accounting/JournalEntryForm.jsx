// src/components/accounting/JournalEntryForm.jsx
import React, { useState, useEffect, useCallback } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import { Save, XCircle, PlusCircle, Trash2 } from "lucide-react";
import { getChartOfAccounts } from "../../data/mockChartOfAccounts"; // For COA dropdown
import { calculateJEDebitsCredits } from "../../data/mockJournalEntries"; // CORRECTED: Import from mockJournalEntries
import { showErrorToast, showInfoToast } from "../../utils/toastNotifications";

const JournalEntryForm = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode = false,
  isSubmitting = false,
}) => {
  const defaultLine = {
    accountId: "",
    debit: "",
    credit: "",
    description: "",
    key: Math.random(),
  }; // Add key here
  const defaultFormData = {
    entryDate: new Date().toISOString().split("T")[0],
    description: "",
    referenceNumber: "",
    status: "Draft",
    lines: [
      { ...defaultLine, key: Math.random() }, // Ensure unique keys
      { ...defaultLine, key: Math.random() },
    ],
    totalDebits: 0,
    totalCredits: 0,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [chartOfAccountsOptions, setChartOfAccountsOptions] = useState([]);

  useEffect(() => {
    const fetchCOA = async () => {
      try {
        const coa = await getChartOfAccounts();
        setChartOfAccountsOptions(
          coa.filter((acc) => acc.isActive && !acc.isCategory) || []
        );
      } catch (error) {
        console.error("Error fetching COA for JE form:", error);
        showErrorToast("Could not load Chart of Accounts options.");
      }
    };
    fetchCOA();
  }, []);

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        ...defaultFormData, // Start with defaults to ensure all fields exist
        ...initialData,
        // Ensure lines have unique keys for React list rendering if they don't already
        lines: initialData.lines
          ? JSON.parse(JSON.stringify(initialData.lines)).map((line) => ({
              ...line,
              key: line.key || Math.random(),
            }))
          : [
              { ...defaultLine, key: Math.random() },
              { ...defaultLine, key: Math.random() },
            ], // Ensure at least two lines if initialData.lines is missing
      });
    } else if (!isEditMode) {
      // For new entries, or if initialData is for pre-filling a new form
      if (initialData && Object.keys(initialData).length > 0) {
        setFormData({
          ...defaultFormData,
          ...initialData,
          lines: initialData.lines
            ? JSON.parse(JSON.stringify(initialData.lines)).map((line) => ({
                ...line,
                key: line.key || Math.random(),
              }))
            : [
                { ...defaultLine, key: Math.random() },
                { ...defaultLine, key: Math.random() },
              ],
        });
      } else {
        setFormData(defaultFormData);
      }
    }
    setErrors({});
  }, [initialData, isEditMode]);

  const updateTotals = useCallback(() => {
    // Use the imported calculateJEDebitsCredits function
    const { totalDebits, totalCredits } = calculateJEDebitsCredits(
      formData.lines
    );
    setFormData((prev) => ({ ...prev, totalDebits, totalCredits }));
  }, [formData.lines]);

  useEffect(() => {
    updateTotals();
  }, [updateTotals]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleLineChange = (index, field, value) => {
    const newLines = formData.lines.map((line, i) => {
      if (i === index) {
        const updatedLine = { ...line, [field]: value };
        if (field === "debit" && value !== "" && parseFloat(value) !== 0) {
          updatedLine.credit = ""; // Clear credit if debit has a value
        } else if (
          field === "credit" &&
          value !== "" &&
          parseFloat(value) !== 0
        ) {
          updatedLine.debit = ""; // Clear debit if credit has a value
        }
        return updatedLine;
      }
      return line;
    });
    setFormData((prev) => ({ ...prev, lines: newLines }));
    // Clear specific line error if any
    if (errors[`line_${index}_accountId`] || errors[`line_${index}_amount`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`line_${index}_accountId`];
        delete newErrors[`line_${index}_amount`];
        return newErrors;
      });
    }
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, { ...defaultLine, key: Math.random() }],
    }));
  };

  const removeLineItem = (index) => {
    if (formData.lines.length <= 1) {
      // Keep at least one line for editing
      showInfoToast(
        "A journal entry should have at least one complete line. Clear fields if needed."
      );
      return;
    }
    // If lines must be >= 2 for submission, this logic might change slightly.
    // For now, allow removing down to 1 line. Validation will catch <2 lines on submit.
    setFormData((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.entryDate) tempErrors.entryDate = "Entry date is required.";
    if (!formData.description.trim())
      tempErrors.description = "Description/Memo is required.";

    const validLines = formData.lines.filter(
      (line) =>
        line.accountId ||
        (line.debit && parseFloat(line.debit) !== 0) ||
        (line.credit && parseFloat(line.credit) !== 0)
    );

    if (validLines.length < 2) {
      tempErrors.lines =
        "At least two complete lines (Account, Debit/Credit) are required.";
    }

    let lineErrorsExist = false;
    validLines.forEach((line, index) => {
      // Validate only non-empty lines
      const originalIndex = formData.lines.findIndex((l) => l.key === line.key); // Get original index for error key
      if (!line.accountId) {
        tempErrors[`line_${originalIndex}_accountId`] = "Account required.";
        lineErrorsExist = true;
      }
      const debit = parseFloat(line.debit);
      const credit = parseFloat(line.credit);

      if ((isNaN(debit) || debit === 0) && (isNaN(credit) || credit === 0)) {
        tempErrors[`line_${originalIndex}_amount`] =
          "Debit or Credit value required.";
        lineErrorsExist = true;
      } else if (!isNaN(debit) && debit < 0) {
        tempErrors[`line_${originalIndex}_amount`] = "Debit must be >= 0.";
        lineErrorsExist = true;
      } else if (!isNaN(credit) && credit < 0) {
        tempErrors[`line_${originalIndex}_amount`] = "Credit must be >= 0.";
        lineErrorsExist = true;
      } else if (
        !isNaN(debit) &&
        debit !== 0 &&
        !isNaN(credit) &&
        credit !== 0
      ) {
        tempErrors[`line_${originalIndex}_amount`] =
          "Use either Debit OR Credit, not both.";
        lineErrorsExist = true;
      }
    });

    if (!lineErrorsExist && validLines.length > 0) {
      // Check balance only if individual lines are somewhat valid
      const { totalDebits, totalCredits } =
        calculateJEDebitsCredits(validLines);
      if (totalDebits !== totalCredits) {
        tempErrors.balance =
          "Total Debits ($" +
          totalDebits.toFixed(2) +
          ") must equal Total Credits ($" +
          totalCredits.toFixed(2) +
          "). Difference: $" +
          Math.abs(totalDebits - totalCredits).toFixed(2);
      }
      if (totalDebits === 0) {
        // Or totalCredits === 0, since they must be equal
        tempErrors.balance =
          "Total transaction amount cannot be zero for a posted entry.";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const linesToSubmit = formData.lines
        .filter(
          (line) =>
            line.accountId &&
            ((parseFloat(line.debit) || 0) !== 0 ||
              (parseFloat(line.credit) || 0) !== 0)
        )
        .map((line) => ({
          // Prepare for submission
          accountId: line.accountId,
          debit: parseFloat(line.debit) || 0,
          credit: parseFloat(line.credit) || 0,
          description: line.description ? line.description.trim() : "",
        }));

      if (linesToSubmit.length < 2) {
        showErrorToast(
          "A journal entry must have at least two valid lines with amounts."
        );
        setErrors((prev) => ({
          ...prev,
          lines: "At least two complete lines are required.",
        }));
        return;
      }
      // Re-check balance with filtered lines just before submit
      const { totalDebits, totalCredits } =
        calculateJEDebitsCredits(linesToSubmit);
      if (totalDebits !== totalCredits) {
        showErrorToast("Debits do not equal credits. Please check line items.");
        setErrors((prev) => ({
          ...prev,
          balance:
            "Debits ($" +
            totalDebits.toFixed(2) +
            ") must equal Credits ($" +
            totalCredits.toFixed(2) +
            ").",
        }));
        return;
      }
      if (totalDebits === 0 && formData.status === "Posted") {
        showErrorToast(
          "A posted journal entry cannot have a zero total amount."
        );
        setErrors((prev) => ({
          ...prev,
          balance: "Total amount cannot be zero for a posted entry.",
        }));
        return;
      }

      const dataToSubmit = {
        entryDate: formData.entryDate,
        description: formData.description.trim(),
        referenceNumber: formData.referenceNumber.trim(),
        status: formData.status, // Status is handled in the form header
        lines: linesToSubmit,
      };
      onSubmit(dataToSubmit);
    } else {
      showErrorToast("Please correct the errors highlighted in the form.");
    }
  };

  const jeStatusOptions = ["Draft", "Posted"];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow-xl"
    >
      <fieldset className="border p-4 rounded-md shadow-sm">
        <legend className="text-lg font-semibold px-2 text-gray-700">
          Journal Entry Header
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 mt-2">
          <Input
            label="Entry Date *"
            type="date"
            id="entryDate"
            name="entryDate"
            value={formData.entryDate}
            onChange={handleHeaderChange}
            error={errors.entryDate}
            required
            disabled={
              isSubmitting || (isEditMode && formData.status === "Posted")
            }
            className={
              isEditMode && formData.status === "Posted"
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }
          />
          <Input
            label="Description / Memo *"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleHeaderChange}
            error={errors.description}
            required
            disabled={isSubmitting}
            className="md:col-span-2 lg:col-span-1"
          />
          <Input
            label="Reference #"
            id="referenceNumber"
            name="referenceNumber"
            value={formData.referenceNumber}
            onChange={handleHeaderChange}
            error={errors.referenceNumber}
            disabled={isSubmitting}
          />

          <div>
            {" "}
            {/* Status field for both Add and Edit mode */}
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
              disabled={
                isSubmitting || (isEditMode && initialData?.status === "Posted")
              } // Cannot un-post easily
              required
              className={`block w-full px-3 py-2.5 border ${
                errors.status
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              {jeStatusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-red-600">{errors.status}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="border p-4 rounded-md shadow-sm">
        <legend className="text-lg font-semibold px-2 text-gray-700">
          Journal Lines
        </legend>
        <div className="overflow-x-auto mt-2 -mx-4 sm:mx-0">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-600 w-2/5">
                  Account *
                </th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 w-[100px] sm:w-1/6">
                  Debit
                </th>
                <th className="px-3 py-2 text-right font-medium text-gray-600 w-[100px] sm:w-1/6">
                  Credit
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-600 w-1/4">
                  Line Description
                </th>
                <th className="px-3 py-2 text-center font-medium text-gray-600 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {formData.lines.map((line, index) => (
                <tr
                  key={line.key}
                  className={`${
                    errors[`line_${index}_accountId`] ||
                    errors[`line_${index}_amount`]
                      ? "bg-red-50"
                      : ""
                  }`}
                >
                  <td className="px-2 py-1.5 align-top">
                    <select
                      name="accountId"
                      value={line.accountId}
                      onChange={(e) =>
                        handleLineChange(index, "accountId", e.target.value)
                      }
                      required={
                        (parseFloat(line.debit) || 0) !== 0 ||
                        (parseFloat(line.credit) || 0) !== 0
                      }
                      disabled={isSubmitting}
                      className={`block w-full px-3 py-2 border ${
                        errors[`line_${index}_accountId`]
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-100`}
                    >
                      <option value="">-- Select Account --</option>
                      {chartOfAccountsOptions.map((acc) => (
                        <option key={acc.id} value={acc.accountId}>
                          {acc.accountId} - {acc.accountName}
                        </option>
                      ))}
                    </select>
                    {errors[`line_${index}_accountId`] && (
                      <p className="text-xs text-red-600 mt-0.5">
                        {errors[`line_${index}_accountId`]}
                      </p>
                    )}
                  </td>
                  <td className="px-2 py-1.5 align-top">
                    <Input
                      type="number"
                      name="debit"
                      value={line.debit}
                      onChange={(e) =>
                        handleLineChange(index, "debit", e.target.value)
                      }
                      step="0.01"
                      min="0"
                      className={`w-full text-sm py-1.5 text-right ${
                        errors[`line_${index}_amount`] &&
                        (parseFloat(line.debit) !== 0 || !line.credit)
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={
                        isSubmitting ||
                        (line.credit !== "" && parseFloat(line.credit) !== 0)
                      }
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-2 py-1.5 align-top">
                    <Input
                      type="number"
                      name="credit"
                      value={line.credit}
                      onChange={(e) =>
                        handleLineChange(index, "credit", e.target.value)
                      }
                      step="0.01"
                      min="0"
                      className={`w-full text-sm py-1.5 text-right ${
                        errors[`line_${index}_amount`] &&
                        (parseFloat(line.credit) !== 0 || !line.debit)
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={
                        isSubmitting ||
                        (line.debit !== "" && parseFloat(line.debit) !== 0)
                      }
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-2 py-1.5 align-top">
                    <Input
                      type="text"
                      name="description"
                      value={line.description}
                      onChange={(e) =>
                        handleLineChange(index, "description", e.target.value)
                      }
                      className="w-full text-sm py-1.5 border-gray-300"
                      disabled={isSubmitting}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center align-middle">
                    <Button
                      type="button"
                      variant="danger_outline"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      IconLeft={Trash2}
                      className="p-1.5"
                      disabled={isSubmitting}
                      title="Remove Line"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {errors.lines && (
            <p className="text-xs text-red-600 mt-1 text-center">
              {errors.lines}
            </p>
          )}
        </div>
        <div className="mt-3 text-right">
          <Button
            type="button"
            variant="outline"
            size="sm"
            IconLeft={PlusCircle}
            onClick={addLineItem}
            disabled={isSubmitting}
          >
            Add Line
          </Button>
        </div>
        <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row sm:justify-end sm:space-x-8 sm:pr-16">
          <div className="text-right mb-2 sm:mb-0">
            <span className="text-sm text-gray-500">Total Debits:</span>
            <p
              className={`font-semibold text-lg ${
                formData.totalDebits !== formData.totalCredits
                  ? "text-red-500"
                  : "text-gray-800"
              }`}
            >
              ${formData.totalDebits.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">Total Credits:</span>
            <p
              className={`font-semibold text-lg ${
                formData.totalDebits !== formData.totalCredits
                  ? "text-red-500"
                  : "text-gray-800"
              }`}
            >
              ${formData.totalCredits.toFixed(2)}
            </p>
          </div>
        </div>
        {errors.balance && (
          <p className="text-sm text-red-600 mt-2 text-right sm:pr-16">
            {errors.balance}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-5 border-t mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
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
            ? "Update Entry"
            : "Create Entry"}
        </Button>
      </div>
    </form>
  );
};

export default JournalEntryForm;
