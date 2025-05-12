// src/pages/purchasing/EditPurchaseOrderPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PurchaseOrderForm from "../../components/purchasing/PurchaseOrderForm";
import {
  getPurchaseOrderById,
  updatePurchaseOrder as apiUpdatePurchaseOrder,
} from "../../data/mockPurchaseOrders";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toastNotifications";
import Button from "../../components/common/Button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const EditPurchaseOrderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get PO ID from URL
  const [initialPOData, setInitialPOData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    const fetchPOForEditing = async () => {
      if (!id) {
        setPageError("No Purchase Order ID provided for editing.");
        showErrorToast("Invalid PO ID.");
        setIsLoading(false);
        navigate("/purchasing/purchase-orders");
        return;
      }
      setIsLoading(true);
      setPageError(null);
      try {
        const fetchedPO = await getPurchaseOrderById(id);
        if (fetchedPO) {
          setInitialPOData(fetchedPO);
        } else {
          setPageError(`Purchase Order with ID "${id}" not found for editing.`);
          showWarningToast(`PO with ID "${id}" not found.`);
          navigate("/purchasing/purchase-orders"); // Redirect if not found
        }
      } catch (err) {
        console.error("Failed to fetch PO for editing:", err);
        setPageError(
          "Failed to load PO details for editing. Please try again."
        );
        showErrorToast("Error loading PO details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPOForEditing();
  }, [id, navigate]);

  const handleSubmit = async (poData) => {
    setIsSubmitting(true);
    try {
      const updatedPO = await apiUpdatePurchaseOrder(id, poData); // Pass ID and updated data
      showSuccessToast(
        `Purchase Order ${updatedPO.poNumber} updated successfully!`
      );
      navigate(`/purchasing/purchase-orders/${updatedPO.id}`); // Navigate to the detail page
    } catch (error) {
      console.error("Failed to update Purchase Order:", error);
      showErrorToast(
        `Failed to update Purchase Order. ${
          error.message || "Please try again."
        }`
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
          Loading Purchase Order for Editing...
        </p>
      </div>
    );
  }

  if (pageError && !initialPOData) {
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
              onClick={() => navigate("/purchasing/purchase-orders")}
              IconLeft={ArrowLeft}
            >
              Back to PO List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!initialPOData) {
    // This case should ideally be caught by pageError or loading state
    return (
      <div className="container mx-auto p-6 text-center text-gray-500">
        <p className="text-xl mb-4">
          Could not load Purchase Order data for editing.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate("/purchasing/purchase-orders")}
          IconLeft={ArrowLeft}
        >
          Go to PO List
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/purchasing/purchase-orders/${id}`)} // Link back to detail page
          IconLeft={ArrowLeft}
          className="mr-4"
        >
          Back to PO Details
        </Button>
        <h1 className="text-3xl font-semibold text-gray-800">
          Edit Purchase Order:{" "}
          <span className="text-accent">{initialPOData.poNumber}</span>
        </h1>
      </div>
      <PurchaseOrderForm
        initialData={initialPOData} // Pass the fetched PO data
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEditMode={true} // Set isEditMode to true
      />
    </div>
  );
};

export default EditPurchaseOrderPage;
