// src/pages/crm/EditCustomerPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomerForm from "../../components/crm/CustomerForm"; // Re-use the form
import {
  getCustomerById,
  updateCustomer as apiUpdateCustomer,
} from "../../data/mockCustomers";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toastNotifications";
import Button from "../../components/common/Button";
import { ArrowLeft, AlertTriangle, User as UserIcon } from "lucide-react";

const EditCustomerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get Customer ID from URL
  const [initialCustomerData, setInitialCustomerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    const fetchCustomerForEditing = async () => {
      if (!id) {
        setPageError("No Customer ID provided for editing.");
        showErrorToast("Invalid Customer ID.");
        setIsLoading(false);
        navigate("/crm/customers");
        return;
      }
      setIsLoading(true);
      setPageError(null);
      try {
        const fetchedCustomer = await getCustomerById(id);
        if (fetchedCustomer) {
          setInitialCustomerData(fetchedCustomer);
        } else {
          setPageError(`Customer with ID "${id}" not found for editing.`);
          showWarningToast(`Customer with ID "${id}" not found.`);
          navigate("/crm/customers"); // Redirect if not found
        }
      } catch (err) {
        console.error("Failed to fetch customer for editing:", err);
        setPageError(
          "Failed to load customer details for editing. Please try again."
        );
        showErrorToast("Error loading customer details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomerForEditing();
  }, [id, navigate]);

  const handleSubmit = async (customerData) => {
    setIsSubmitting(true);
    try {
      const updatedCustomer = await apiUpdateCustomer(id, customerData); // Pass ID and updated data
      showSuccessToast(
        `Customer "${updatedCustomer.firstName || ""} ${
          updatedCustomer.lastName || ""
        }${updatedCustomer.companyName || ""}" updated successfully!`
      );
      navigate(`/crm/customers/${updatedCustomer.id}`); // Navigate to the detail page
    } catch (error) {
      console.error("Failed to update customer:", error);
      showErrorToast(
        `Failed to update customer. ${error.message || "Please try again."}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent"></div>
        <p className="ml-4 text-xl text-gray-600">
          Loading Customer for Editing...
        </p>
      </div>
    );
  }

  if (pageError && !initialCustomerData) {
    return (
      <div className="container mx-auto p-6">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md"
          role="alert"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="font-bold">Error</p>
              <p>{pageError}</p>
            </div>
          </div>
          <div className="mt-4 text-right">
            <Button
              variant="secondary"
              onClick={() => navigate("/crm/customers")}
              IconLeft={ArrowLeft}
            >
              Back to Customers List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!initialCustomerData) {
    return (
      <div className="container mx-auto p-6 text-center text-gray-500">
        <p className="text-xl mb-4">
          Could not load customer data for editing.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate("/crm/customers")}
          IconLeft={ArrowLeft}
        >
          Go to Customers List
        </Button>
      </div>
    );
  }

  const displayName =
    initialCustomerData.companyName ||
    `${initialCustomerData.firstName || ""} ${
      initialCustomerData.lastName || ""
    }`.trim();

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/crm/customers/${id}`)} // Link back to detail page
          IconLeft={ArrowLeft}
        >
          Back to Customer Details
        </Button>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 text-center sm:text-left flex-grow">
          Edit Customer: <span className="text-accent">{displayName}</span>
        </h1>
      </div>
      <CustomerForm
        initialData={initialCustomerData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEditMode={true}
      />
    </div>
  );
};

export default EditCustomerPage;
