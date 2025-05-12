import React, { useState, useEffect } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import { Save, XCircle } from "lucide-react";

const EmployeeForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditMode = false,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    employeeId: "", // Official Employee ID, could be auto-generated or manual
    email: "",
    phone: "",
    department: "",
    position: "",
    hireDate: new Date().toISOString().split("T")[0], // Default to today for new hires
    status: "Active", // Default status
    salary: "", // Can be number
    address: "",
    // Add other fields like dateOfBirth, emergencyContact, etc. as needed
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData, // Keep defaults if not in initialData
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      employeeId: initialData.employeeId || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      department: initialData.department || "",
      position: initialData.position || "",
      hireDate: initialData.hireDate || new Date().toISOString().split("T")[0],
      status: initialData.status || "Active",
      salary: initialData.salary || "",
      address: initialData.address || "",
    }));
    setErrors({}); // Clear errors when data (re)loads
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.firstName.trim())
      tempErrors.firstName = "First name is required.";
    if (!formData.lastName.trim())
      tempErrors.lastName = "Last name is required.";
    if (!formData.employeeId.trim())
      tempErrors.employeeId = "Employee ID is required.";
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email is not valid.";
    }
    if (!formData.department.trim())
      tempErrors.department = "Department is required.";
    if (!formData.position.trim())
      tempErrors.position = "Position is required.";
    if (!formData.hireDate) tempErrors.hireDate = "Hire date is required.";
    if (formData.salary && isNaN(parseFloat(formData.salary)))
      tempErrors.salary = "Salary must be a number.";
    else if (formData.salary && parseFloat(formData.salary) < 0)
      tempErrors.salary = "Salary cannot be negative.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const dataToSubmit = {
        ...formData,
        salary: formData.salary === "" ? null : parseFloat(formData.salary), // Ensure salary is number or null
      };
      onSubmit(dataToSubmit);
    }
  };

  const departmentOptions = [
    "Engineering",
    "Marketing",
    "Sales",
    "Human Resources",
    "Finance",
    "Operations",
    "Customer Support",
  ];
  const statusOptions = [
    "Active",
    "On Leave",
    "Terminated",
    "Probation",
    "Contract",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-1">
      {" "}
      {/* Reduced overall padding as modal has padding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input
          label="First Name"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          required
          disabled={isSubmitting}
        />
        <Input
          label="Last Name"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <Input
          label="Employee ID"
          id="employeeId"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          error={errors.employeeId}
          required
          disabled={isSubmitting}
        />
        <Input
          label="Email Address"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
        <Input
          label="Hire Date"
          id="hireDate"
          name="hireDate"
          type="date"
          value={formData.hireDate}
          onChange={handleChange}
          error={errors.hireDate}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label
            htmlFor="department"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Department
          </label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            className={`block w-full px-3 py-2 border ${
              errors.department ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-50`}
          >
            <option value="">Select Department</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="mt-1 text-xs text-red-600">{errors.department}</p>
          )}
        </div>
        <Input
          label="Position / Job Title"
          id="position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          error={errors.position}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Employment Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isSubmitting}
            required
            className={`block w-full px-3 py-2 border ${
              errors.status ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-white disabled:bg-gray-50`}
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
        <Input
          label="Salary (Annual)"
          id="salary"
          name="salary"
          type="number"
          step="100"
          value={formData.salary}
          onChange={handleChange}
          error={errors.salary}
          placeholder="e.g., 60000"
          disabled={isSubmitting}
        />
      </div>
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
          className={`block w-full px-3 py-2 border ${
            errors.address ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm disabled:bg-gray-50`}
        ></textarea>
        {errors.address && (
          <p className="mt-1 text-xs text-red-600">{errors.address}</p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-5 border-t border-gray-200 mt-6">
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
          className="w-full sm:w-auto"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
            ? "Save Changes"
            : "Add Employee"}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
