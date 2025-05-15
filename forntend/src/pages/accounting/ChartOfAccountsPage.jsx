// src/pages/accounting/ChartOfAccountsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getChartOfAccounts,
  addAccount as apiAddAccount,
  updateAccount as apiUpdateAccount,
  deleteAccount as apiDeleteAccount,
} from "../../data/mockChartOfAccounts";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import AccountForm from "../../components/accounting/AccountForm";
import {
  PlusCircle,
  Edit,
  Trash2,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../../utils/toastNotifications";

const AccountRow = ({
  account,
  level,
  onEdit,
  onDelete,
  toggleExpand,
  expandedRows,
  hasChildren,
}) => {
  const isExpanded = expandedRows[account.id]; // Use internal 'id' for expansion state key
  const canDelete =
    !account.isCategory && (!account.children || account.children.length === 0); // Simple delete condition

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors duration-150 ${
        account.isCategory ? "bg-slate-100" : ""
      }`}
    >
      <td
        className="px-4 py-3 whitespace-nowrap text-sm text-gray-700"
        style={{ paddingLeft: `${0.75 + level * 1.75}rem` }}
      >
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(account.id)}
              className="mr-2 p-1 rounded hover:bg-gray-200 focus:outline-none"
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-gray-500" />
              ) : (
                <ChevronRight size={16} className="text-gray-500" />
              )}
            </button>
          ) : (
            <span className="inline-block w-5 mr-2"></span> // Alignment placeholder
          )}
          <span
            className={`${
              account.isCategory
                ? "font-semibold text-gray-800"
                : "text-gray-700"
            }`}
          >
            {account.accountId}
          </span>
        </div>
      </td>
      <td
        className={`px-4 py-3 whitespace-nowrap text-sm ${
          account.isCategory ? "font-semibold text-gray-800" : "text-gray-700"
        }`}
      >
        {account.accountName}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
        {account.accountType}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
        {account.parentAccountId || (
          <span className="text-gray-400 italic">Root</span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
        {account.normalBalance}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
        <span
          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      account.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
        >
          {account.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-right space-x-1">
        <Button
          variant="ghost"
          size="sm"
          className="p-1.5 text-gray-500 hover:text-blue-600"
          onClick={() => onEdit(account)}
          title="Edit Account"
        >
          <Edit size={16} />
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 text-gray-500 hover:text-red-600"
            onClick={() =>
              onDelete(account.id, account.accountName, account.accountId)
            }
            title="Delete Account"
          >
            <Trash2 size={16} />
          </Button>
        )}
      </td>
    </tr>
  );
};

const ChartOfAccountsPage = () => {
  const [allAccounts, setAllAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null); // For Add/Edit
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [expandedRows, setExpandedRows] = useState({}); // Tracks expanded parent accounts by their internal 'id'
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const data = await getChartOfAccounts();
      // Sort initially by accountId to ensure parent categories come before children if IDs are structured
      setAllAccounts(
        data.sort((a, b) => a.accountId.localeCompare(b.accountId)) || []
      );
    } catch (err) {
      console.error("Failed to fetch Chart of Accounts:", err);
      setPageError("Could not load Chart of Accounts.");
      showErrorToast("Error loading accounts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const accountTree = useMemo(() => {
    const accountsById = allAccounts.reduce((acc, account) => {
      acc[account.accountId] = { ...account, children: [] }; // Use accountId for tree building
      return acc;
    }, {});

    const tree = [];
    allAccounts.forEach((account) => {
      if (account.parentAccountId && accountsById[account.parentAccountId]) {
        accountsById[account.parentAccountId].children.push(
          accountsById[account.accountId]
        );
      } else {
        tree.push(accountsById[account.accountId]);
      }
    });
    // Sort children within each node
    const sortChildrenRecursive = (nodes) => {
      nodes.sort((a, b) => a.accountId.localeCompare(b.accountId));
      nodes.forEach((node) => {
        if (node.children.length > 0) {
          sortChildrenRecursive(node.children);
        }
      });
    };
    sortChildrenRecursive(tree);
    return tree; // Root level accounts
  }, [allAccounts]);

  // Filtered and flattened tree for rendering based on search term
  const filteredAndFlattenedAccounts = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm) return accountTree; // If no search, return the full tree

    const matchedAccounts = new Set();
    const tempExpanded = {};

    // First pass: find all accounts that match the search term
    allAccounts.forEach((account) => {
      if (
        account.accountId.toLowerCase().includes(lowerSearchTerm) ||
        account.accountName.toLowerCase().includes(lowerSearchTerm) ||
        account.accountType.toLowerCase().includes(lowerSearchTerm)
      ) {
        matchedAccounts.add(account.accountId);
        // Also mark its parents as needing to be expanded
        let current = account;
        while (current.parentAccountId) {
          const parent = allAccounts.find(
            (a) => a.accountId === current.parentAccountId
          );
          if (parent) {
            tempExpanded[parent.id] = true; // Use internal 'id' for expansion state
            matchedAccounts.add(parent.accountId);
            current = parent;
          } else {
            break;
          }
        }
      }
    });

    if (searchTerm && Object.keys(tempExpanded).length > 0) {
      setExpandedRows((prev) => ({ ...prev, ...tempExpanded })); // Auto-expand parents of matched items
    }

    // Second pass: build a new tree containing only matched accounts and their necessary parents
    const buildFilteredTree = (parentId = null) => {
      return allAccounts
        .filter(
          (acc) =>
            acc.parentAccountId === parentId &&
            matchedAccounts.has(acc.accountId)
        )
        .sort((a, b) => a.accountId.localeCompare(b.accountId))
        .map((acc) => ({
          ...acc,
          children: buildFilteredTree(acc.accountId),
        }));
    };
    // If search term is present but no matches, it will result in an empty tree
    return buildFilteredTree();
  }, [accountTree, searchTerm, allAccounts]);

  const toggleExpand = (internalAccountId) => {
    // Use internal 'id'
    setExpandedRows((prev) => ({
      ...prev,
      [internalAccountId]: !prev[internalAccountId],
    }));
  };

  const renderAccountRowsRecursive = (accounts, level = 0) => {
    let rows = [];
    accounts.forEach((account) => {
      rows.push(
        <AccountRow
          key={account.id}
          account={account}
          level={level}
          onEdit={handleOpenModalForEdit}
          onDelete={handleDelete}
          toggleExpand={toggleExpand}
          expandedRows={expandedRows}
          hasChildren={account.children && account.children.length > 0}
        />
      );
      // Render children if this account is expanded OR if there's a search term (to show matched children)
      if (
        (expandedRows[account.id] || searchTerm) &&
        account.children &&
        account.children.length > 0
      ) {
        rows = rows.concat(
          renderAccountRowsRecursive(account.children, level + 1)
        );
      }
    });
    return rows;
  };

  const handleOpenModalForNew = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };
  const handleOpenModalForEdit = (account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const handleFormSubmit = async (accountData) => {
    setIsSubmittingForm(true);
    try {
      if (editingAccount) {
        await apiUpdateAccount(editingAccount.id, accountData); // Use internal 'id' for update
        showSuccessToast("Account updated successfully!");
      } else {
        await apiAddAccount(accountData);
        showSuccessToast("Account created successfully!");
      }
      await fetchAccounts(); // Re-fetch to get updated list with correct sorting and structure
      handleCloseModal();
    } catch (error) {
      console.error("COA Form Submit Error:", error);
      showErrorToast(
        `Error: ${
          error.message ||
          (editingAccount ? "updating" : "creating") + " account."
        }`
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDelete = async (internalAccountId, accountName, accountId) => {
    if (
      window.confirm(
        `Delete account "${accountName}" (${accountId})? Ensure it has no transactions and is not a parent.`
      )
    ) {
      try {
        await apiDeleteAccount(internalAccountId);
        showSuccessToast("Account deleted successfully!");
        await fetchAccounts();
      } catch (err) {
        console.error("Delete Account Error:", err);
        showErrorToast(`Failed to delete account: ${err.message}`);
      }
    }
  };

  const existingAccountIds = useMemo(
    () => allAccounts.map((acc) => acc.accountId),
    [allAccounts]
  );

  if (isLoading && !allAccounts.length && !pageError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
        <p className="ml-4 text-lg">Loading Chart of Accounts...</p>
      </div>
    );
  }
  if (pageError && !allAccounts.length) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border ..." role="alert">
          <strong className="font-bold">Error:</strong>
          <span>{pageError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
          <BookOpen size={32} className="mr-3 text-accent" /> Chart of Accounts
        </h1>
        <Button
          variant="primary"
          IconLeft={PlusCircle}
          onClick={handleOpenModalForNew}
          size="md"
        >
          Add New Account
        </Button>
      </div>

      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by Account ID, Name, or Type..."
            className="block w-full md:w-2/3 lg:w-1/2 pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/80 focus:border-accent sm:text-sm placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5"
              >
                Account ID
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5"
              >
                Account Name
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Parent ID
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Normal Bal.
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading &&
              filteredAndFlattenedAccounts.length === 0 &&
              !pageError && (
                <tr>
                  <td colSpan="7" className="text-center py-10">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin ..."></div>
                      <p>Loading...</p>
                    </div>
                  </td>
                </tr>
              )}
            {!isLoading &&
              filteredAndFlattenedAccounts.length === 0 &&
              !pageError && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    No accounts found
                    {searchTerm
                      ? " matching your search"
                      : ". Add one to get started"}
                    .
                  </td>
                </tr>
              )}

            {renderAccountRowsRecursive(filteredAndFlattenedAccounts)}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingAccount
            ? `Edit Account: ${editingAccount.accountId}`
            : "Add New Account"
        }
        size="xl"
      >
        <AccountForm
          initialData={editingAccount || undefined} // Pass undefined for new, so AccountForm uses its defaults
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isEditMode={!!editingAccount}
          isSubmitting={isSubmittingForm}
          existingAccountIds={existingAccountIds} // Pass existing IDs for validation
        />
      </Modal>
    </div>
  );
};

export default ChartOfAccountsPage;
