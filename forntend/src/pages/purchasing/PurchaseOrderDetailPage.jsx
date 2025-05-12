// src/pages/purchasing/PurchaseOrderDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
// Updated import to include receiveItemsForPO
import {
  getPurchaseOrderById,
  receiveItemsForPO,
} from "../../data/mockPurchaseOrders";
import Button from "../../components/common/Button";
import ReceiveItemsModal from "../../components/purchasing/ReceiveItemsModal"; // Import the new modal
import {
  ArrowLeft,
  Edit,
  Printer,
  FileText,
  AlertTriangle,
  ShoppingBag,
  User,
  Calendar,
  Truck,
  DollarSign,
  Hash,
  Tag,
  Info,
  PackagePlus,
} from "lucide-react"; // Added PackagePlus
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../../utils/toastNotifications";

// DetailField component remains the same...
const DetailField = ({ label, value, icon, children, className = "" }) => {
  /* ... */
};

const PurchaseOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isSubmittingReception, setIsSubmittingReception] = useState(false);

  const fetchPODetails = async (poId = id) => {
    // Made poId a parameter to allow refetch
    if (!poId) {
      setError("Purchase Order ID not provided.");
      showErrorToast("Invalid Purchase Order ID.");
      setIsLoading(false);
      navigate("/purchasing/purchase-orders");
      return;
    }
    setIsLoading(true); // Set loading true for refetches too
    setError(null);
    try {
      const fetchedPO = await getPurchaseOrderById(poId);
      if (fetchedPO) {
        setPurchaseOrder(fetchedPO);
      } else {
        setError(`Purchase Order with ID "${poId}" not found.`);
        showErrorToast(`Purchase Order with ID "${poId}" not found.`);
      }
    } catch (err) {
      console.error("Failed to fetch PO details:", err);
      setError("Failed to load Purchase Order details. Please try again.");
      showErrorToast("Error loading Purchase Order details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPODetails();
  }, [id, navigate]); // Initial fetch based on id from URL

  const handleOpenReceiveModal = () => {
    // Check if PO is in a state that allows receiving items
    if (
      purchaseOrder &&
      (purchaseOrder.status === "Ordered" ||
        purchaseOrder.status === "Partially Received" ||
        purchaseOrder.status === "Approved")
    ) {
      setIsReceiveModalOpen(true);
    } else {
      showInfoToast(
        `Cannot receive items for PO in "${
          purchaseOrder?.status || "Unknown"
        }" status.`
      );
    }
  };

  const handleSubmitReception = async (receptionData) => {
    // receptionData includes { poId, itemsReceivedDetails, newPOStatus, receptionDate, receptionNotes }
    setIsSubmittingReception(true);
    try {
      const updatedPO = await receiveItemsForPO(
        receptionData.poId,
        receptionData.itemsReceivedDetails,
        receptionData.newPOStatus
        // Pass receptionDate, receptionNotes to backend if they need to be stored with the GRN or PO history
      );
      if (updatedPO) {
        showSuccessToast("Items received successfully and PO updated!");
        setIsReceiveModalOpen(false);
        // Refetch PO details to show updated status and potentially item received quantities
        // setPurchaseOrder(updatedPO); // Or directly use returned updatedPO
        fetchPODetails(updatedPO.id); // Refetch to get latest, including any backend calculations
      } else {
        throw new Error("PO update after reception failed.");
      }
    } catch (err) {
      console.error("Error submitting reception:", err);
      showErrorToast(`Failed to process reception. ${err.message || ""}`);
    } finally {
      setIsSubmittingReception(false);
    }
  };

  const getStatusColor = (status) => {
    /* ... same as before ... */
  };

  // Loading, Error, and !purchaseOrder states remain the same...
  if (isLoading && !purchaseOrder) {
    /* ... full page loader ... */
  }
  if (error) {
    /* ... error display ... */
  }
  if (!purchaseOrder && !isLoading) {
    /* ... not found/no data display ... */
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 bg-gray-50 min-h-screen">
      {/* Header: Title, Status, Actions */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/purchasing/purchase-orders")}
            IconLeft={ArrowLeft}
            className="mb-2 sm:mb-0"
          >
            Back to PO List
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
            <FileText size={28} className="mr-3 text-accent" />
            Purchase Order: {purchaseOrder?.poNumber}{" "}
            {/* Added optional chaining */}
          </h1>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <span
            className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${getStatusColor(
              purchaseOrder?.status
            )}`}
          >
            Status: {purchaseOrder?.status}
          </span>
          <div className="flex space-x-2 mt-1">
            {(purchaseOrder?.status === "Ordered" ||
              purchaseOrder?.status === "Partially Received" ||
              purchaseOrder?.status === "Approved") && (
              <Button
                variant="positive"
                size="sm"
                IconLeft={PackagePlus}
                onClick={handleOpenReceiveModal}
              >
                Receive Items
              </Button>
            )}
            <Link to={`/purchasing/purchase-orders/${purchaseOrder?.id}/edit`}>
              <Button variant="secondary" size="sm" IconLeft={Edit}>
                Edit PO
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              IconLeft={Printer}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Main PO Details Card - use optional chaining for purchaseOrder properties */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-6 border-b border-gray-200">
          <DetailField
            label="Vendor"
            icon={ShoppingBag}
            value={purchaseOrder?.vendorName || "N/A"}
          />
          <DetailField
            label="Order Date"
            icon={Calendar}
            value={
              purchaseOrder?.orderDate
                ? new Date(purchaseOrder.orderDate).toLocaleDateString()
                : "-"
            }
          />
          <DetailField
            label="Expected Delivery"
            icon={Truck}
            value={
              purchaseOrder?.expectedDeliveryDate
                ? new Date(
                    purchaseOrder.expectedDeliveryDate
                  ).toLocaleDateString()
                : "-"
            }
          />
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Order Items
          </h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              {/* ... table head ... */}
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Product ID
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Ordered Qty
                  </th>
                  {/* Add 'Received Qty' if tracking on PO item level */}
                  {/* <th className="px-4 py-3 text-right font-medium">Received Qty</th> */}
                  <th className="px-4 py-3 text-right font-medium">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Total Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchaseOrder?.items.map((item, index) => (
                  <tr key={item.productId + index}>
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.productName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.productId}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {item.quantity}
                    </td>
                    {/* {<td>{item.quantityReceived || 0}</td>} */}
                    <td className="px-4 py-3 text-right text-gray-700">
                      ${parseFloat(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      ${parseFloat(item.totalPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {(!purchaseOrder || purchaseOrder.items.length === 0) && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No items in this order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes and Summary Section - use optional chaining */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <DetailField label="Notes / Special Instructions" icon={Info}>
              <p className="whitespace-pre-line p-3 bg-gray-50 rounded-md border min-h-[60px]">
                {purchaseOrder?.notes || "No special instructions provided."}
              </p>
            </DetailField>
            <DetailField
              label="Created By (Employee ID)"
              icon={User}
              value={purchaseOrder?.createdBy}
            />
          </div>
          <div className="space-y-2 p-4 bg-gray-100 rounded-lg border">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-800">
                ${(purchaseOrder?.subtotal || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium text-gray-800">
                ${(purchaseOrder?.tax || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping Cost:</span>
              <span className="font-medium text-gray-800">
                ${(purchaseOrder?.shippingCost || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t mt-2">
              <span className="font-bold text-gray-900">Grand Total:</span>
              <span className="font-bold text-accent">
                ${(purchaseOrder?.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {purchaseOrder && ( // Only render modal if PO data is available
        <ReceiveItemsModal
          isOpen={isReceiveModalOpen}
          onClose={() => setIsReceiveModalOpen(false)}
          purchaseOrder={purchaseOrder}
          onSubmitReceive={handleSubmitReception}
          isSubmitting={isSubmittingReception}
        />
      )}
    </div>
  );
};

export default PurchaseOrderDetailPage;
