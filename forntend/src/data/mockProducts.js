// src/data/mockProducts.js

let products = [
  {
    id: "p001",
    name: "Standard A4 Paper Ream",
    sku: "PAP-A4-STD",
    category: "Office Supplies",
    stock: 150,
    costPrice: 2.5,
    sellingPrice: 4.99,
    vendorId: "v001",
    lowStockThreshold: 20,
  },
  {
    id: "p002",
    name: "Wireless Optical Mouse",
    sku: "MOU-WRL-OPT",
    category: "Electronics",
    stock: 75,
    costPrice: 8.0,
    sellingPrice: 15.99,
    vendorId: "v002",
    lowStockThreshold: 10,
  },
  {
    id: "p003",
    name: "Heavy Duty Stapler",
    sku: "STP-HD-001",
    category: "Office Supplies",
    stock: 0,
    costPrice: 12.5,
    sellingPrice: 24.95,
    vendorId: "v001",
    lowStockThreshold: 5,
  },
  {
    id: "p004",
    name: "1TB NVMe SSD",
    sku: "SSD-NVME-1TB",
    category: "Electronics",
    stock: 30,
    costPrice: 70.0,
    sellingPrice: 119.99,
    vendorId: "v002",
    lowStockThreshold: 5,
  },
  {
    id: "p005",
    name: "Cardboard Box (Medium)",
    sku: "BOX-MED-CB",
    category: "Packaging",
    stock: 500,
    costPrice: 0.5,
    sellingPrice: 1.2,
    vendorId: "v005",
    lowStockThreshold: 100,
  },
];

// Calculate nextProdIdCounter based on existing data
let nextProdIdCounter =
  products.length > 0
    ? Math.max(...products.map((p) => parseInt(p.id.replace("p", "")))) + 1
    : 1;

const simulateApiCall = (data, delay = 400) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(data)));
    }, delay);
  });
};

export const getProducts = async () => {
  return simulateApiCall(products);
};

export const getProductById = async (id) => {
  const product = products.find((p) => p.id === id);
  return simulateApiCall(product);
};

export const addProduct = async (productData) => {
  const newProduct = {
    ...productData,
    id: `p${String(nextProdIdCounter++).padStart(3, "0")}`,
    costPrice: parseFloat(productData.costPrice) || 0,
    sellingPrice: parseFloat(productData.sellingPrice) || 0,
    stock: parseInt(productData.stock, 10) || 0,
    lowStockThreshold: parseInt(productData.lowStockThreshold, 10) || 10,
  };
  products.push(newProduct);
  return simulateApiCall(newProduct);
};

export const updateProduct = async (id, updatedProductData) => {
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    const dataToUpdate = {
      ...updatedProductData,
      costPrice:
        updatedProductData.costPrice !== undefined
          ? parseFloat(updatedProductData.costPrice)
          : products[index].costPrice,
      sellingPrice:
        updatedProductData.sellingPrice !== undefined
          ? parseFloat(updatedProductData.sellingPrice)
          : products[index].sellingPrice,
      stock:
        updatedProductData.stock !== undefined
          ? parseInt(updatedProductData.stock, 10)
          : products[index].stock,
      lowStockThreshold:
        updatedProductData.lowStockThreshold !== undefined
          ? parseInt(updatedProductData.lowStockThreshold, 10)
          : products[index].lowStockThreshold,
    };
    products[index] = { ...products[index], ...dataToUpdate, id };
    return simulateApiCall(products[index]);
  }
  return simulateApiCall(null);
};

export const deleteProduct = async (id) => {
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products.splice(index, 1);
    return simulateApiCall({ success: true });
  }
  return simulateApiCall({ success: false });
};

// --- THIS IS THE FUNCTION NEEDED BY mockPurchaseOrders.js ---
/**
 * Updates the stock for a given product.
 * @param {string} productId - The ID of the product to update.
 * @param {number} quantityChange - The change in quantity (positive for increase, negative for decrease).
 * @returns {Promise<Object|null>} The updated product object or null if not found.
 */
export const updateProductStock = async (productId, quantityChange) => {
  const index = products.findIndex((p) => p.id === productId);
  if (index !== -1) {
    const currentStock = Number(products[index].stock) || 0;
    const qtyChange = Number(quantityChange) || 0;

    if (isNaN(currentStock) || isNaN(qtyChange)) {
      console.error(
        `Invalid stock or quantity change for product ${productId}: stock=${products[index].stock}, change=${quantityChange}`
      );
      // Potentially throw an error or return the product without changes
      return simulateApiCall(null); // Or throw new Error(...)
    }
    const newStock = currentStock + qtyChange;
    products[index].stock = newStock;
    // console.log(`Stock updated for ${productId}: old ${currentStock}, change ${qtyChange}, new ${newStock}`);
    return simulateApiCall(products[index]);
  }
  console.error(`Product with ID ${productId} not found for stock update.`);
  return simulateApiCall(null);
};
