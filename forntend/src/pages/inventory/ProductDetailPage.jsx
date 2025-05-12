// src/pages/vendors/VendorDetailPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getVendorById } from "../../data/mockVendors"; // <<<< CORRECTED IMPORT
import Button from "../../components/common/Button";
import { Edit, ArrowLeft, AlertTriangle } from "lucide-react"; // Added AlertTriangle for errors

const DetailItem = ({ label, value, isCurrency = false, children }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-start">
    {" "}
    {/* Added items-start for long children */}
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
      {children
        ? children
        : isCurrency && typeof value === "number"
        ? `$${value.toFixed(2)}`
        : value !== null && value !== undefined && value !== ""
        ? value
        : "-"}
    </dd>
  </div>
);

const VendorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendor = async () => {
      setIsLoading(true);
      setError(null);
      if (!id) {
        setError("No vendor ID provided.");
        setIsLoading(false);
        // Optionally navigate away if no ID, though route setup should prevent this
        // navigate('/vendors');
        return;
      }
      try {
        const fetchedVendor = await getVendorById(id); // <<<< Ensure this uses the correct function name
        if (fetchedVendor) {
          setVendor(fetchedVendor);
        } else {
          setError(`Vendor with ID "${id}" not found.`);
          // navigate('/vendors'); // Or show a "not found" message on the page
        }
      } catch (err) {
        console.error("Failed to fetch vendor:", err);
        setError("Failed to load vendor details. Please try again.");
        // navigate('/vendors');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendor();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading vendor details...</p>
      </div>
    );
  }

  if (error) {
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
          <span className="block sm:inline">{error}</span>
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
    // Should ideally be caught by the error state if fetch fails or vendor not found
    return (
      <div className="container mx-auto p-4">
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold mr-2">
            <AlertTriangle className="inline-block mr-2" size={20} />
            Notice:
          </strong>
          <span className="block sm:inline">
            Vendor data is not available. This might be a temporary issue.
          </span>
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

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/vendors")}
          IconLeft={ArrowLeft}
        >
          Back to Vendors
        </Button>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 order-first sm:order-none text-center sm:text-left flex-grow sm:flex-grow-0">
          {vendor.name}
        </h1>
        <Link to={`/vendors/${vendor.id}/edit`}>
          <Button variant="primary" IconLeft={Edit}>
            Edit Vendor
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-xl leading-6 font-semibold text-gray-900">
            Vendor Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detailed information about the vendor.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="px-4 py-5 sm:px-6">
              {" "}
              {/* Grouping DetailItems for consistent padding */}
              <DetailItem label="Vendor ID" value={vendor.id} />
              <DetailItem label="Contact Person" value={vendor.contactPerson} />
              <DetailItem label="Email Address" value={vendor.email} />
              <DetailItem label="Phone Number" value={vendor.phone} />
              <DetailItem label="Category" value={vendor.category} />
              <DetailItem label="Status">
                <span
                  className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  vendor.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : vendor.status === "Inactive"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                >
                  {vendor.status}
                </span>
              </DetailItem>
              <DetailItem
                label="Joined Date"
                value={
                  vendor.joinedDate
                    ? new Date(vendor.joinedDate).toLocaleDateString()
                    : "-"
                }
              />
              <DetailItem label="Address">
                <span className="whitespace-pre-line">
                  {vendor.address || "-"}
                </span>
              </DetailItem>
              <DetailItem label="Notes">
                <span className="whitespace-pre-line">
                  {vendor.notes || "-"}
                </span>
              </DetailItem>
            </div>
          </dl>
        </div>
      </div>

      {/* Placeholder for related information like Purchase Orders, Invoices etc. */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Related Activities
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-500">
            Purchase orders, invoices, and communication logs related to this
            vendor would appear here. (This section is a placeholder for future
            development).
          </p>
          {/* Example: List of POs could be a separate component */}
        </div>
      </div>
    </div>
  );
};

export default VendorDetailPage;
