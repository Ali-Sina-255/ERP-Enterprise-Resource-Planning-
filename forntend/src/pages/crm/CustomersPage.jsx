// src/pages/crm/CustomersPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, deleteCustomer as apiDeleteCustomer, addCustomer as apiAddCustomer, updateCustomer as apiUpdateCustomer } from '../../data/mockCustomers';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import CustomerForm from '../../components/crm/CustomerForm';
import { UserPlus, Edit, Trash2, Eye, Search, AlertTriangle, ChevronLeft, ChevronRight, Download, Users as UsersIcon } from 'lucide-react';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toastNotifications';
import { exportToCsv } from '../../utils/exportUtils';

const ITEMS_PER_PAGE = 8;

const CustomersPage = () => {
    const [allCustomers, setAllCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            setIsLoading(true);
            setPageError(null);
            try {
                const data = await getCustomers();
                setAllCustomers(data || []);
            } catch (err) {
                console.error("Failed to fetch customers:", err);
                setPageError("Failed to load customers. Please try again later.");
                showErrorToast("Error loading customers list.");
                setAllCustomers([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        if (!searchTerm) return allCustomers;
        return allCustomers.filter(cust =>
            (cust.firstName && `${cust.firstName} ${cust.lastName}`.toLowerCase().includes(lowerSearchTerm)) ||
            (cust.companyName && cust.companyName.toLowerCase().includes(lowerSearchTerm)) ||
            (cust.email && cust.email.toLowerCase().includes(lowerSearchTerm)) ||
            (cust.customerType && cust.customerType.toLowerCase().includes(lowerSearchTerm)) ||
            (cust.city && cust.city.toLowerCase().includes(lowerSearchTerm))
        );
    }, [searchTerm, allCustomers]);

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredCustomers.slice(startIndex, endIndex);
    }, [filteredCustomers, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
        else if (totalPages === 0 && filteredCustomers.length > 0) setCurrentPage(1);
        else if (currentPage === 0 && totalPages > 0) setCurrentPage(1);
    }, [searchTerm, filteredCustomers.length, totalPages, currentPage]);
    
    const customerExportColumns = [
        { key: 'id', header: 'Internal ID' },
        { key: 'firstName', header: 'First Name' },
        { key: 'lastName', header: 'Last Name' },
        { key: 'companyName', header: 'Company Name' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Phone' },
        { key: 'address', header: 'Address' },
        { key: 'city', header: 'City' },
        { key: 'state', header: 'State' },
        { key: 'zipCode', header: 'Zip Code' },
        { key: 'country', header: 'Country' },
        { key: 'customerType', header: 'Customer Type' },
        { key: 'status', header: 'Status' },
        { key: 'joinedDate', header: 'Joined Date' },
        { key: 'taxId', header: 'Tax ID' },
        { key: 'notes', header: 'Notes' },
    ];

    const handleExportCustomers = () => {
        if (filteredCustomers.length === 0) {
            showInfoToast("No customers to export based on current filters.");
            return;
        }
        exportToCsv([...filteredCustomers], customerExportColumns, 'customers_list');
        showInfoToast("Customers list is being downloaded.");
    };


    const handleOpenModalForNew = () => { setEditingCustomer(null); setIsModalOpen(true); };
    const handleOpenModalForEdit = (customer) => { setEditingCustomer(customer); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingCustomer(null); };

    const handleFormSubmit = async (customerData) => {
        setIsSubmittingForm(true);
        try {
            let updatedList;
            let successMessage = "";
            if (editingCustomer) {
                const updated = await apiUpdateCustomer(editingCustomer.id, customerData);
                if (!updated) throw new Error("Update failed.");
                updatedList = allCustomers.map(c => c.id === editingCustomer.id ? updated : c);
                successMessage = "Customer details updated successfully!";
            } else {
                const newCust = await apiAddCustomer(customerData);
                if (!newCust) throw new Error("Add failed.");
                updatedList = [...allCustomers, newCust];
                successMessage = "Customer added successfully!";
            }
            setAllCustomers(updatedList);
            showSuccessToast(successMessage);
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save customer:", error);
            showErrorToast(`Error: ${editingCustomer ? 'updating' : 'adding'} customer. ${error.message || ''}`);
        } finally {
            setIsSubmittingForm(false);
        }
    };

    const handleDelete = async (customerId) => {
        if (window.confirm("Are you sure you want to delete this customer? This may affect related sales orders and invoices.")) {
            try {
                await apiDeleteCustomer(customerId);
                setAllCustomers(prev => prev.filter(c => c.id !== customerId));
                showSuccessToast('Customer deleted successfully!');
                if (paginatedCustomers.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
            } catch (err) {
                console.error("Failed to delete customer:", err);
                showErrorToast("Failed to delete customer.");
            }
        }
    };

    const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage); };
    const getPageNumbers = () => { /* ... same as VendorsPage ... */ 
        const pageNumbers = []; const maxPagesToShow = 5; const halfPagesToShow = Math.floor(maxPagesToShow / 2);
        if (totalPages <= maxPagesToShow) { for (let i = 1; i <= totalPages; i++) pageNumbers.push(i); }
        else { /* ... ellipsis logic ... */ }
        return pageNumbers.filter((item, index) => pageNumbers.indexOf(item) === index);
    };


    if (isLoading && !allCustomers.length && !pageError) { /* Loading Spinner */ }
    if (pageError && !allCustomers.length) { /* Error Display */ }

    return (
        <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-semibold text-gray-800 flex items-center"><UsersIcon size={32} className="mr-3 text-accent" /> Manage Customers</h1>
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <Button variant="outline" IconLeft={Download} onClick={handleExportCustomers} disabled={isLoading || filteredCustomers.length === 0} size="md">Export CSV</Button>
                    <Button variant="primary" IconLeft={UserPlus} onClick={handleOpenModalForNew} size="md">Add New Customer</Button>
                </div>
            </div>

            <div className="mb-6 p-4 bg-white shadow rounded-lg">
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type="text" placeholder="Search by name, company, email, type, city..."
                        className="block w-full md:w-2/3 lg:w-1/2 pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/80 focus:border-accent sm:text-sm"
                        value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="table-header">Customer Name</th>
                            <th scope="col" className="table-header">Company</th>
                            <th scope="col" className="table-header">Email</th>
                            <th scope="col" className="table-header">Type</th>
                            <th scope="col" className="table-header">Status</th>
                            <th scope="col" className="table-header text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Loading and No Data Rows */}
                        {isLoading && paginatedCustomers.length === 0 && !pageError && ( <tr><td colSpan="6" className="text-center py-10">Loading...</td></tr>)}
                        {!isLoading && paginatedCustomers.length === 0 && !pageError && (<tr><td colSpan="6" className="text-center py-10">No customers found.</td></tr>)}
                        
                        {paginatedCustomers.map((cust) => (
                            <tr key={cust.id} className="hover:bg-gray-50">
                                <td className="table-cell">
                                    <Link to={`/crm/customers/${cust.id}`} className="font-medium text-accent hover:text-accent/80">
                                        {cust.firstName || cust.lastName ? `${cust.firstName} ${cust.lastName}`.trim() : cust.companyName || 'N/A'}
                                    </Link>
                                    <div className="text-xs text-gray-500">ID: {cust.id}</div>
                                </td>
                                <td className="table-cell">{cust.companyName || '-'}</td>
                                <td className="table-cell">{cust.email}</td>
                                <td className="table-cell">{cust.customerType}</td>
                                <td className="table-cell">
                                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                                        cust.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        cust.status === 'Prospect' ? 'bg-blue-100 text-blue-800' :
                                        cust.status === 'Lead' ? 'bg-indigo-100 text-indigo-800' :
                                        cust.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'}`}>
                                        {cust.status}
                                    </span>
                                </td>
                                <td className="table-cell-actions space-x-1">
                                    <Link to={`/crm/customers/${cust.id}`} title="View Details"><Button variant="ghost" size="sm" className="p-1.5"><Eye size={18} /></Button></Link>
                                    <Button variant="ghost" size="sm" className="p-1.5" onClick={() => handleOpenModalForEdit(cust)} title="Edit Customer"><Edit size={18} /></Button>
                                    <Button variant="ghost" size="sm" className="p-1.5" onClick={() => handleDelete(cust.id)} title="Delete Customer"><Trash2 size={18} /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination Controls - same as VendorsPage */}



            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <Button variant="ghost" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} IconLeft={ChevronLeft} />
                    {getPageNumbers().map((page) => (
                        <Button key={page} variant={page === currentPage ? 'primary' : 'ghost'} size="sm" onClick={() => handlePageChange(page)}>{page}</Button>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} IconRight={ChevronRight} />
                </div>
            )}


            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCustomer ? 'Edit Customer' : 'Add New Customer'} size="3xl">
                <CustomerForm initialData={editingCustomer || {}} onSubmit={handleFormSubmit} onCancel={handleCloseModal} isSubmitting={isSubmittingForm} isEditMode={!!editingCustomer} />
            </Modal>
        </div>
    );
};

export default CustomersPage;