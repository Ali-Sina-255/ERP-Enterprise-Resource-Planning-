// src/pages/vendors/AddVendorPage.jsx
import React, { useState, useMemo } from "react"; // Added useMemo
import { useNavigate } from "react-router-dom";
import VendorForm from "../../components/vendors/VendorForm";
import { addVendor as apiAddVendor } from "../../data/mockVendors";
import {
  showSuccessToast,
  showErrorToast,
} from "../../utils/toastNotifications";

const AddVendorPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize an empty object for initialData when adding a new vendor
  const newVendorInitialData = useMemo(() => ({}), []);

  const handleSubmit = async (vendorData) => {
    setIsSubmitting(true);
    try {
      await apiAddVendor(vendorData);
      showSuccessToast("Vendor added successfully!");
      navigate("/vendors");
    } catch (error) {
      console.error("Failed to add vendor:", error);
      showErrorToast("Failed to add vendor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Add New Vendor</h1>
      </div>
      <VendorForm
        initialData={newVendorInitialData} // Pass the memoized empty object
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEditMode={false}
      />
    </div>
  );
};

export default AddVendorPage;
