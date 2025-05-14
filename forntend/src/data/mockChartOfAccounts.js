// src/data/mockChartOfAccounts.js
export const ACCOUNT_TYPES = {
  ASSET: "Asset",
  LIABILITY: "Liability",
  EQUITY: "Equity",
  REVENUE: "Revenue",
  EXPENSE: "Expense",
  COST_OF_GOODS_SOLD: "Cost of Goods Sold",
};

export const NORMAL_BALANCE = {
  DEBIT: "Debit",
  CREDIT: "Credit",
};

// Function to derive normal balance (simplified)
const getNormalBalance = (type) => {
  switch (type) {
    case ACCOUNT_TYPES.ASSET:
    case ACCOUNT_TYPES.EXPENSE:
    case ACCOUNT_TYPES.COST_OF_GOODS_SOLD:
      return NORMAL_BALANCE.DEBIT;
    case ACCOUNT_TYPES.LIABILITY:
    case ACCOUNT_TYPES.EQUITY:
    case ACCOUNT_TYPES.REVENUE:
      return NORMAL_BALANCE.CREDIT;
    default:
      return "";
  }
};

let chartOfAccounts = [
  // Assets (1000-1999)
  {
    id: "acc001",
    accountId: "1000",
    accountName: "Assets",
    accountType: ACCOUNT_TYPES.ASSET,
    parentAccountId: null,
    description: "Main asset category",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.ASSET),
    isCategory: true,
  },
  {
    id: "acc002",
    accountId: "1010",
    accountName: "Cash and Bank",
    accountType: ACCOUNT_TYPES.ASSET,
    parentAccountId: "1000",
    description: "Liquid funds",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.ASSET),
    isCategory: true,
  },
  {
    id: "acc003",
    accountId: "1011",
    accountName: "Operating Bank Account",
    accountType: ACCOUNT_TYPES.ASSET,
    parentAccountId: "1010",
    description: "Main checking account",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.ASSET),
  },
  {
    id: "acc004",
    accountId: "1012",
    accountName: "Petty Cash",
    accountType: ACCOUNT_TYPES.ASSET,
    parentAccountId: "1010",
    description: "Small cash on hand",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.ASSET),
  },
  {
    id: "acc005",
    accountId: "1200",
    accountName: "Accounts Receivable",
    accountType: ACCOUNT_TYPES.ASSET,
    parentAccountId: "1000",
    description: "Money owed by customers",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.ASSET),
  },
  {
    id: "acc006",
    accountId: "1400",
    accountName: "Inventory Asset",
    accountType: ACCOUNT_TYPES.ASSET,
    parentAccountId: "1000",
    description: "Value of goods in stock",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.ASSET),
  },
  {
    id: "acc007",
    accountId: "1500",
    accountName: "Fixed Assets",
    accountType: ACCOUNT_TYPES.ASSET,
    parentAccountId: "1000",
    description: "Long-term assets",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.ASSET),
    isCategory: true,
  },
  {
    id: "acc008",
    accountId: "1510",
    accountName: "Equipment",
    accountType: ACCOUNT_TYPES.ASSET,
    parentAccountId: "1500",
    description: "Office and other equipment",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.ASSET),
  },

  // Liabilities (2000-2999)
  {
    id: "acc009",
    accountId: "2000",
    accountName: "Liabilities",
    accountType: ACCOUNT_TYPES.LIABILITY,
    parentAccountId: null,
    description: "Main liability category",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.LIABILITY),
    isCategory: true,
  },
  {
    id: "acc010",
    accountId: "2100",
    accountName: "Accounts Payable",
    accountType: ACCOUNT_TYPES.LIABILITY,
    parentAccountId: "2000",
    description: "Money owed to suppliers",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.LIABILITY),
  },
  {
    id: "acc011",
    accountId: "2200",
    accountName: "Credit Card Payable",
    accountType: ACCOUNT_TYPES.LIABILITY,
    parentAccountId: "2000",
    description: "Outstanding credit card balances",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.LIABILITY),
  },
  {
    id: "acc012",
    accountId: "2500",
    accountName: "Sales Tax Payable",
    accountType: ACCOUNT_TYPES.LIABILITY,
    parentAccountId: "2000",
    description: "Sales tax collected, owed to government",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.LIABILITY),
  },

  // Equity (3000-3999)
  {
    id: "acc013",
    accountId: "3000",
    accountName: "Equity",
    accountType: ACCOUNT_TYPES.EQUITY,
    parentAccountId: null,
    description: "Main equity category",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.EQUITY),
    isCategory: true,
  },
  {
    id: "acc014",
    accountId: "3100",
    accountName: "Owner's Capital",
    accountType: ACCOUNT_TYPES.EQUITY,
    parentAccountId: "3000",
    description: "Capital contributions",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.EQUITY),
  },
  {
    id: "acc015",
    accountId: "3200",
    accountName: "Retained Earnings",
    accountType: ACCOUNT_TYPES.EQUITY,
    parentAccountId: "3000",
    description: "Accumulated profits/losses",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.EQUITY),
  },

  // Revenue (4000-4999)
  {
    id: "acc016",
    accountId: "4000",
    accountName: "Revenue",
    accountType: ACCOUNT_TYPES.REVENUE,
    parentAccountId: null,
    description: "Main revenue category",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.REVENUE),
    isCategory: true,
  },
  {
    id: "acc017",
    accountId: "4010",
    accountName: "Product Sales",
    accountType: ACCOUNT_TYPES.REVENUE,
    parentAccountId: "4000",
    description: "Revenue from selling products",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.REVENUE),
  },
  {
    id: "acc018",
    accountId: "4020",
    accountName: "Service Revenue",
    accountType: ACCOUNT_TYPES.REVENUE,
    parentAccountId: "4000",
    description: "Revenue from providing services",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.REVENUE),
  },

  // Cost of Goods Sold (5000-5999)
  {
    id: "acc019",
    accountId: "5000",
    accountName: "Cost of Goods Sold",
    accountType: ACCOUNT_TYPES.COST_OF_GOODS_SOLD,
    parentAccountId: null,
    description: "Main COGS category",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.COST_OF_GOODS_SOLD),
    isCategory: true,
  },
  {
    id: "acc020",
    accountId: "5010",
    accountName: "Material Costs",
    accountType: ACCOUNT_TYPES.COST_OF_GOODS_SOLD,
    parentAccountId: "5000",
    description: "Cost of materials for products sold",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.COST_OF_GOODS_SOLD),
  },

  // Expenses (6000-9999)
  {
    id: "acc021",
    accountId: "6000",
    accountName: "Expenses",
    accountType: ACCOUNT_TYPES.EXPENSE,
    parentAccountId: null,
    description: "Main expense category",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.EXPENSE),
    isCategory: true,
  },
  {
    id: "acc022",
    accountId: "6010",
    accountName: "Rent Expense",
    accountType: ACCOUNT_TYPES.EXPENSE,
    parentAccountId: "6000",
    description: "Office or store rent",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.EXPENSE),
  },
  {
    id: "acc023",
    accountId: "6020",
    accountName: "Utilities Expense",
    accountType: ACCOUNT_TYPES.EXPENSE,
    parentAccountId: "6000",
    description: "Electricity, water, internet, etc.",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.EXPENSE),
  },
  {
    id: "acc024",
    accountId: "6100",
    accountName: "Salaries and Wages",
    accountType: ACCOUNT_TYPES.EXPENSE,
    parentAccountId: "6000",
    description: "Employee compensation",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.EXPENSE),
  },
  {
    id: "acc025",
    accountId: "6200",
    accountName: "Office Supplies Expense",
    accountType: ACCOUNT_TYPES.EXPENSE,
    parentAccountId: "6000",
    description: "Expendable office supplies",
    isActive: true,
    normalBalance: getNormalBalance(ACCOUNT_TYPES.EXPENSE),
  },
];

let nextAccInternalIdCounter = 26;

const simulateApiCall = (data, delay = 100) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay)
  );

export const getChartOfAccounts = async () => {
  return simulateApiCall(chartOfAccounts);
};

export const getAccountById = async (internalId) => {
  // Fetch by internal 'id'
  const account = chartOfAccounts.find((acc) => acc.id === internalId);
  return simulateApiCall(account);
};

export const getAccountByAccountId = async (accountId) => {
  // Fetch by official 'accountId'
  const account = chartOfAccounts.find((acc) => acc.accountId === accountId);
  return simulateApiCall(account);
};

export const addAccount = async (accountData) => {
  // Basic validation for accountId uniqueness
  if (chartOfAccounts.some((acc) => acc.accountId === accountData.accountId)) {
    throw new Error(`Account ID "${accountData.accountId}" already exists.`);
  }
  const newAccount = {
    ...accountData,
    id: `acc${String(nextAccInternalIdCounter++).padStart(3, "0")}`,
    isActive: accountData.isActive === undefined ? true : accountData.isActive,
    normalBalance: getNormalBalance(accountData.accountType),
  };
  chartOfAccounts.push(newAccount);
  chartOfAccounts.sort((a, b) => a.accountId.localeCompare(b.accountId)); // Keep sorted
  return simulateApiCall(newAccount);
};

export const updateAccount = async (internalId, updatedAccountData) => {
  const index = chartOfAccounts.findIndex((acc) => acc.id === internalId);
  if (index !== -1) {
    // Prevent changing accountId if it's a critical identifier and has transactions (real app)
    // For now, allow edit, but ensure it remains unique if changed
    if (
      updatedAccountData.accountId &&
      updatedAccountData.accountId !== chartOfAccounts[index].accountId
    ) {
      if (
        chartOfAccounts.some(
          (acc) =>
            acc.accountId === updatedAccountData.accountId &&
            acc.id !== internalId
        )
      ) {
        throw new Error(
          `Account ID "${updatedAccountData.accountId}" already exists.`
        );
      }
    }

    chartOfAccounts[index] = {
      ...chartOfAccounts[index],
      ...updatedAccountData,
      // Recalculate normal balance if type changes
      normalBalance: updatedAccountData.accountType
        ? getNormalBalance(updatedAccountData.accountType)
        : chartOfAccounts[index].normalBalance,
    };
    chartOfAccounts.sort((a, b) => a.accountId.localeCompare(b.accountId));
    return simulateApiCall(chartOfAccounts[index]);
  }
  return simulateApiCall(null);
};

// Deleting accounts is tricky in real systems if they have transactions.
// Often, they are marked inactive instead.
export const deleteAccount = async (internalId) => {
  const index = chartOfAccounts.findIndex((acc) => acc.id === internalId);
  if (index !== -1) {
    // Add check: if account has transactions or is a parent, prevent deletion or handle carefully.
    // For mock, we'll allow deletion.
    // Also, check if it's a parent to other accounts.
    const isParent = chartOfAccounts.some(
      (acc) => acc.parentAccountId === chartOfAccounts[index].accountId
    );
    if (isParent) {
      throw new Error(
        "Cannot delete account: It is a parent to other accounts. Reassign children first."
      );
    }
    chartOfAccounts.splice(index, 1);
    return simulateApiCall({ success: true });
  }
  return simulateApiCall({ success: false });
};

// Helper to get accounts suitable for being parents (usually category/summary accounts)
export const getParentAccountOptions = async () => {
  const parents = chartOfAccounts.filter(
    (acc) => acc.isCategory || !acc.parentAccountId
  ); // Or just filter by `isCategory`
  return simulateApiCall(
    parents.sort((a, b) => a.accountId.localeCompare(b.accountId))
  );
};
