// src/components/purchasing/ReceiveItemsModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "../common/Modal"; // Your existing Modal component
import Input from "../common/Input";
import Button from "../common/Button";
import { PackagePlus, Save, XCircle, CalendarDays, Info } from "lucide-react";
import { showWarningToast } from "../../utils/toastNotifications";




const ReceiveItemsModal = ({
  isOpen,
  onClose,
  purchaseOrder,
  onSubmitReceive,
  isSubmitting,
}) => {
  const [itemsToReceive, setItemsToReceive] = useState([]);
  const [receptionDate, setReceptionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [receptionNotes, setReceptionNotes] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && purchaseOrder && purchaseOrder.items) {
      const initialItems = purchaseOrder.items.map((item) => {
        const ordered = parseFloat(item.quantityOrdered || item.quantity) || 0; // Use quantityOrdered if available
        const received = parseFloat(item.quantityReceived) || 0;
        const remainingToReceive = Math.max(0, ordered - received);
        return {
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantityOrdered: ordered,
          quantityAlreadyReceived: received,
          quantityToReceiveThisTime: "", 
          maxReceivable: remainingToReceive, 
        };
      });
      setItemsToReceive(initialItems);
      setReceptionDate(new Date().toISOString().split("T")[0]); 
      setReceptionNotes("");
      setErrors({}); // 
    }
  }, [isOpen, purchaseOrder]);
 
  const handleQuantityChange = (index, value) => {
    const newItems = [...itemsToReceive];
    const item = newItems[index];
    let qty = value === "" ? "" : parseFloat(value);
    
    
    if (qty !== "" && isNaN(qty)) {
      qty = item.quantityToReceiveThisTime; // Revert if invalid number
    } else if (qty !== "" && qty < 0) {
      qty = 0; 
    } else if (qty !== "" && qty > item.maxReceivable) {
      qty = item.maxReceivable;            
      showWarningToast(
        `Cannot receive more than ${item.maxReceivable} for ${item.productName}.`
      );
    }


    item.quantityToReceiveThisTime = qty;
    setItemsToReceive(newItems);

    if (errors[`item_${index}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`item_${index}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let atLeastOneItemReceived = false;
    let totalQuantityReceivedThisTime = 0;

    itemsToReceive.forEach((item, index) => {
      const qtyToReceive = parseFloat(item.quantityToReceiveThisTime);
      if (
        item.quantityToReceiveThisTime !== "" &&
        (isNaN(qtyToReceive) || qtyToReceive < 0)
      ) {
        newErrors[`item_${index}`] = "Invalid quantity.";
      } else if (qtyToReceive > item.maxReceivable) {
        newErrors[`item_${index}`] = `Max receivable: ${item.maxReceivable}.`;
      }
      if (qtyToReceive > 0) {
        atLeastOneItemReceived = true;
        totalQuantityReceivedThisTime += qtyToReceive;
      }
    });

    if (
      !atLeastOneItemReceived &&
      itemsToReceive.some((item) => item.maxReceivable > 0)
    ) {
      newErrors.general =
        "Please enter a quantity for at least one item to receive.";
    }
    if (!receptionDate) {
      newErrors.receptionDate = "Reception date is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const itemsReceivedDetails = itemsToReceive
      .filter((item) => parseFloat(item.quantityToReceiveThisTime) > 0)
      .map((item) => ({
        productId: item.productId,
        quantityActuallyReceived: parseFloat(item.quantityToReceiveThisTime),
      }));

    if (
      itemsReceivedDetails.length === 0 &&
      itemsToReceive.some((item) => item.maxReceivable > 0)
    ) {
      showWarningToast("No quantities entered for reception.");
      return;
    }

    let allItemsFullyReceivedOnPO = true;
    itemsToReceive.forEach((item) => {
      const totalReceivedForThisItem =
        item.quantityAlreadyReceived +
        (parseFloat(item.quantityToReceiveThisTime) || 0);
      if (totalReceivedForThisItem < item.quantityOrdered) {
        allItemsFullyReceivedOnPO = false;
      }
    });
    const newPOStatus = allItemsFullyReceivedOnPO
      ? "Received"
      : "Partially Received";

    onSubmitReceive({
      poId: purchaseOrder.id,
      itemsReceivedDetails,
      newPOStatus, 
      receptionDate,
      receptionNotes,
    });
  };

  if (!purchaseOrder) return null; 

  const itemsReceivable = itemsToReceive.filter(
    (item) => item.maxReceivable > 0
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Receive Items for PO: ${purchaseOrder.poNumber}`}
      size="3xl" 
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <Input
            label="Reception Date"
            type="date"
            id="receptionDate"
            name="receptionDate"
            value={receptionDate}
            onChange={(e) => setReceptionDate(e.target.value)}
            error={errors.receptionDate}
            disabled={isSubmitting}
            IconLeft={CalendarDays}
            required
          />
          <div className="md:col-span-2">
            <label
              htmlFor="receptionNotes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reception Notes (Optional)
            </label>
            <textarea
              id="receptionNotes"
              name="receptionNotes"
              rows="2"
              value={receptionNotes}
              onChange={(e) => setReceptionNotes(e.target.value)}
              disabled={isSubmitting}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm disabled:bg-gray-100"
              placeholder="e.g., Pallet #123, driver John Smith"
            ></textarea>
          </div>
        </div>

        <h3 className="text-md font-semibold text-gray-700 border-b pb-2">
          Items to Receive
        </h3>
        {itemsReceivable.length > 0 ? (
          <div className="overflow-x-auto max-h-[40vh] -mx-2 sm:mx-0 pr-1">
            {" "}
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                {" "}
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    Product (SKU)
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">
                    Ordered
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">
                    Received
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">
                    Remaining
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600 w-32">
                    Receive Now *
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {itemsToReceive.map((item, index) => {
                  if (
                    item.maxReceivable <= 0 &&
                    item.quantityToReceiveThisTime === ""
                  )
                    return null; 

                  return (
                    <tr
                      key={item.productId}
                      className={`${
                        errors[`item_${index}`] ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-800">
                          {item.productName}
                        </div>
                        <div className="text-xs text-gray-500">
                          SKU: {item.sku || "N/A"}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.quantityOrdered}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.quantityAlreadyReceived}
                      </td>
                      <td className="px-3 py-2 text-center font-medium text-blue-600">
                        {item.maxReceivable}
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          id={`receive_qty_${item.productId}`}
                          value={item.quantityToReceiveThisTime}
                          onChange={(e) =>
                            handleQuantityChange(index, e.target.value)
                          }
                          min="0"
                          max={item.maxReceivable} // HTML5 max
                          className={`w-full text-sm py-1.5 text-center ${
                            errors[`item_${index}`]
                              ? "border-red-500 ring-1 ring-red-500"
                              : "border-gray-300"
                          }`}
                          disabled={isSubmitting || item.maxReceivable === 0}
                          placeholder="0"
                        />
                        {errors[`item_${index}`] && (
                          <p className="mt-1 text-xs text-red-600 text-center">
                            {errors[`item_${index}`]}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            All items for this PO have been fully received.
          </p>
        )}
        {errors.general && (
          <p className="mt-2 text-sm text-red-600 text-center">
            {errors.general}
          </p>
        )}

        <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-5 border-t mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            IconLeft={XCircle}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="positive" 
            IconLeft={PackagePlus}
            disabled={
              isSubmitting ||
              (itemsReceivable.length === 0 &&
                itemsToReceive.every((item) => item.maxReceivable === 0))
            } 
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Processing..." : "Confirm Reception"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReceiveItemsModal;
