// src/data/mockSalesOrders.js
import { getCustomers } from "./mockCustomers";
import { getProducts } from "./mockProducts";

let customerCache = null;
let productCache = null;

const initializeCaches = async () => {
  if (!customerCache) customerCache = await getCustomers();
  if (!productCache) productCache = await getProducts();
};
initializeCaches();

let salesOrders = [
  {
    id: "so001",
    soNumber: "SO-2023-001",
    customerId: "cust001",
    orderDate: "2023-11-10",
    expectedShipDate: "2023-11-15",
    status: "Pending Fulfillment",
    items: [
      {
        productId: "p001",
        productName: "Standard A4 Paper Ream",
        quantity: 10,
        unitPrice: 4.99,
        discount: 0,
        totalPrice: 49.9,
      },
      {
        productId: "p003",
        productName: "Heavy Duty Stapler",
        quantity: 2,
        unitPrice: 24.95,
        discount: 0.99,
        totalPrice: 2 * 24.95 - 0.99 * 2,
      },
    ],
    subtotal: 10 * 4.99 + (2 * 24.95 - 0.99 * 2),
    discountTotal: 0.99 * 2,
    tax: (10 * 4.99 + (2 * 24.95 - 0.99 * 2)) * 0.07,
    shippingCost: 12.5,
    totalAmount: (10 * 4.99 + (2 * 24.95 - 0.99 * 2)) * 1.07 + 12.5,
    shippingAddress: "1725 Slough Avenue, Scranton, PA",
    billingAddress: "1725 Slough Avenue, Scranton, PA",
    paymentTerms: "Net 30",
    notes: "Customer requested an extra leaflet with the order.",
    salespersonId: "emp003",
  },
  {
    id: "so002",
    soNumber: "SO-2023-002",
    customerId: "cust002",
    orderDate: "2023-11-12",
    expectedShipDate: "2023-11-20",
    status: "Shipped",
    items: [
      {
        productId: "p005",
        productName: "Cardboard Box (Medium)",
        quantity: 50,
        unitPrice: 1.2,
        discount: 0,
        totalPrice: 60.0,
      },
    ],
    subtotal: 60.0,
    discountTotal: 0,
    tax: 60.0 * 0.07,
    shippingCost: 8.0,
    totalAmount: 60.0 * 1.07 + 8.0,
    shippingAddress: "3500 N Liberty Dr, Pawnee, IN",
    billingAddress: "3500 N Liberty Dr, Pawnee, IN",
    paymentTerms: "Due on Receipt",
    notes: "Handle with care for Parks Dept event.",
    salespersonId: "emp003",
  },
];

let nextSOIdCounter = 3;
let nextSONumberCounter = 3;

const simulateApiCall = (data, delay = 350) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay)
  );

const enrichSO = async (so) => {
  await initializeCaches();
  const customer = customerCache.find((c) => c.id === so.customerId);
  const enrichedItems = await Promise.all(
    so.items.map(async (item) => {
      const product = productCache.find((p) => p.id === item.productId);
      return {
        ...item,
        productName: product?.name || "Unknown Product",
        sku: product?.sku || "N/A",
      };
    })
  );
  return {
    ...so,
    customerName: customer
      ? customer.companyName ||
        `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
      : "Unknown Customer",
    items: enrichedItems,
  };
};

export const getSalesOrders = async () => {
  await initializeCaches();
  const enrichedSOs = await Promise.all(salesOrders.map((so) => enrichSO(so)));
  return simulateApiCall(enrichedSOs);
};

export const getSalesOrderById = async (id) => {
  await initializeCaches();
  const so = salesOrders.find((s) => s.id === id);
  return so ? simulateApiCall(await enrichSO(so)) : simulateApiCall(null);
};

const calculateSOTotals = (
  items = [],
  taxRateInput = 0.07,
  shippingInput = 0,
  overallDiscountInput = 0
) => {
  let subtotal = 0;
  let itemLevelDiscountTotal = 0;
  const taxRate = parseFloat(taxRateInput) / 100 || 0.07; // Ensure taxRate is a decimal, default 7%
  const shipping = parseFloat(shippingInput) || 0;
  const overallDiscount = parseFloat(overallDiscountInput) || 0;

  const processedItems = items.map((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    const itemDiscountPerUnit = parseFloat(item.discount) || 0;

    const lineItemTotalDiscount = qty * itemDiscountPerUnit;
    const lineTotalAfterItemDiscount = qty * price - lineItemTotalDiscount;

    subtotal += lineTotalAfterItemDiscount;
    itemLevelDiscountTotal += lineItemTotalDiscount;
    return {
      ...item,
      totalPrice: lineTotalAfterItemDiscount,
      quantity: qty,
      unitPrice: price,
      discount: itemDiscountPerUnit,
    };
  });

  const subtotalAfterOverallDiscount = subtotal - overallDiscount;
  const taxAmount = subtotalAfterOverallDiscount * taxRate;
  const totalAmount = subtotalAfterOverallDiscount + taxAmount + shipping;

  return {
    subtotal: subtotal,
    discountTotal: itemLevelDiscountTotal + overallDiscount,
    tax: taxAmount,
    shippingCost: shipping,
    totalAmount: totalAmount,
    items: processedItems,
  };
};

export const addSalesOrder = async (soData) => {
  await initializeCaches();
  const soYear = new Date().getFullYear();

  const {
    items = [],
    taxPercent,
    shippingCost,
    discountTotal,
    ...headerData
  } = soData;
  const calculated = calculateSOTotals(
    items,
    taxPercent,
    shippingCost,
    discountTotal
  );

  const newSO = {
    ...headerData,
    id: `so${String(nextSOIdCounter++).padStart(3, "0")}`,
    soNumber: `SO-${soYear}-${String(nextSONumberCounter++).padStart(3, "0")}`,
    orderDate: headerData.orderDate || new Date().toISOString().split("T")[0],
    items: calculated.items,
    subtotal: calculated.subtotal,
    discountTotal: calculated.discountTotal,
    tax: calculated.tax,
    shippingCost: calculated.shippingCost,
    totalAmount: calculated.totalAmount,
  };
  salesOrders.push(newSO);
  return simulateApiCall(await enrichSO(newSO));
};

export const updateSalesOrder = async (id, updatedSOData) => {
  await initializeCaches();
  const index = salesOrders.findIndex((s) => s.id === id);
  if (index !== -1) {
    const existingSO = salesOrders[index];
    const {
      items = [],
      taxPercent,
      shippingCost,
      discountTotal,
      ...headerData
    } = updatedSOData;
    const calculated = calculateSOTotals(
      items,
      taxPercent,
      shippingCost,
      discountTotal
    );

    const finalUpdatedSO = {
      ...existingSO,
      ...headerData,
      items: calculated.items,
      subtotal: calculated.subtotal,
      discountTotal: calculated.discountTotal,
      tax: calculated.tax,
      shippingCost: calculated.shippingCost,
      totalAmount: calculated.totalAmount,
    };
    salesOrders[index] = finalUpdatedSO;
    return simulateApiCall(await enrichSO(finalUpdatedSO));
  }
  return simulateApiCall(null);
};

export const deleteSalesOrder = async (id) => {
  const index = salesOrders.findIndex((s) => s.id === id);
  if (index !== -1) {
    salesOrders.splice(index, 1);
    return simulateApiCall({ success: true });
  }
  return simulateApiCall({ success: false });
};
