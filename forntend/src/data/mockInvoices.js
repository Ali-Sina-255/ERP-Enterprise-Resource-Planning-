// src/data/mockInvoices.js
import { getCustomers } from "./mockCustomers";
// We might not need to enrich with product details directly on invoice if items are copied from SO
// or if invoice items are more free-form. For now, let's assume items are descriptive.
// import { getProducts } from './mockProducts';
import { getSalesOrderById } from "./mockSalesOrders"; // To link to SO

let customerCache = null;
let salesOrderCache = {}; // Cache SOs as they are fetched for invoice generation

const initializeCaches = async () => {
  if (!customerCache) customerCache = await getCustomers();
};
initializeCaches();

let invoices = [
  {
    id: "inv001",
    invoiceNumber: "INV-2023-0001",
    customerId: "cust001",
    salesOrderId: "so001", // Optional: Link to the sales order
    issueDate: "2023-11-16",
    dueDate: "2023-12-16", // Typically based on payment terms
    status: "Sent", // Draft, Sent, Partially Paid, Paid, Overdue, Void
    items: [
      // Items are often copied from SO or entered directly
      {
        description: "Standard A4 Paper Ream (from SO-2023-001)",
        quantity: 10,
        unitPrice: 4.99,
        totalPrice: 49.9,
      },
      {
        description: "Heavy Duty Stapler (from SO-2023-001)",
        quantity: 2,
        unitPrice: 23.96,
        totalPrice: 47.92,
      }, // Price after discount
    ],
    subtotal: 49.9 + 47.92,
    discountApplied: 0.99 * 2, // Discount from SO
    taxAmount: (49.9 + 47.92) * 0.07, // Tax from SO or recalculated
    shippingAmount: 12.5, // Shipping from SO
    totalAmount: (49.9 + 47.92) * 1.07 + 12.5,
    amountPaid: 0,
    balanceDue: (49.9 + 47.92) * 1.07 + 12.5,
    paymentTerms: "Net 30",
    notesToCustomer:
      "Thank you for your business! Please remit payment by the due date.",
    internalNotes: "SO-2023-001 fulfilled and shipped.",
  },
  {
    id: "inv002",
    invoiceNumber: "INV-2023-0002",
    customerId: "cust002",
    salesOrderId: "so002",
    issueDate: "2023-11-21",
    dueDate: "2023-11-21", // Due on Receipt
    status: "Paid",
    items: [
      {
        description: "Cardboard Box (Medium) (from SO-2023-002)",
        quantity: 50,
        unitPrice: 1.2,
        totalPrice: 60.0,
      },
    ],
    subtotal: 60.0,
    discountApplied: 0,
    taxAmount: 60.0 * 0.07,
    shippingAmount: 8.0,
    totalAmount: 60.0 * 1.07 + 8.0,
    amountPaid: 60.0 * 1.07 + 8.0,
    balanceDue: 0,
    paymentTerms: "Due on Receipt",
    notesToCustomer: "Payment received with thanks!",
    internalNotes: "Paid in full via CC on 2023-11-21.",
  },
];

let nextInvIdCounter = 3;
let nextInvNumberCounter = 3;

const simulateApiCall = (data, delay = 250) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay)
  );

const enrichInvoice = async (inv) => {
  await initializeCaches();
  const customer = customerCache.find((c) => c.id === inv.customerId);
  // SO details might be fetched on demand if needed for display, or just store SO number
  return {
    ...inv,
    customerName: customer
      ? customer.companyName ||
        `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
      : "Unknown Customer",
  };
};

export const getInvoices = async () => {
  const enrichedInvoices = await Promise.all(
    invoices.map((inv) => enrichInvoice(inv))
  );
  return simulateApiCall(enrichedInvoices);
};

export const getInvoiceById = async (id) => {
  const inv = invoices.find((i) => i.id === id);
  return inv
    ? simulateApiCall(await enrichInvoice(inv))
    : simulateApiCall(null);
};

// Helper for invoice calculations (can be more sophisticated)
export const calculateInvoiceTotals = (
  items = [],
  taxRatePercent = 7,
  shipping = 0,
  overallDiscount = 0
) => {
  let subtotal = 0;
  items.forEach((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    // Invoices usually reflect final prices, so item-level discount is already applied in unitPrice or description
    item.totalPrice = qty * price;
    subtotal += item.totalPrice;
  });

  const subtotalAfterDiscount = subtotal - (parseFloat(overallDiscount) || 0);
  const taxAmount = subtotalAfterDiscount * (parseFloat(taxRatePercent) / 100);
  const totalAmount =
    subtotalAfterDiscount + taxAmount + (parseFloat(shipping) || 0);

  return {
    subtotal: subtotal, // Subtotal of items
    discountApplied: parseFloat(overallDiscount) || 0, // Overall discount on invoice
    taxAmount: taxAmount,
    shippingAmount: parseFloat(shipping) || 0,
    totalAmount: totalAmount,
    items: items.map((item) => ({
      ...item,
      totalPrice:
        (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
    })),
  };
};

export const addInvoice = async (invoiceData) => {
  const invYear = new Date().getFullYear();
  const {
    items = [],
    taxPercent,
    shippingCost,
    discountApplied,
    amountPaid = 0,
    ...headerData
  } = invoiceData;

  const calculated = calculateInvoiceTotals(
    items,
    taxPercent,
    shippingCost,
    discountApplied
  );

  const newInvoice = {
    ...headerData, // customerId, salesOrderId, issueDate, dueDate, status, paymentTerms, notes
    id: `inv${String(nextInvIdCounter++).padStart(3, "0")}`,
    invoiceNumber: `INV-${invYear}-${String(nextInvNumberCounter++).padStart(
      4,
      "0"
    )}`,
    issueDate: headerData.issueDate || new Date().toISOString().split("T")[0],
    items: calculated.items,
    subtotal: calculated.subtotal,
    discountApplied: calculated.discountApplied,
    taxAmount: calculated.taxAmount,
    shippingAmount: calculated.shippingAmount,
    totalAmount: calculated.totalAmount,
    amountPaid: parseFloat(amountPaid) || 0,
    balanceDue: calculated.totalAmount - (parseFloat(amountPaid) || 0),
    // status: 'Draft', // Default status for new invoices
  };
  invoices.push(newInvoice);
  return simulateApiCall(await enrichInvoice(newInvoice));
};

export const updateInvoice = async (id, updatedInvoiceData) => {
  const index = invoices.findIndex((i) => i.id === id);
  if (index !== -1) {
    const existingInv = invoices[index];
    // Prevent editing critical fields if invoice is, e.g., Paid or Sent (in real app)
    // if (existingInv.status === 'Paid' || existingInv.status === 'Void') {
    //    throw new Error("Cannot edit a Paid or Void invoice.");
    // }

    const {
      items = existingInv.items,
      taxPercent,
      shippingCost,
      discountApplied,
      amountPaid,
      ...headerData
    } = updatedInvoiceData;
    const currentAmountPaid =
      amountPaid !== undefined
        ? parseFloat(amountPaid)
        : parseFloat(existingInv.amountPaid);

    const calculated = calculateInvoiceTotals(
      items,
      taxPercent !== undefined
        ? taxPercent
        : (existingInv.taxAmount /
            (existingInv.subtotal - existingInv.discountApplied)) *
            100 || 0,
      shippingCost !== undefined ? shippingCost : existingInv.shippingAmount,
      discountApplied !== undefined
        ? discountApplied
        : existingInv.discountApplied
    );

    const finalUpdatedInv = {
      ...existingInv,
      ...headerData, // Update header fields like dueDate, status, notes
      items: calculated.items,
      subtotal: calculated.subtotal,
      discountApplied: calculated.discountApplied,
      taxAmount: calculated.taxAmount,
      shippingAmount: calculated.shippingAmount,
      totalAmount: calculated.totalAmount,
      amountPaid: currentAmountPaid,
      balanceDue: calculated.totalAmount - currentAmountPaid,
    };
    // Auto-update status based on balanceDue (simplified)
    if (finalUpdatedInv.balanceDue <= 0 && finalUpdatedInv.totalAmount > 0) {
      finalUpdatedInv.status = "Paid";
    } else if (currentAmountPaid > 0 && finalUpdatedInv.balanceDue > 0) {
      finalUpdatedInv.status = "Partially Paid";
    } else if (
      new Date(finalUpdatedInv.dueDate) < new Date() &&
      finalUpdatedInv.status !== "Paid" &&
      finalUpdatedInv.status !== "Void"
    ) {
      finalUpdatedInv.status = "Overdue";
    }

    invoices[index] = finalUpdatedInv;
    return simulateApiCall(await enrichInvoice(finalUpdatedInv));
  }
  return simulateApiCall(null);
};

// Function to record a payment against an invoice
export const recordInvoicePayment = async (
  invoiceId,
  paymentAmount,
  paymentDate,
  paymentMethod = "N/A"
) => {
  const index = invoices.findIndex((i) => i.id === invoiceId);
  if (index !== -1) {
    const inv = invoices[index];
    if (inv.status === "Paid" || inv.status === "Void") {
      throw new Error(
        `Invoice is already ${inv.status.toLowerCase()} and cannot accept further payments.`
      );
    }
    const newAmountPaid =
      (parseFloat(inv.amountPaid) || 0) + (parseFloat(paymentAmount) || 0);
    inv.amountPaid = newAmountPaid;
    inv.balanceDue = inv.totalAmount - newAmountPaid;

    if (inv.balanceDue <= 0) {
      inv.status = "Paid";
    } else {
      inv.status = "Partially Paid";
    }
    // In a real app, you'd store payment history
    inv.internalNotes = `${
      inv.internalNotes || ""
    }\nPayment of $${paymentAmount} recorded on ${paymentDate} via ${paymentMethod}.`.trim();

    invoices[index] = inv;
    return simulateApiCall(await enrichInvoice(inv));
  }
  throw new Error("Invoice not found for payment.");
};

// Function to fetch SO details to pre-fill invoice (conceptual)
export const getSalesOrderForInvoice = async (salesOrderId) => {
  if (!salesOrderId) return null;
  // Cache SO to avoid re-fetching if already fetched by SO module
  if (salesOrderCache[salesOrderId])
    return simulateApiCall(salesOrderCache[salesOrderId]);

  const so = await getSalesOrderById(salesOrderId); // Uses the function from mockSalesOrders
  if (so) {
    salesOrderCache[salesOrderId] = so; // Cache it
    return simulateApiCall(so);
  }
  return simulateApiCall(null);
};

// No hard delete for invoices usually, they are voided.
export const voidInvoice = async (id) => {
  const index = invoices.findIndex((i) => i.id === id);
  if (index !== -1) {
    if (invoices[index].status === "Paid") {
      throw new Error("Cannot void a paid invoice. Consider a credit note.");
    }
    invoices[index].status = "Void";
    invoices[index].balanceDue = 0; // Voided invoice has no balance
    return simulateApiCall(await enrichInvoice(invoices[index]));
  }
  return simulateApiCall(null);
};
