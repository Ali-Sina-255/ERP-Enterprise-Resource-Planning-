// src/pages/sales/CreateSalesOrderPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SalesOrderForm from "../../components/sales/SalesOrderForm";
import { addSalesOrder as apiAddSalesOrder } from "../../data/mockSalesOrders";
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toastNotifications";
import Button from "../../components/common/Button";
import { ArrowLeft } from "lucide-react";

const CreateSalesOrderPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (soData) => {
    setIsSubmitting(true);
    try {
      const newSO = await apiAddSalesOrder(soData);
      showSuccessToast(`Sales Order ${newSO.soNumber} created successfully!`);
      navigate(`/sales/sales-orders/${newSO.id}`); // Navigate to detail page
    } catch (error) {
      console.error("Failed to create Sales Order:", error);
      showErrorToast(
        `Failed to create Sales Order. ${error.message || "Please try again."}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/sales/sales-orders")}
          IconLeft={ArrowLeft}
          className="mr-4"
        >
          Back to SO List
        </Button>
        <h1 className="text-3xl font-semibold text-gray-800">
          Create New Sales Order
        </h1>
      </div>
      <SalesOrderForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEditMode={false}
      />
    </div>
  );
};

export default CreateSalesOrderPage;
