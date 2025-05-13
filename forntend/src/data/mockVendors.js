// src/data/mockVendors.js
let vendors = [
  { id: 'v001', name: 'Global Supplies Co.', contactPerson: 'Alice Smith', email: 'alice@globalsupplies.com', phone: '555-0101', category: 'Office Supplies', status: 'Active', joinedDate: '2022-03-15', address: '123 Main St, Anytown', notes: 'Reliable supplier for office stationery.' },
  { id: 'v002', name: 'Tech Parts Inc.', contactPerson: 'Bob Johnson', email: 'bob@techparts.com', phone: '555-0102', category: 'Electronics', status: 'Active', joinedDate: '2021-11-20', address: '456 Tech Park, Silicon City', notes: 'Specializes in rare components.' },
  { id: 'v003', name: 'Precision Manufacturing', contactPerson: 'Carol White', email: 'carol@precisionmfg.com', phone: '555-0103', category: 'Industrial Parts', status: 'Inactive', joinedDate: '2023-01-10', address: '789 Industrial Ave, Metroburg', notes: 'Temporarily on hold.' },
  { id: 'v004', name: 'Creative Solutions Ltd.', contactPerson: 'David Brown', email: 'david@creativesol.com', phone: '555-0104', category: 'Marketing Services', status: 'Active', joinedDate: '2022-08-05', address: '101 Creative Blvd, Media City', notes: 'Excellent design team.' },
  { id: 'v005', name: 'Eco Friendly Packaging', contactPerson: 'Eva Green', email: 'eva@ecopack.com', phone: '555-0105', category: 'Packaging', status: 'Pending', joinedDate: '2023-05-01', address: '22 Green Way, Eco Town', notes: 'Awaiting final approval.' },
];

let nextId = 6;

const simulateApiCall = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(data))); 
    }, delay);
  });
};

export const getVendors = async () => {
  return simulateApiCall(vendors);
};

export const getVendorById = async (id) => {
  const vendor = vendors.find(v => v.id === id);
  return simulateApiCall(vendor);
};

export const addVendor = async (vendorData) => {
  const newVendor = { 
    ...vendorData, 
    id: `v${String(nextId++).padStart(3, '0')}`, 
    joinedDate: new Date().toISOString().split('T')[0] 
  };
  vendors.push(newVendor);
  return simulateApiCall(newVendor);
};

export const updateVendor = async (id, updatedVendorData) => {
  const index = vendors.findIndex(v => v.id === id);
  if (index !== -1) {
    vendors[index] = { ...vendors[index], ...updatedVendorData, id }; // Ensure ID is not overwritten if not in updatedVendorData
    return simulateApiCall(vendors[index]);
  }
  return simulateApiCall(null, 100); // Simulate not found
};

export const deleteVendor = async (id) => {
  const index = vendors.findIndex(v => v.id === id);
  if (index !== -1) {
    vendors.splice(index, 1);
    return simulateApiCall({ success: true });
  }
  return simulateApiCall({ success: false }, 100); // Simulate not found
};