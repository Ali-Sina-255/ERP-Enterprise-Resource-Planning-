// src/pages/invoicing/InvoicesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices, voidInvoice as apiVoidInvoice } from '../../data/mockInvoices'; // Using void instead of delete
import Button from '../../components/common/Button';
import { PlusCircle, Edit, Eye, Search, AlertTriangle, ChevronLeft, ChevronRight, FileSpreadsheet, Download, Printer, DollarSign } from 'lucide-react'; // Changed Icon
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toastNotifications';
import { exportToCsv } from '../../utils/exportUtils';

const ITEMS_PER_PAGE = 10;

const InvoicesPage = () => {
    const [allInvoices, setAllInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // For filtering by status
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => { /* Fetch Invoices */ 
        const fetchInv = async () => {
            setIsLoading(true); setPageError(null);
            try { const data = await getInvoices(); setAllInvoices(data || []); }
            catch(err) { /* error handling */ }
            finally { setIsLoading(false); }
        };
        fetchInv();
    }, []);

    const filteredInvoices = useMemo(() => { /* Filter by searchTerm and statusFilter */
        let R = allInvoices;
        if (statusFilter) R = R.filter(inv => inv.status === statusFilter);
        const lowerSearch = searchTerm.toLowerCase();
        if (!searchTerm) return R;
        return R.filter(inv => 
            inv.invoiceNumber.toLowerCase().includes(lowerSearch) ||
            (inv.customerName && inv.customerName.toLowerCase().includes(lowerSearch))
        );
    }, [searchTerm, statusFilter, allInvoices]);

    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
    const paginatedInvoices = useMemo(() => { /* Pagination logic */ 
        const start = (currentPage - 1) * ITEMS_PER_PAGE; return filteredInvoices.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredInvoices, currentPage]);
    useEffect(() => { /* Page reset logic */ }, [searchTerm, statusFilter, totalPages, currentPage]);


    const invoiceExportColumns = [ /* Define columns for CSV export */ ];
    const handleExportInvoices = () => { /* Export logic */ };

    const handleVoidInvoice = async (invoiceId, invoiceNumber) => {
        if (window.confirm(`Are you sure you want to VOID invoice ${invoiceNumber}? This action marks it as unusable.`)) {
            try {
                await apiVoidInvoice(invoiceId);
                // Refetch or update local state:
                setAllInvoices(prev => prev.map(inv => inv.id === invoiceId ? {...inv, status: 'Void', balanceDue: 0} : inv));
                showSuccessToast(`Invoice ${invoiceNumber} voided successfully!`);
            } catch (err) { showErrorToast(`Failed to void invoice. ${err.message || ''}`); }
        }
    };
    
    const handlePageChange = (newPage) => { /* ... */ };
    const getPageNumbers = () => { /* ... */ };
    const getStatusColor = (status) => { /* Similar to SO/PO pages, add colors for invoice statuses */ 
         switch (status?.toLowerCase()) {
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
            case 'sent': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'partially paid': return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'paid': return 'bg-green-100 text-green-800 border-green-300';
            case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
            case 'void': return 'bg-slate-200 text-slate-600 border-slate-400 line-through';
            default: return 'bg-gray-200 text-gray-700 border-gray-400';
        }
    };

    if (isLoading && !allInvoices.length && !pageError) { /* Loading JSX */ }
    if (pageError && !allInvoices.length) { /* Error JSX */ }

    const invoiceStatusOptions = ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Void', ''];


    return (
        <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-semibold text-gray-800 flex items-center"><FileSpreadsheet size={32} className="mr-3 text-accent"/> Customer Invoices</h1>
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <Button variant="outline" IconLeft={Download} onClick={handleExportInvoices} disabled={isLoading || filteredInvoices.length === 0} size="md">Export CSV</Button>
                    <Link to="/invoicing/invoices/new"><Button variant="primary" IconLeft={PlusCircle} size="md">Create New Invoice</Button></Link>
                </div>
            </div>
            {/* Search and Filter Bar */}
            <div className="mb-6 p-4 bg-white shadow rounded-lg flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full sm:w-auto">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search Invoice #, Customer..."
                        className="block w-full pl-10 pr-3 py-2.5 border ..."
                        value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                    <label htmlFor="statusFilter" className="sr-only">Filter by Status</label>
                    <select id="statusFilter" value={statusFilter} onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}
                        className="block w-full px-3 py-2.5 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm">
                        <option value="">All Statuses</option>
                        {invoiceStatusOptions.filter(s=>s).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Table - adapt columns for Invoice #, Customer, Issue Date, Due Date, Total, Balance Due, Status */}
            <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr>
                        <th className="table-header">Invoice #</th><th className="table-header">Customer</th>
                        <th className="table-header">Issue Date</th><th className="table-header">Due Date</th>
                        <th className="table-header">Total</th><th className="table-header">Balance Due</th>
                        <th className="table-header">Status</th><th className="table-header text-right">Actions</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50">
                                <td className="table-cell"><Link to={`/invoicing/invoices/${inv.id}`} className="font-medium text-accent hover:underline">{inv.invoiceNumber}</Link></td>
                                <td className="table-cell">{inv.customerName}</td>
                                <td className="table-cell">{new Date(inv.issueDate).toLocaleDateString()}</td>
                                <td className="table-cell">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                <td className="table-cell font-semibold">${inv.totalAmount?.toFixed(2)}</td>
                                <td className="table-cell font-bold text-red-600">${inv.balanceDue?.toFixed(2)}</td>
                                <td className="table-cell"><span className={`px-2.5 py-0.5 text-xs ... ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                                <td className="table-cell-actions space-x-1">
                                    <Link to={`/invoicing/invoices/${inv.id}`} title="View"><Button variant="ghost" size="sm" className="p-1.5"><Eye/></Button></Link>
                                    {inv.status !== 'Paid' && inv.status !== 'Void' && <Link to={`/invoicing/invoices/${inv.id}/edit`} title="Edit"><Button variant="ghost" size="sm" className="p-1.5"><Edit/></Button></Link>}
                                    {inv.status !== 'Paid' && inv.status !== 'Void' && <Button variant="ghost" size="sm" className="p-1.5 text-orange-600 hover:text-orange-700" onClick={() => handleVoidInvoice(inv.id, inv.invoiceNumber)} title="Void Invoice"><AlertTriangle/></Button>}
                                    {inv.status !== 'Paid' && inv.status !== 'Void' && <Button variant="ghost" size="sm" className="p-1.5 text-green-600 hover:text-green-700" onClick={() => { /* Open record payment modal */ showErrorToast('Record payment modal TBD'); }} title="Record Payment"><DollarSign/></Button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
                    <div className="flex space-x-2">
                        <Button variant="outline" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}><ChevronLeft/></Button>
                        {getPageNumbers().map((page) => (
                            <Button key={page} variant="outline" onClick={() => handlePageChange(page)}>{page}</Button>
                        ))}
                        <Button variant="outline" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}><ChevronRight/></Button>
                    </div>
                </div>
             )}
        </div>
    );
};
export default InvoicesPage;