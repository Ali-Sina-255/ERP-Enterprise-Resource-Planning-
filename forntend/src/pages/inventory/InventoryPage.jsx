import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getProducts,
  deleteProduct as apiDeleteProduct,
  addProduct as apiAddProduct,
  updateProduct as apiUpdateProduct,
} from "../../data/mockProducts";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ProductForm from "../../components/inventory/ProductForm";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react"; // Added Download
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../../utils/toastNotifications"; // Added showInfoToast
import { exportToCsv } from "../../utils/exportUtils"; // Import the export utility

const ITEMS_PER_PAGE = 8;

const InventoryPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setPageError(null);
      try {
        const data = await getProducts();
        setAllProducts(data || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setPageError("Failed to load inventory. Please try again later.");
        showErrorToast("Error loading inventory list.");
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!searchTerm) return allProducts;
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        product.sku.toLowerCase().includes(lowerSearchTerm) ||
        product.category.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm, allProducts]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && filteredProducts.length > 0) {
      setCurrentPage(1);
    } else if (currentPage === 0 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [searchTerm, filteredProducts.length, totalPages, currentPage]);

  const productExportColumns = [
    { key: "id", header: "Internal ID" },
    { key: "name", header: "Product Name" },
    { key: "sku", header: "SKU" },
    { key: "category", header: "Category" },
    { key: "stock", header: "Current Stock" },
    { key: "costPrice", header: "Cost Price" },
    { key: "sellingPrice", header: "Selling Price" },
    { key: "vendorId", header: "Preferred Vendor ID" },
    { key: "lowStockThreshold", header: "Low Stock Threshold" },
  ];

  const handleExportProducts = () => {
    if (filteredProducts.length === 0) {
      showInfoToast("No products to export based on current filters.");
      return;
    }
    exportToCsv(
      [...filteredProducts],
      productExportColumns,
      "inventory_products_list"
    );
    showInfoToast("Products list is being downloaded.");
  };

  const handleOpenModalForNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (productData) => {
    setIsSubmittingForm(true);
    try {
      let updatedProductsList;
      let successMessage = "";
      if (editingProduct) {
        const updated = await apiUpdateProduct(editingProduct.id, productData);
        if (!updated) throw new Error("Update failed or product not found.");
        updatedProductsList = allProducts.map((p) =>
          p.id === editingProduct.id ? updated : p
        );
        successMessage = "Product updated successfully!";
      } else {
        const newProd = await apiAddProduct(productData);
        if (!newProd) throw new Error("Add failed.");
        updatedProductsList = [...allProducts, newProd];
        successMessage = "Product added successfully!";
      }
      setAllProducts(updatedProductsList);
      showSuccessToast(successMessage);
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save product:", error);
      showErrorToast(
        `Error: ${editingProduct ? "updating" : "adding"} product. ${
          error.message || ""
        }`
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDelete = async (productId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      try {
        await apiDeleteProduct(productId);
        setAllProducts((prev) => prev.filter((p) => p.id !== productId));
        showSuccessToast("Product deleted successfully!");
        if (paginatedProducts.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error("Failed to delete product:", error);
        showErrorToast("Error: deleting product.");
      }
    }
  };

  const getStockLevelClass = (stock, threshold) => {
    if (stock === 0) return "text-red-600 font-semibold";
    if (threshold === undefined || threshold === null) threshold = 10;
    if (stock <= threshold) return "text-yellow-600 font-semibold";
    return "text-green-600";
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      if (currentPage > halfPagesToShow + 2) pageNumbers.push("...");
      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);
      if (currentPage <= halfPagesToShow + 1)
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      if (currentPage >= totalPages - halfPagesToShow)
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (currentPage < totalPages - halfPagesToShow - 1)
        pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
    return pageNumbers.filter(
      (item, index) => pageNumbers.indexOf(item) === index
    );
  };

  if (isLoading && !allProducts.length && !pageError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
        <p className="ml-4 text-lg text-gray-600">Loading inventory...</p>
      </div>
    );
  }

  if (pageError && !allProducts.length) {
    return (
      <div className="container mx-auto p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold mr-2">
            <AlertTriangle className="inline-block mr-2" size={20} />
            Error:
          </strong>
          <span className="block sm:inline">{pageError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold text-gray-800">
          Inventory Management
        </h1>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Button
            variant="outline"
            IconLeft={Download}
            onClick={handleExportProducts}
            disabled={isLoading || filteredProducts.length === 0}
            size="md"
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            IconLeft={PlusCircle}
            onClick={handleOpenModalForNew}
            size="md"
          >
            Add Product
          </Button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white shadow rounded-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products by name, SKU, category..."
            className="block w-full md:w-2/3 lg:w-1/2 pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-accent/80 focus:border-accent 
                           sm:text-sm placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="table-header">
                Name
              </th>
              <th scope="col" className="table-header">
                SKU
              </th>
              <th scope="col" className="table-header">
                Category
              </th>
              <th scope="col" className="table-header">
                Stock
              </th>
              <th scope="col" className="table-header">
                Cost Price
              </th>
              <th scope="col" className="table-header">
                Selling Price
              </th>
              <th scope="col" className="table-header text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && paginatedProducts.length === 0 && !pageError && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                    <p className="ml-3">Loading data...</p>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && paginatedProducts.length === 0 && !pageError && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  No products found matching your criteria.
                  {searchTerm &&
                    allProducts.length > 0 &&
                    " Try a different search term."}
                  {!searchTerm &&
                    allProducts.length === 0 &&
                    " No products available yet."}
                </td>
              </tr>
            )}
            {paginatedProducts.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="table-cell">
                  <div className="font-medium text-gray-900">
                    {product.name}
                  </div>
                  <div className="text-xs text-gray-500">ID: {product.id}</div>
                </td>
                <td className="table-cell">{product.sku}</td>
                <td className="table-cell">{product.category}</td>
                <td
                  className={`table-cell ${getStockLevelClass(
                    product.stock,
                    product.lowStockThreshold
                  )}`}
                >
                  {product.stock}
                  {product.stock <=
                    (product.lowStockThreshold === undefined
                      ? 10
                      : product.lowStockThreshold) &&
                    product.stock > 0 && (
                      <AlertTriangle
                        size={16}
                        className="inline ml-1.5 text-yellow-500"
                        title="Low Stock"
                      />
                    )}
                  {product.stock === 0 && (
                    <AlertTriangle
                      size={16}
                      className="inline ml-1.5 text-red-500"
                      title="Out of Stock"
                    />
                  )}
                </td>
                <td className="table-cell">
                  ${product.costPrice ? product.costPrice.toFixed(2) : "0.00"}
                </td>
                <td className="table-cell">
                  $
                  {product.sellingPrice
                    ? product.sellingPrice.toFixed(2)
                    : "0.00"}
                </td>
                <td className="table-cell-actions space-x-1">
                  <Link to={`/inventory/${product.id}`} title="View Details">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-accent p-1.5"
                    >
                      <Eye size={18} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-blue-600 p-1.5"
                    onClick={() => handleOpenModalForEdit(product)}
                    title="Edit Product"
                  >
                    <Edit size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-600 p-1.5"
                    onClick={() => handleDelete(product.id)}
                    title="Delete Product"
                  >
                    <Trash2 size={18} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700">
          <div className="mb-2 sm:mb-0">
            Showing{" "}
            <span className="font-semibold">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to
            <span className="font-semibold">
              {" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}
            </span>{" "}
            of
            <span className="font-semibold">
              {" "}
              {filteredProducts.length}
            </span>{" "}
            products
          </div>
          <nav aria-label="Pagination">
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-md px-2 py-1.5 md:px-3 md:py-2"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} />{" "}
                  <span className="hidden md:inline ml-1">Prev</span>
                </Button>
              </li>
              {getPageNumbers().map((page, index) => (
                <li key={`page-${page === "..." ? `ellipsis-${index}` : page}`}>
                  {page === "..." ? (
                    <span className="px-2 py-1.5 md:px-3 md:py-2 text-gray-500">
                      ...
                    </span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      className="px-2.5 py-1.5 md:px-3.5 md:py-2"
                      onClick={() => handlePageChange(page)}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {" "}
                      {page}{" "}
                    </Button>
                  )}
                </li>
              ))}
              <li>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-md px-2 py-1.5 md:px-3 md:py-2"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  aria-label="Next"
                >
                  <span className="hidden md:inline mr-1">Next</span>{" "}
                  <ChevronRight size={18} />
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingProduct
            ? `Edit Product: ${editingProduct.name}`
            : "Add New Product"
        }
        size="2xl"
      >
        <ProductForm
          initialData={
            editingProduct || { status: "Active", lowStockThreshold: 10 }
          }
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmittingForm}
          isEditMode={!!editingProduct}
        />
      </Modal>
    </div>
  );
};

export default InventoryPage;
