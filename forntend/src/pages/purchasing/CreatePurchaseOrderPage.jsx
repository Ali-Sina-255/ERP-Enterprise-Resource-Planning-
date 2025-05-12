// src/pages/purchasing/CreatePurchaseOrderPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PurchaseOrderForm from "../../components/purchasing/PurchaseOrderForm";
import { addPurchaseOrder as apiAddPurchaseOrder } from "../../data/mockPurchaseOrders";
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toastNotifications";
import Button from "../../components/common/Button";
import { ArrowLeft } from "lucide-react";

const CreatePurchaseOrderPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (poData) => {
    setIsSubmitting(true);
    try {
      const newPO = await apiAddPurchaseOrder(poData);
      showSuccessToast(
        `Purchase Order ${newPO.poNumber} created successfully!`
      );
      navigate("/purchasing/purchase-orders"); // Or to the detail page: `/purchasing/purchase-orders/${newPO.id}`
    } catch (error) {
      console.error("Failed to create Purchase Order:", error);
      showErrorToast(
        `Failed to create Purchase Order. ${
          error.message || "Please try again."
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/purchasing/purchase-orders")}
          IconLeft={ArrowLeft}
          className="mr-4"
        >
          Back to PO List
        </Button>
        <h1 className="text-3xl font-semibold text-gray-800">
          Create New Purchase Order
        </h1>
      </div>
      <PurchaseOrderForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEditMode={false}
      />
    </div>
  );
};

export default CreatePurchaseOrderPage;
