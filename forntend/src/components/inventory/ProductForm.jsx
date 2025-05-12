import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Save, XCircle } from 'lucide-react';
import { getVendors } from '../../data/mockVendors'; // To populate vendor dropdown

const ProductForm = ({ initialData = {}, onSubmit, onCancel, isSubmitting = false, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', stock: 0, costPrice: 0, sellingPrice: 0, vendorId: '', lowStockThreshold: 10,
    ...initialData
  });
  const [errors, setErrors] = useState({});
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchVendorsList = async () => {
        try {
            const vendorData = await getVendors();
            setVendors(vendorData || []);
        } catch (error) {
            console.error("Failed to fetch vendors for product form:", error);
        }
    };
    fetchVendorsList();
  }, []);

  useEffect(() => { // Ensure form resets if initialData changes (e.g., when modal opens for edit)
    setFormData({
        name: '', sku: '', category: '', stock: 0, costPrice: 0, sellingPrice: 0, vendorId: '', lowStockThreshold: 10,
        ...initialData
    });
    setErrors({}); // Clear previous errors
  }, [initialData]);


  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Product name is required.";
    if (!formData.sku.trim()) tempErrors.sku = "SKU is required.";
    if (!formData.category.trim()) tempErrors.category = "Category is required.";
    if (formData.stock < 0) tempErrors.stock = "Stock cannot be negative.";
    if (formData.costPrice < 0) tempErrors.costPrice = "Cost price cannot be negative.";
    if (formData.sellingPrice < 0) tempErrors.sellingPrice = "Selling price cannot be negative.";
    if (formData.lowStockThreshold < 0) tempErrors.lowStockThreshold = "Low stock threshold cannot be negative.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Product Name" id="name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="SKU" id="sku" name="sku" value={formData.sku} onChange={handleChange} error={errors.sku} required />
        <Input label="Category" id="category" name="category" value={formData.category} onChange={handleChange} error={errors.category} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input label="Current Stock" id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} error={errors.stock} />
        <Input label="Cost Price" id="costPrice" name="costPrice" type="number" step="0.01" value={formData.costPrice} onChange={handleChange} error={errors.costPrice} />
        <Input label="Selling Price" id="sellingPrice" name="sellingPrice" type="number" step="0.01" value={formData.sellingPrice} onChange={handleChange} error={errors.sellingPrice} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700 mb-1">Preferred Vendor</label>
            <select
                id="vendorId"
                name="vendorId"
                value={formData.vendorId}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
            >
                <option value="">Select a Vendor</option>
                {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                ))}
            </select>
        </div>
        <Input label="Low Stock Threshold" id="lowStockThreshold" name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleChange} error={errors.lowStockThreshold} />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} IconLeft={XCircle} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" IconLeft={Save} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Product')}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;