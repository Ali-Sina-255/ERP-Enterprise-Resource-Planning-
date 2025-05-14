// src/pages/sales/EditSalesOrderPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SalesOrderForm from "../../components/sales/SalesOrderForm";
import {
  getSalesOrderById,
  updateSalesOrder as apiUpdateSO,
} from "../../data/mockSalesOrders";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toastNotifications";
import Button from "../../components/common/Button";
import { ArrowLeft, AlertTriangle, FileText } from "lucide-react";

const EditSalesOrderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialSOData, setInitialSOData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    /* Fetch logic using getSalesOrderById */
    const fetchSO = async () => {
      if (!id) {
        setPageError("No SO ID.");
        showErrorToast("Invalid SO ID.");
        setIsLoading(false);
        navigate("/sales/sales-orders");
        return;
      }
      setIsLoading(true);
      setPageError(null);
      try {
        const fetchedSO = await getSalesOrderById(id);
        if (fetchedSO) setInitialSOData(fetchedSO);
        else {
          setPageError(`SO "${id}" not found.`);
          showWarningToast(`SO "${id}" not found.`);
          navigate("/sales/sales-orders");
        }
      } catch (err) {
        setPageError("Failed to load SO details.");
        showErrorToast("Error loading SO details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSO();
  }, [id, navigate]);

  const handleSubmit = async (soData) => {
    /* Submit logic using apiUpdateSO */
    setIsSubmitting(true);
    try {
      const updatedSO = await apiUpdateSO(id, soData);
      showSuccessToast(`Sales Order ${updatedSO.soNumber} updated!`);
      navigate(`/sales/sales-orders/${updatedSO.id}`);
    } catch (error) {
      showErrorToast(`Failed to update SO. ${error.message || ""}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    /* Loading JSX */
  }
  if (pageError && !initialSOData) {
    /* Error JSX */
  }
  if (!initialSOData && !isLoading) {
    /* Not Found/Empty JSX */ return (
      <div className="p-8 text-center">
        Could not load Sales Order for editing.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/sales/sales-orders/${id}`)}
          IconLeft={ArrowLeft}
          className="mr-4"
        >
          Back to SO Details
        </Button>
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
          <FileText size={28} className="mr-2 text-accent" />
          Edit Sales Order:{" "}
          <span className="text-accent ml-2">{initialSOData?.soNumber}</span>
        </h1>
      </div>
      {initialSOData && ( // Render form only when initial data is loaded
        <SalesOrderForm
          initialData={initialSOData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditMode={true}
        />
      )}
    </div>
  );
};
export default EditSalesOrderPage;
