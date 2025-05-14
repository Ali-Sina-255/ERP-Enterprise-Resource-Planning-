// src/data/mockPurchaseOrders.js
import { getVendors } from "./mockVendors";
import { getProducts, updateProductStock } from "./mockProducts"; // Correctly import updateProductStock

let vendorCache = null;
let productCache = null;

const initializeCaches = async () => {
  if (!vendorCache) vendorCache = await getVendors();
  if (!productCache) productCache = await getProducts();
};

initializeCaches(); // Call it to load caches when module is imported

let purchaseOrders = [
  {
    id: "po001",
    poNumber: "PO-2023-0001",
    vendorId: "v001",
    orderDate: "2023-10-01",
    expectedDeliveryDate: "2023-10-15",
    status: "Ordered", // Changed status for testing "Receive Items"
    items: [
      {
        productId: "p001",
        productName: "Standard A4 Paper Ream",
        quantity: 50,
        unitPrice: 2.4,
        totalPrice: 120.0,
        quantityReceived: 0,
      },
      {
        productId: "p003",
        productName: "Heavy Duty Stapler",
        quantity: 10,
        unitPrice: 12.0,
        totalPrice: 120.0,
        quantityReceived: 0,
      },
    ],
    subtotal: 240.0,
    tax: 19.2,
    shippingCost: 15.0,
    totalAmount: 274.2,
    notes: "Urgent order for Q4 supplies.",
    createdBy: "emp004",
  },
  {
    id: "po002",
    poNumber: "PO-2023-0002",
    vendorId: "v002",
    orderDate: "2023-10-05",
    expectedDeliveryDate: "2023-10-25",
    status: "Approved", // Changed status for testing "Receive Items"
    items: [
      {
        productId: "p002",
        productName: "Wireless Optical Mouse",
        quantity: 25,
        unitPrice: 7.8,
        totalPrice: 195.0,
        quantityReceived: 0,
      },
      {
        productId: "p004",
        productName: "1TB NVMe SSD",
        quantity: 5,
        unitPrice: 68.0,
        totalPrice: 340.0,
        quantityReceived: 0,
      },
    ],
    subtotal: 535.0,
    tax: 42.8,
    shippingCost: 20.0,
    totalAmount: 597.8,
    notes: "For new developer workstations.",
    createdBy: "emp001",
  },
  {
    id: "po003",
    poNumber: "PO-2023-0003",
    vendorId: "v005",
    orderDate: "2023-11-01",
    expectedDeliveryDate: "2023-11-10",
    status: "Received",
    items: [
      {
        productId: "p005",
        productName: "Cardboard Box (Medium)",
        quantity: 200,
        unitPrice: 0.45,
        totalPrice: 90.0,
        quantityReceived: 200,
      }, // Assuming fully received
    ],
    subtotal: 90.0,
    tax: 7.2,
    shippingCost: 10.0,
    totalAmount: 107.2,
    notes: "Packaging for new product line.",
    createdBy: "emp002",
  },
];

// Robust way to calculate next IDs
let nextPOIdCounter =
  purchaseOrders.length > 0
    ? Math.max(
        0,
        ...purchaseOrders.map((po) => parseInt(po.id.replace("po", ""), 10))
      ) + 1
    : 1;
let nextPONumberCounter =
  purchaseOrders.length > 0
    ? Math.max(
        0,
        ...purchaseOrders.map((po) => parseInt(po.poNumber.split("-")[2], 10))
      ) + 1
    : 1;

const simulateApiCall = (data, delay = 450) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(data)));
    }, delay);
  });
};

const enrichPO = async (po) => {
  if (!po) return null;
  await initializeCaches();
  const vendor = vendorCache.find((v) => v.id === po.vendorId);
  const enrichedItems = await Promise.all(
    po.items.map(async (item) => {
      const product = productCache.find((p) => p.id === item.productId);
      return {
        ...item,
        productName: product ? product.name : "Unknown Product",
        sku: product ? product.sku : "N/A",
        quantityOrdered: parseFloat(item.quantity) || 0, // Original ordered quantity
        quantityReceived: parseFloat(item.quantityReceived) || 0, // Ensure this exists and is a number
      };
    })
  );
  return {
    ...po,
    vendorName: vendor ? vendor.name : "Unknown Vendor",
    items: enrichedItems,
  };
};

export const getPurchaseOrders = async () => {
  await initializeCaches();
  const enrichedPOs = await Promise.all(
    purchaseOrders.map((po) => enrichPO(po))
  );
  return simulateApiCall(enrichedPOs);
};

export const getPurchaseOrderById = async (id) => {
  await initializeCaches();
  const po = purchaseOrders.find((p) => p.id === id);
  if (po) {
    const enrichedPO = await enrichPO(po);
    return simulateApiCall(enrichedPO);
  }
  return simulateApiCall(null);
};

export const addPurchaseOrder = async (poData) => {
  await initializeCaches();
  const poYear = new Date().getFullYear();
  const newPO = {
    ...poData,
    id: `po${String(nextPOIdCounter++).padStart(3, "0")}`,
    poNumber: `PO-${poYear}-${String(nextPONumberCounter++).padStart(4, "0")}`,
    orderDate: poData.orderDate || new Date().toISOString().split("T")[0],
    status: poData.status || "Pending Approval",
    items: poData.items.map((item) => ({
      ...item,
      quantity: parseFloat(item.quantity) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0,
      quantityReceived: 0,// Initialize quantityReceived for all new PO items
    })),
  };

  let subtotal = 0;
  newPO.items.forEach((item) => {
    const product = productCache.find((p) => p.id === item.productId);
    item.productName = product ? product.name : "Unknown Product";
    item.sku = product ? product.sku : "N/A";
    item.totalPrice = item.quantity * item.unitPrice;
    subtotal += item.totalPrice;
  });
  newPO.subtotal = parseFloat(subtotal.toFixed(2));
  newPO.tax = parseFloat(
    (poData.tax !== undefined ? poData.tax : subtotal * 0.08).toFixed(2)
  );
  newPO.shippingCost = parseFloat(
    (poData.shippingCost !== undefined ? poData.shippingCost : 10.0).toFixed(2)
  );
  newPO.totalAmount = parseFloat(
    (newPO.subtotal + newPO.tax + newPO.shippingCost).toFixed(2)
  );

  purchaseOrders.push(newPO);
  const enrichedPO = await enrichPO(newPO);
  return simulateApiCall(enrichedPO);
};

export const updatePurchaseOrder = async (id, updatedPOData) => {
  await initializeCaches();
  const index = purchaseOrders.findIndex((p) => p.id === id);
  if (index !== -1) {
    const currentPO = purchaseOrders[index];
    const updatedPO = {
      ...currentPO,
      ...updatedPOData,
      id: currentPO.id,
      poNumber: currentPO.poNumber,
      items: updatedPOData.items
        ? updatedPOData.items.map((newItem) => {
            const existingItem = currentPO.items.find(
              (oldItem) => oldItem.productId === newItem.productId
            );
            return {
              ...newItem,
              quantity: parseFloat(newItem.quantity) || 0,
              unitPrice: parseFloat(newItem.unitPrice) || 0,
              quantityReceived: existingItem
                ? parseFloat(existingItem.quantityReceived) || 0
                : parseFloat(newItem.quantityReceived) || 0,
            };
          })
        : currentPO.items,
    };

    let subtotal = 0;
    updatedPO.items.forEach((item) => {
      const product = productCache.find((p) => p.id === item.productId);
      item.productName = product ? product.name : "Unknown Product";
      item.sku = product ? product.sku : "N/A";
      item.totalPrice = item.quantity * item.unitPrice;
      subtotal += item.totalPrice;
    });
    updatedPO.subtotal = parseFloat(subtotal.toFixed(2));
    updatedPO.tax = parseFloat(
      (updatedPOData.tax !== undefined
        ? updatedPOData.tax
        : subtotal * 0.08
      ).toFixed(2)
    );
    updatedPO.shippingCost = parseFloat(
      (updatedPOData.shippingCost !== undefined
        ? updatedPOData.shippingCost
        : 10.0
      ).toFixed(2)
    );
    updatedPO.totalAmount = parseFloat(
      (updatedPO.subtotal + updatedPO.tax + updatedPO.shippingCost).toFixed(2)
    );

    purchaseOrders[index] = updatedPO;
    const enrichedPO = await enrichPO(updatedPO);
    return simulateApiCall(enrichedPO);
  }
  return simulateApiCall(null);
};

export const deletePurchaseOrder = async (id) => {
  const index = purchaseOrders.findIndex((p) => p.id === id);
  if (index !== -1) {
    purchaseOrders.splice(index, 1);
    return simulateApiCall({ success: true });
  }
  return simulateApiCall({ success: false });
};

// --- THIS IS THE FUNCTION THAT WAS MISSING/MISNAMED ---
/**
 * Simulates receiving items for a Purchase Order.
 * Updates PO item quantities received, PO status, and product stock.
 * @param {string} poId - The ID of the Purchase Order.
 * @param {Array<{productId: string, quantityActuallyReceived: number}>} itemsReceivedDetails - Array of items and quantities received.
 * @param {string} newPOStatus - The new status for the PO after reception (e.g., 'Partially Received', 'Received').
 * @param {string} receptionDate - Date of reception. (Optional, for logging)
 * @param {string} receptionNotes - Notes for this reception. (Optional, for logging)
 * @returns {Promise<Object|null>} The updated Purchase Order object or null if not found/error.
 */
export const receiveItemsForPO = async (
  poId,
  itemsReceivedDetails,
  newPOStatus,
  receptionDate,
  receptionNotes
) => {
  await initializeCaches();

  const poIndex = purchaseOrders.findIndex((po) => po.id === poId);
  if (poIndex === -1) {
    console.error(`PO with ID ${poId} not found for receiving items.`);
    throw new Error(`PO with ID ${poId} not found.`); // Throw error to be caught by caller
  }

  const poToUpdate = JSON.parse(JSON.stringify(purchaseOrders[poIndex]));

  let allItemsNowFullyReceived = true;

  for (const receivedItem of itemsReceivedDetails) {
    const itemIndexOnPO = poToUpdate.items.findIndex(
      (item) => item.productId === receivedItem.productId
    );
    if (itemIndexOnPO !== -1) {
      const poItem = poToUpdate.items[itemIndexOnPO];
      const qtyActuallyReceived =
        parseFloat(receivedItem.quantityActuallyReceived) || 0;

      if (qtyActuallyReceived < 0) {
        console.error(
          `Cannot receive a negative quantity for product ${receivedItem.productId}.`
        );
        continue; // Skip this item or throw error
      }

      if (qtyActuallyReceived > 0) {
        poItem.quantityReceived =
          (parseFloat(poItem.quantityReceived) || 0) + qtyActuallyReceived;

        try {
          const updatedProduct = await updateProductStock(
            receivedItem.productId,
            qtyActuallyReceived
          );
          if (!updatedProduct) {
            console.warn(
              `Stock for product ${receivedItem.productId} could not be updated (product not found in inventory). Reception for this item might be inconsistent.`
            );
          }
        } catch (error) {
          console.error(
            `Failed to update stock for product ${receivedItem.productId}:`,
            error
          );
        }
      }

      if (
        (parseFloat(poItem.quantityReceived) || 0) <
        (parseFloat(poItem.quantity) || 0)
      ) {
        allItemsNowFullyReceived = false;
      }
    } else {
      console.warn(
        `Product ID ${receivedItem.productId} (received) not found in original PO ${poId} items.`
      );
    }
  }

  if (newPOStatus) {
    poToUpdate.status = newPOStatus;
  } else {
    poToUpdate.status = allItemsNowFullyReceived
      ? "Received"
      : "Partially Received";
  }

  

  purchaseOrders[poIndex] = poToUpdate; 
  const enrichedPO = await enrichPO(poToUpdate);
  return simulateApiCall(enrichedPO);
};
