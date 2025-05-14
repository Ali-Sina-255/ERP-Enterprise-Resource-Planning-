// src/data/mockJournalEntries.js
import { getChartOfAccounts } from "./mockChartOfAccounts"; // To validate/get account names

let accountCache = null;
const initializeCaches = async () => {
  if (!accountCache) {
    const accounts = await getChartOfAccounts();
    accountCache = accounts.reduce((acc, curr) => {
      acc[curr.accountId] = curr.accountName; // Store accountId -> accountName mapping
      return acc;
    }, {});
  }
};
initializeCaches(); // Initialize once

let journalEntries = [
  {
    id: "je001",
    entryNumber: "JE-2023-0001", // System-generated or manual
    entryDate: "2023-11-01",
    description: "Record office rent payment for November.",
    status: "Posted", // Draft, Posted, Voided
    lines: [
      {
        accountId: "6010",
        debit: 1200.0,
        credit: 0,
        description: "November Rent",
      }, // Rent Expense
      {
        accountId: "1011",
        debit: 0,
        credit: 1200.0,
        description: "Paid from Operating Account",
      }, // Cash at Bank
    ],
    totalDebits: 1200.0,
    totalCredits: 1200.0,
    postedDate: "2023-11-01",
    createdBy: "emp004", // User ID
  },
  {
    id: "je002",
    entryNumber: "JE-2023-0002",
    entryDate: "2023-11-05",
    description: "Owner investment into the company.",
    status: "Posted",
    lines: [
      {
        accountId: "1011",
        debit: 5000.0,
        credit: 0,
        description: "Cash received",
      }, // Cash at Bank
      {
        accountId: "3100",
        debit: 0,
        credit: 5000.0,
        description: "Owner capital contribution",
      }, // Owner's Capital
    ],
    totalDebits: 5000.0,
    totalCredits: 5000.0,
    postedDate: "2023-11-05",
    createdBy: "emp001",
  },
  {
    id: "je003",
    entryNumber: "JE-2023-0003",
    entryDate: "2023-11-10",
    description: "Purchase of office supplies on account.",
    status: "Draft",
    lines: [
      {
        accountId: "6200",
        debit: 150.0,
        credit: 0,
        description: "Stationery and supplies",
      }, // Office Supplies Expense
      {
        accountId: "2100",
        debit: 0,
        credit: 150.0,
        description: "Owed to Global Supplies Co.",
      }, // Accounts Payable
    ],
    totalDebits: 150.0,
    totalCredits: 150.0,
    postedDate: null,
    createdBy: "emp002",
  },
];

let nextJEIdCounter = 4;
let nextJENumberCounter = 4;

const simulateApiCall = (data, delay = 200) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay)
  );

// Enrich lines with account names
const enrichJELines = async (lines) => {
  await initializeCaches();
  return lines.map((line) => ({
    ...line,
    accountName: accountCache[line.accountId] || "Unknown Account",
  }));
};

const enrichJE = async (je) => {
  const enrichedLines = await enrichJELines(je.lines);
  return { ...je, lines: enrichedLines };
};

export const getJournalEntries = async () => {
  const enrichedEntries = await Promise.all(
    journalEntries.map((je) => enrichJE(je))
  );
  return simulateApiCall(
    enrichedEntries.sort(
      (a, b) => new Date(b.entryDate) - new Date(a.entryDate)
    )
  ); // Sort by date descending
};

export const getJournalEntryById = async (id) => {
  const je = journalEntries.find((j) => j.id === id);
  return je ? simulateApiCall(await enrichJE(je)) : simulateApiCall(null);
};

// Helper to calculate debits and credits for a JE
export const calculateJEDebitsCredits = (lines = []) => {
  let totalDebits = 0;
  let totalCredits = 0;
  lines.forEach((line) => {
    totalDebits += parseFloat(line.debit) || 0;
    totalCredits += parseFloat(line.credit) || 0;
  });
  return { totalDebits, totalCredits };
};

export const addJournalEntry = async (jeData) => {
  const jeYear = new Date(jeData.entryDate || Date.now()).getFullYear();
  const { lines, ...headerData } = jeData;
  const calculated = calculateJEDebitsCredits(lines);

  if (calculated.totalDebits !== calculated.totalCredits) {
    throw new Error("Debits must equal credits for the journal entry.");
  }
  if (calculated.totalDebits === 0) {
    throw new Error("Journal entry must have non-zero debit/credit amounts.");
  }

  const newJE = {
    ...headerData,
    id: `je${String(nextJEIdCounter++).padStart(3, "0")}`,
    entryNumber: `JE-${jeYear}-${String(nextJENumberCounter++).padStart(
      4,
      "0"
    )}`,
    lines: lines.map((line) => ({
      // Ensure numbers are stored correctly
      accountId: line.accountId,
      debit: parseFloat(line.debit) || 0,
      credit: parseFloat(line.credit) || 0,
      description: line.description || "",
    })),
    totalDebits: calculated.totalDebits,
    totalCredits: calculated.totalCredits,
    status: headerData.status || "Draft", // Default to Draft
    postedDate:
      headerData.status === "Posted"
        ? headerData.postedDate || new Date().toISOString().split("T")[0]
        : null,
  };
  journalEntries.push(newJE);
  return simulateApiCall(await enrichJE(newJE));
};

export const updateJournalEntry = async (id, updatedJEData) => {
  const index = journalEntries.findIndex((j) => j.id === id);
  if (index !== -1) {
    const existingJE = journalEntries[index];
    if (existingJE.status === "Posted" && updatedJEData.status !== "Voided") {
      // Or other specific conditions
      // For now, let's allow editing 'Posted' if not changing critical financial data
      // In a real system, editing posted JEs is heavily restricted or done via reversing entries.
      // For simplicity here, we'll allow it if debits and credits still balance.
    }
    if (existingJE.status === "Voided") {
      throw new Error("Cannot edit a voided journal entry.");
    }

    const { lines, ...headerData } = updatedJEData;
    const calculated = calculateJEDebitsCredits(lines);

    if (calculated.totalDebits !== calculated.totalCredits) {
      throw new Error("Debits must equal credits for the journal entry.");
    }
    if (calculated.totalDebits === 0 && lines.length > 0) {
      // Allow empty lines if user is clearing them before saving as draft
      if (headerData.status === "Posted")
        throw new Error(
          "Posted journal entry must have non-zero debit/credit amounts."
        );
    }

    const finalUpdatedJE = {
      ...existingJE,
      ...headerData,
      lines: lines.map((line) => ({
        accountId: line.accountId,
        debit: parseFloat(line.debit) || 0,
        credit: parseFloat(line.credit) || 0,
        description: line.description || "",
      })),
      totalDebits: calculated.totalDebits,
      totalCredits: calculated.totalCredits,
      postedDate:
        headerData.status === "Posted" && !existingJE.postedDate
          ? headerData.postedDate || new Date().toISOString().split("T")[0]
          : existingJE.postedDate,
    };

    // If status changes to 'Posted' and it wasn't before, set postedDate
    if (finalUpdatedJE.status === "Posted" && existingJE.status !== "Posted") {
      finalUpdatedJE.postedDate = new Date().toISOString().split("T")[0];
    }

    journalEntries[index] = finalUpdatedJE;
    return simulateApiCall(await enrichJE(finalUpdatedJE));
  }
  return simulateApiCall(null);
};

// Voiding a Journal Entry (instead of deleting posted ones)
export const voidJournalEntry = async (id, voidReason = "Entry voided.") => {
  const index = journalEntries.findIndex((j) => j.id === id);
  if (index !== -1) {
    if (journalEntries[index].status === "Voided") {
      throw new Error("Journal entry is already voided.");
    }
    // In a real system, voiding might create a reversing entry.
    // Here, we just mark it as 'Voided'.
    journalEntries[index].status = "Voided";
    journalEntries[
      index
    ].description = `[VOIDED] ${journalEntries[index].description} - Reason: ${voidReason}`;
    return simulateApiCall(await enrichJE(journalEntries[index]));
  }
  return simulateApiCall(null);
};

// Note: Hard deletion of 'Draft' JEs might be permissible
export const deleteDraftJournalEntry = async (id) => {
  const index = journalEntries.findIndex(
    (j) => j.id === id && j.status === "Draft"
  );
  if (index !== -1) {
    journalEntries.splice(index, 1);
    return simulateApiCall({ success: true });
  }
  return simulateApiCall({
    success: false,
    message: "Entry not found or not in draft status.",
  });
};
