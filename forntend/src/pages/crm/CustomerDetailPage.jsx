// src/pages/crm/CustomerDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCustomerById } from "../../data/mockCustomers";
import Button from "../../components/common/Button";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  User as UserIcon,
  Tag,
  FileText,
  AlertTriangle,
  Globe,
  Info,
  Calendar,
} from "lucide-react"; // Added missing icons
import { showErrorToast } from "../../utils/toastNotifications";

const DetailField = ({ label, value, icon, children, className = "" }) => {
  const IconComponent = icon;
  return (
    <div className={`flex items-start py-3 sm:py-2 ${className}`}>
      {" "}
      {/* Adjusted padding */}
      {IconComponent && (
        <IconComponent
          size={16}
          className="text-gray-500 mr-3 mt-1 flex-shrink-0"
        />
      )}{" "}
      {/* Adjusted icon size/margin */}
      <div className="flex-grow">
        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm text-gray-900 break-words">
          {children
            ? children
            : value !== null && value !== undefined && value !== ""
            ? String(value)
            : "-"}
        </dd>
      </div>
    </div>
  );
};

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!id) {
        setError("Customer ID not provided in URL.");
        showErrorToast("Invalid Customer ID.");
        setIsLoading(false);
        // navigate('/crm/customers'); // Optionally navigate away
        return;
      }
      console.log(`Fetching customer with ID: ${id}`); // DEBUG LOG
      setIsLoading(true);
      setError(null);
      try {
        const fetchedCustomer = await getCustomerById(id);
        console.log("Fetched customer data:", fetchedCustomer); // DEBUG LOG
        if (fetchedCustomer) {
          setCustomer(fetchedCustomer);
        } else {
          setError(`Customer with ID "${id}" not found.`);
          showErrorToast(`Customer with ID "${id}" not found.`);
        }
      } catch (err) {
        console.error("Failed to fetch customer details:", err);
        setError("Failed to load customer details. Please try again.");
        showErrorToast("Error loading customer details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomerDetails();
  }, [id, navigate]); // id and navigate are dependencies

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent"></div>
        <p className="ml-4 text-xl text-gray-600">
          Loading Customer Details...
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
              <p className="font-bold">Error Loading Customer</p>
              <p>{error}</p>
            </div>
          </div>
          <div className="mt-4 text-right">
            <Button
              variant="secondary"
              onClick={() => navigate("/crm/customers")}
              IconLeft={ArrowLeft}
            >
              Back to Customers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    // This state should ideally be covered by the error state if a customer isn't found
    // or by isLoading state. If it reaches here, something unexpected happened.
    console.log("Customer state is null/undefined after loading and no error."); // DEBUG LOG
    return (
      <div className="container mx-auto p-6 text-center text-gray-500">
        <p className="text-xl mb-4">
          Customer data could not be displayed. The customer may not exist or
          there was an issue loading the data.
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
    customer.companyName ||
    `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
    "N/A Customer";

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/crm/customers")}
            IconLeft={ArrowLeft}
            className="self-start sm:self-center"
          >
            Back to Customers
          </Button>
          <div className="text-center sm:text-left flex-grow">
            {" "}
            {/* Added flex-grow to allow title to take space */}
            <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center sm:justify-start">
              <UserIcon size={30} className="mr-3 text-accent" /> {displayName}
            </h1>
          </div>
          {/* In a real app, edit button might open a modal or navigate to an edit page */}
          <Button
            variant="secondary"
            IconLeft={Edit}
            onClick={() => {
              // Find the CustomersPage and trigger its edit modal
              // This is a bit indirect; a better way might be a dedicated edit page or global modal state.
              // For now, let's just show a toast.
              showErrorToast(
                "Edit Customer: Use edit button on the Customers list page (modal)."
              );
            }}
            className="self-end sm:self-center"
          >
            Edit Customer
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Contact & Company Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg h-full">
            {" "}
            {/* Added h-full */}
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-3">
              Contact & Company
            </h2>
            <dl className="space-y-2">
              {" "}
              {/* Adjusted space-y */}
              {customer.firstName && (
                <DetailField
                  icon={UserIcon}
                  label="Contact Name"
                  value={`${customer.firstName} ${
                    customer.lastName || ""
                  }`.trim()}
                />
              )}
              {customer.companyName && (
                <DetailField
                  icon={Briefcase}
                  label="Company Name"
                  value={customer.companyName}
                />
              )}
              <DetailField icon={Mail} label="Email" value={customer.email} />
              <DetailField icon={Phone} label="Phone" value={customer.phone} />
              <DetailField
                icon={Tag}
                label="Customer Type"
                value={customer.customerType}
              />
              <DetailField icon={UserIcon} label="Status">
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    customer.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : customer.status === "Prospect"
                      ? "bg-blue-100 text-blue-800"
                      : customer.status === "Lead"
                      ? "bg-indigo-100 text-indigo-800"
                      : customer.status === "Inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {customer.status}
                </span>
              </DetailField>
            </dl>
          </div>
        </div>
        {/* Right Column: Address & Other Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-3">
              Address & Other Details
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              {" "}
              {/* Adjusted gap-y here removed */}
              <DetailField
                icon={MapPin}
                label="Street Address"
                value={customer.address}
                className="md:col-span-2"
              />
              <DetailField icon={MapPin} label="City" value={customer.city} />
              <DetailField
                icon={MapPin}
                label="State/Province"
                value={customer.state}
              />
              <DetailField
                icon={MapPin}
                label="ZIP/Postal Code"
                value={customer.zipCode}
              />
              <DetailField
                icon={Globe}
                label="Country"
                value={customer.country}
              />
              <DetailField
                icon={FileText}
                label="Tax ID / VAT"
                value={customer.taxId}
              />
              <DetailField
                icon={Calendar}
                label="Joined Date"
                value={
                  customer.joinedDate
                    ? new Date(customer.joinedDate).toLocaleDateString()
                    : "-"
                }
              />
            </dl>
            <div className="mt-4">
              <DetailField icon={Info} label="Notes">
                <p className="whitespace-pre-line p-3 bg-gray-50 rounded-md border min-h-[60px] text-sm">
                  {customer.notes || "No notes for this customer."}
                </p>
              </DetailField>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-3">
              Related Activities
            </h2>
            <p className="text-gray-600 text-sm">
              (Placeholder) Sections for Sales Orders, Invoices, Payment
              History, and Communication Logs related to this customer would
              appear here.
            </p>
            {/* Example:
                        <ul className="mt-2 space-y-1 text-sm">
                            <li><Link to="#" className="text-accent hover:underline">View Sales Orders (3)</Link></li>
                            <li><Link to="#" className="text-accent hover:underline">View Invoices (2 Paid, 1 Overdue)</Link></li>
                        </ul>
                        */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
