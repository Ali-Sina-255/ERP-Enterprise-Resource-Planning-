// src/pages/hr/EmployeesPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getEmployees,
  deleteEmployee as apiDeleteEmployee,
  addEmployee as apiAddEmployee, // <<<< CORRECTED/VERIFIED IMPORT
  updateEmployee as apiUpdateEmployee, // <<<< CORRECTED/VERIFIED IMPORT
} from "../../data/mockEmployees";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import EmployeeForm from "../../components/hr/EmployeeForm";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toastNotifications";

const ITEMS_PER_PAGE = 8;

const EmployeesPage = () => {
  // ... (useState, useEffect for fetch, filteredEmployees, pagination logic - remains the same)
  const [allEmployees, setAllEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      setPageError(null);
      try {
        const data = await getEmployees();
        setAllEmployees(data || []);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        setPageError("Failed to load employees. Please try again later.");
        showErrorToast("Error loading employees list.");
        setAllEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm) return allEmployees;
    return allEmployees.filter(
      (emp) =>
        `${emp.firstName} ${emp.lastName}`
          .toLowerCase()
          .includes(lowerSearchTerm) ||
        (emp.employeeId &&
          emp.employeeId.toLowerCase().includes(lowerSearchTerm)) ||
        (emp.email && emp.email.toLowerCase().includes(lowerSearchTerm)) ||
        (emp.department &&
          emp.department.toLowerCase().includes(lowerSearchTerm)) ||
        (emp.position && emp.position.toLowerCase().includes(lowerSearchTerm))
    );
  }, [searchTerm, allEmployees]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && filteredEmployees.length > 0) {
      setCurrentPage(1);
    } else if (currentPage === 0 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [searchTerm, filteredEmployees.length, totalPages, currentPage]);

  const handleOpenModalForNew = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleFormSubmit = async (employeeData) => {
    setIsSubmittingForm(true);
    try {
      let updatedList;
      let successMessage = "";
      if (editingEmployee) {
        // For updating existing employee
        const updated = await apiUpdateEmployee(
          editingEmployee.id,
          employeeData
        ); // Uses apiUpdateEmployee
        if (!updated) throw new Error("Update failed or employee not found."); // Handle null response from mock
        updatedList = allEmployees.map((emp) =>
          emp.id === editingEmployee.id ? updated : emp
        );
        successMessage = "Employee details updated successfully!";
      } else {
        // For adding new employee
        const newEmp = await apiAddEmployee(employeeData); // <<<< THIS IS THE CRITICAL LINE
        if (!newEmp) throw new Error("Add failed."); // Handle null response from mock
        updatedList = [...allEmployees, newEmp];
        successMessage = "Employee added successfully!";
      }
      setAllEmployees(updatedList);
      showSuccessToast(successMessage);
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save employee:", error);
      showErrorToast(
        `Error: ${editingEmployee ? "updating" : "adding"} employee. ${
          error.message || ""
        }`
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDelete = async (employeeId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this employee record? This action cannot be undone."
      )
    ) {
      try {
        await apiDeleteEmployee(employeeId);
        const updatedEmployees = allEmployees.filter(
          (emp) => emp.id !== employeeId
        );
        setAllEmployees(updatedEmployees);
        showSuccessToast("Employee record deleted successfully!");
        if (paginatedEmployees.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error("Failed to delete employee:", err);
        showErrorToast("Failed to delete employee record.");
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      if (currentPage > halfPagesToShow + 2) pageNumbers.push("...");

      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);

      if (currentPage <= halfPagesToShow + 1)
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      if (currentPage >= totalPages - halfPagesToShow)
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);

      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

      if (currentPage < totalPages - halfPagesToShow - 1)
        pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
    return pageNumbers.filter(
      (item, index) => pageNumbers.indexOf(item) === index
    );
  };

  // ... (rest of the JSX for loading states, error display, table, and pagination)
  // The JSX part previously provided should be correct.
  // Just ensure the imports and function calls are right.

  if (isLoading && !allEmployees.length && !pageError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading employees...</p>
      </div>
    );
  }

  if (pageError && !allEmployees.length) {
    return (
      <div className="container mx-auto p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold mr-2">
            <AlertTriangle className="inline-block mr-2" size={20} />
            Error:
          </strong>
          <span className="block sm:inline">{pageError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold text-gray-800">
          Manage Employees
        </h1>
        <Button
          variant="primary"
          IconLeft={UserPlus}
          onClick={handleOpenModalForNew}
        >
          Add New Employee
        </Button>
      </div>

      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, ID, email, department, position..."
            className="block w-full md:w-2/3 lg:w-1/2 pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-accent/80 focus:border-accent 
                       sm:text-sm placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="table-header">
                Name
              </th>
              <th scope="col" className="table-header">
                Employee ID
              </th>
              <th scope="col" className="table-header">
                Email
              </th>
              <th scope="col" className="table-header">
                Department
              </th>
              <th scope="col" className="table-header">
                Position
              </th>
              <th scope="col" className="table-header">
                Status
              </th>
              <th scope="col" className="table-header text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && paginatedEmployees.length === 0 && !pageError && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  {" "}
                  {/* Updated colspan */}
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    <p className="ml-3">Loading data...</p>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && paginatedEmployees.length === 0 && !pageError && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  {" "}
                  {/* Updated colspan */}
                  No employees found matching your criteria.
                  {searchTerm &&
                    allEmployees.length > 0 &&
                    " Try a different search term."}
                  {!searchTerm &&
                    allEmployees.length === 0 &&
                    " No employees available yet."}
                </td>
              </tr>
            )}
            {paginatedEmployees.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="table-cell">
                  <div className="font-medium text-gray-900">
                    {emp.firstName} {emp.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    Internal ID: {emp.id}
                  </div>
                </td>
                <td className="table-cell">{emp.employeeId || "-"}</td>
                <td className="table-cell">{emp.email || "-"}</td>
                <td className="table-cell">{emp.department || "-"}</td>
                <td className="table-cell">{emp.position || "-"}</td>
                <td className="table-cell">
                  <span
                    className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      emp.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : emp.status === "Terminated"
                        ? "bg-red-100 text-red-800"
                        : emp.status === "On Leave"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {" "}
                    {/* Default for other statuses */}
                    {emp.status}
                  </span>
                </td>
                <td className="table-cell-actions space-x-1">
                  <Link to={`/hr/employees/${emp.id}`} title="View Details">
                    {" "}
                    {/* Placeholder for Detail Page */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-accent p-1.5"
                    >
                      <Eye size={18} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-blue-600 p-1.5"
                    onClick={() => handleOpenModalForEdit(emp)}
                    title="Edit Employee"
                  >
                    <Edit size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-600 p-1.5"
                    onClick={() => handleDelete(emp.id)}
                    title="Delete Employee"
                  >
                    <Trash2 size={18} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
          <div className="mb-2 sm:mb-0">
            Showing{" "}
            <span className="font-semibold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to
            <span className="font-semibold">
              {" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)}
            </span>{" "}
            of
            <span className="font-semibold">
              {" "}
              {filteredEmployees.length}
            </span>{" "}
            employees
          </div>
          <nav aria-label="Pagination">
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-md px-2 py-1.5 md:px-3 md:py-2"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} />
                  <span className="hidden md:inline ml-1">Prev</span>
                </Button>
              </li>
              {getPageNumbers().map((page, index) => (
                <li key={`page-${page === "..." ? `ellipsis-${index}` : page}`}>
                  {page === "..." ? (
                    <span className="px-2 py-1.5 md:px-3 md:py-2 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      className="px-2.5 py-1.5 md:px-3.5 md:py-2"
                      onClick={() => handlePageChange(page)}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </Button>
                  )}
                </li>
              ))}
              <li>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-md px-2 py-1.5 md:px-3 md:py-2"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  aria-label="Next"
                >
                  <span className="hidden md:inline mr-1">Next</span>
                  <ChevronRight size={18} />
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingEmployee
            ? `Edit Employee: ${editingEmployee.firstName} ${editingEmployee.lastName}`
            : "Add New Employee"
        }
        size="3xl" // Larger modal for more fields
      >
        <EmployeeForm
          initialData={
            editingEmployee || {
              status: "Active",
              hireDate: new Date().toISOString().split("T")[0],
            }
          } // Default status & hireDate for new
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmittingForm}
          isEditMode={!!editingEmployee}
        />
      </Modal>
    </div>
  );
};

export default EmployeesPage;
