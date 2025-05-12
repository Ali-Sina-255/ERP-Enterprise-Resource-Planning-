import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VendorForm from "../../components/vendors/VendorForm";
import {
  getVendorById,
  updateVendor as apiUpdateVendor,
} from "../../data/mockVendors";
import Button from "../../components/common/Button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toastNotifications"; // Import toast helpers

const EditVendorPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState(null); // For page-level errors (fetch errors)

  useEffect(() => {
    const fetchVendor = async () => {
      setIsLoading(true);
      setPageError(null);
      if (!id) {
        setPageError("No vendor ID provided for editing.");
        showErrorToast("Invalid vendor ID provided."); // Toast for immediate feedback
        setIsLoading(false);
        navigate("/vendors"); // Redirect if no ID
        return;
      }
      try {
        const fetchedVendor = await getVendorById(id);
        if (fetchedVendor) {
          setVendor(fetchedVendor);
        } else {
          setPageError(`Vendor with ID "${id}" not found for editing.`);
          showWarningToast(`Vendor with ID "${id}" not found.`); // Toast
          navigate("/vendors"); // Redirect if not found
        }
      } catch (err) {
        console.error("Failed to fetch vendor for editing:", err);
        setPageError(
          "Failed to load vendor details for editing. Please try again."
        );
        showErrorToast("Error loading vendor details."); // Toast
        // navigate('/vendors'); // Optionally redirect on fetch error
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendor();
  }, [id, navigate]);

  const handleSubmit = async (vendorData) => {
    setIsSubmitting(true);
    // Clear previous submission errors, pageError is for fetch errors
    // If you want to show submission errors on page too, add another state like `formError`
    try {
      await apiUpdateVendor(id, vendorData);
      showSuccessToast("Vendor updated successfully!"); // Use toast
      navigate(`/vendors/${id}`);
    } catch (err) {
      console.error("Failed to update vendor:", err);
      showErrorToast(
        "Failed to update vendor. Please check the details and try again."
      ); // Use toast
      // setFormError('Failed to update vendor...'); // If you want to show on page
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
        <p className="ml-4 text-lg text-gray-600">
          Loading vendor for editing...
        </p>
      </div>
    );
  }

  if (pageError && !vendor) {
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
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => navigate("/vendors")}
              IconLeft={ArrowLeft}
            >
              Back to Vendors List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    // This case should ideally be handled by the pageError state after fetch or redirection
    return (
      <div className="container mx-auto p-4 text-center text-gray-600">
        <p>
          Could not load vendor information for editing. The vendor may no
          longer exist or the ID is invalid.
        </p>
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate("/vendors")}
            IconLeft={ArrowLeft}
          >
            Back to Vendors List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() =>
            navigate(vendor ? `/vendors/${vendor.id}` : "/vendors")
          }
          IconLeft={ArrowLeft}
          className="mr-4"
        >
          Back to Details
        </Button>
        <h1 className="text-3xl font-semibold text-gray-800">
          Edit Vendor: <span className="text-accent">{vendor.name}</span>
        </h1>
      </div>

      {/* If you want to show form-specific submission errors directly above the form:
      {formError && ( 
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <p className="font-bold">Update Error</p>
            <p>{formError}</p>
        </div>
      )}
      */}

      <VendorForm
        initialData={vendor}
        onSubmit={handleSubmit}
        isEditMode={true}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
export default EditVendorPage;
