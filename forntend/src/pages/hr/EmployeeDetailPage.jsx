// src/pages/hr/EmployeeDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getEmployeeById } from "../../data/mockEmployees"; // Assuming this is correctly exported
import Button from "../../components/common/Button";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  DollarSign,
  CalendarDays,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { showErrorToast } from "../../utils/toastNotifications"; // For potential error notifications

// Reusable Detail Item component (can be moved to common components if used elsewhere)
const DetailItem = ({ icon, label, value, children, className = "" }) => {
  const IconComponent = icon;
  return (
    <div className={`flex items-start py-3 ${className}`}>
      {IconComponent && (
        <IconComponent
          size={18}
          className="text-gray-500 mr-3 mt-0.5 flex-shrink-0"
        />
      )}
      <div className="flex-grow">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-0.5 text-sm text-gray-900 break-words">
          {children
            ? children
            : value !== null && value !== undefined && value !== ""
            ? value
            : "-"}
        </dd>
      </div>
    </div>
  );
};

const EmployeeDetailPage = () => {
  const { id } = useParams(); // Gets employee 'id' from URL
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!id) {
        setError("Employee ID not provided.");
        showErrorToast("Invalid employee ID.");
        setIsLoading(false);
        navigate("/hr/employees"); // Redirect if no ID
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const fetchedEmployee = await getEmployeeById(id);
        if (fetchedEmployee) {
          setEmployee(fetchedEmployee);
        } else {
          setError(`Employee with ID "${id}" not found.`);
          showErrorToast(`Employee with ID "${id}" not found.`);
          // navigate('/hr/employees'); // Optionally redirect
        }
      } catch (err) {
        console.error("Failed to fetch employee details:", err);
        setError("Failed to load employee details. Please try again.");
        showErrorToast("Error loading employee details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployeeDetails();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {" "}
        {/* Full screen loader */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent"></div>
        <p className="ml-4 text-xl text-gray-600">
          Loading Employee Profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md"
          role="alert"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="font-bold">Error Loading Employee</p>
              <p>{error}</p>
            </div>
          </div>
          <div className="mt-4 text-right">
            <Button
              variant="secondary"
              onClick={() => navigate("/hr/employees")}
              IconLeft={ArrowLeft}
            >
              Back to Employees
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    // Should be caught by error, but as a fallback
    return (
      <div className="container mx-auto p-6 text-center text-gray-500">
        <p className="text-xl mb-4">Employee data could not be loaded.</p>
        <Button
          variant="primary"
          onClick={() => navigate("/hr/employees")}
          IconLeft={ArrowLeft}
        >
          Go to Employees List
        </Button>
      </div>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/hr/employees")}
            IconLeft={ArrowLeft}
            className="self-start sm:self-center"
          >
            Back to Employees
          </Button>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-800">{fullName}</h1>
            <p className="text-md text-gray-600">{employee.position}</p>
          </div>
          {/* In a real app, edit button might open a modal or navigate to an edit page */}
          <Button
            variant="primary"
            IconLeft={Edit}
            onClick={() =>
              showErrorToast("Edit on detail page: Modal/page TBD")
            } // Placeholder for now
            // onClick={() => navigate(`/hr/employees/${employee.id}/edit`)} // If you had a separate edit page
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Contact & Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              Contact Information
            </h2>
            <dl className="space-y-1">
              <DetailItem
                icon={Mail}
                label="Email Address"
                value={employee.email}
              />
              <DetailItem
                icon={Phone}
                label="Phone Number"
                value={employee.phone}
              />
              <DetailItem icon={MapPin} label="Address">
                <span className="whitespace-pre-line">
                  {employee.address || "-"}
                </span>
              </DetailItem>
              {/* Add more personal details if needed: DOB, Emergency Contact etc. */}
            </dl>
          </div>
        </div>

        {/* Right Column: Employment Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              Employment Details
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              <DetailItem
                icon={Briefcase}
                label="Employee ID"
                value={employee.employeeId}
                className="md:border-r md:pr-6"
              />
              <DetailItem
                icon={Briefcase}
                label="Department"
                value={employee.department}
              />
              <DetailItem
                icon={UserCheck}
                label="Position"
                value={employee.position}
                className="md:border-r md:pr-6"
              />
              <DetailItem icon={UserCheck} label="Employment Status">
                <span
                  className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${
                                      employee.status === "Active"
                                        ? "bg-green-100 text-green-800"
                                        : employee.status === "Terminated"
                                        ? "bg-red-100 text-red-800"
                                        : employee.status === "On Leave"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                >
                  {employee.status}
                </span>
              </DetailItem>
              <DetailItem
                icon={CalendarDays}
                label="Hire Date"
                value={
                  employee.hireDate
                    ? new Date(employee.hireDate).toLocaleDateString()
                    : "-"
                }
                className="md:border-r md:pr-6"
              />
              <DetailItem
                icon={DollarSign}
                label="Salary (Annual)"
                value={
                  employee.salary
                    ? `$${Number(employee.salary).toLocaleString()}`
                    : "-"
                }
              />
            </dl>
          </div>

          {/* Placeholder for other sections like Performance, Leave, Documents */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              Additional Information
            </h2>
            <p className="text-gray-600">
              Sections for performance reviews, leave history, documents, etc.,
              can be added here. (This is a placeholder).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailPage;
