// src/pages/accounting/ChartOfAccountsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  getChartOfAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
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
  const isExpanded = expandedRows[account.id];
  return (
    <tr
      className={`hover:bg-gray-50 ${
        account.isCategory ? "bg-gray-100 font-semibold" : ""
      }`}
    >
      <td
        className="table-cell"
        style={{ paddingLeft: `${0.5 + level * 1.5}rem` }}
      >
        {hasChildren && (
          <button
            onClick={() => toggleExpand(account.id)}
            className="mr-2 p-0.5 rounded hover:bg-gray-200"
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        )}
        {!hasChildren && <span className="inline-block w-6 mr-2"></span>}{" "}
        {/* Placeholder for alignment */}
        {account.accountId}
      </td>
      <td className="table-cell">{account.accountName}</td>
      <td className="table-cell">{account.accountType}</td>
      <td className="table-cell">{account.parentAccountId || "-"}</td>
      <td className="table-cell">{account.normalBalance}</td>
      <td className="table-cell">
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            account.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {account.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="table-cell-actions space-x-1">
        <Button
          variant="ghost"
          size="sm"
          className="p-1.5"
          onClick={() => onEdit(account)}
          title="Edit"
        >
          <Edit size={18} />
        </Button>
        {!account.isCategory /* Basic check: don't allow deleting categories directly from here easily */ && (
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5"
            onClick={() => onDelete(account.id, account.accountName)}
            title="Delete"
          >
            <Trash2 size={18} />
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
  const [editingAccount, setEditingAccount] = useState(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [expandedRows, setExpandedRows] = useState({}); // For tree view: { accountId: true/false }

  const fetchAccounts = async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const data = await getChartOfAccounts();
      setAllAccounts(
        data.sort((a, b) => a.accountId.localeCompare(b.accountId)) || []
      );
    } catch (err) {
      /* ... error handling ... */
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Function to build a tree structure for rendering
  const accountTree = useMemo(() => {
    const buildTree = (parentId = null) => {
      return allAccounts
        .filter((acc) => acc.parentAccountId === parentId)
        .sort((a, b) => a.accountId.localeCompare(b.accountId))
        .map((acc) => ({
          ...acc,
          children: buildTree(acc.accountId),
        }));
    };
    return buildTree(); // Start with root accounts (parentAccountId is null)
  }, [allAccounts]);

  const toggleExpand = (accountId) => {
    setExpandedRows((prev) => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  const renderAccountRows = (accounts, level = 0) => {
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
      if (
        expandedRows[account.id] &&
        account.children &&
        account.children.length > 0
      ) {
        rows = rows.concat(renderAccountRows(account.children, level + 1));
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
        await updateAccount(editingAccount.id, accountData);
        showSuccessToast("Account updated successfully!");
      } else {
        await addAccount(accountData);
        showSuccessToast("Account created successfully!");
      }
      fetchAccounts(); // Re-fetch to get updated list
      handleCloseModal();
    } catch (error) {
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

  const handleDelete = async (accountId, accountName) => {
    if (
      window.confirm(
        `Are you sure you want to delete account "${accountName}" (${accountId})? This action might be irreversible if it has no transactions.`
      )
    ) {
      try {
        await deleteAccount(accountId); // Assumes deleteAccount takes internal 'id'
        showSuccessToast("Account deleted successfully!");
        fetchAccounts();
      } catch (err) {
        showErrorToast(`Failed to delete account: ${err.message}`);
      }
    }
  };

  // Used in AccountForm to check for Account ID uniqueness
  const existingAccountIds = useMemo(
    () => allAccounts.map((acc) => acc.accountId),
    [allAccounts]
  );

  if (isLoading) {
    /* Loading JSX */
  }
  if (pageError) {
    /* Error JSX */
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
          <BookOpen size={32} className="mr-3 text-accent" /> Chart of Accounts
        </h1>
        <Button
          variant="primary"
          IconLeft={PlusCircle}
          onClick={handleOpenModalForNew}
        >
          Add New Account
        </Button>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header w-1/5">Account ID</th>
              <th className="table-header w-2/5">Account Name</th>
              <th className="table-header">Type</th>
              <th className="table-header">Parent ID</th>
              <th className="table-header">Normal Bal.</th>
              <th className="table-header">Status</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renderAccountRows(accountTree)}
            {!isLoading && accountTree.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  No accounts found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAccount ? "Edit Account" : "Add New Account"}
        size="xl"
      >
        <AccountForm
          initialData={editingAccount || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isEditMode={!!editingAccount}
          isSubmitting={isSubmittingForm}
          existingAccountIds={existingAccountIds}
        />
      </Modal>
    </div>
  );
};

export default ChartOfAccountsPage;
