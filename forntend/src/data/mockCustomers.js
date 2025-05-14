// src/data/mockCustomers.js
let customers = [
  {
    id: "cust001",
    firstName: "Michael",
    lastName: "Scott",
    companyName: "Dunder Mifflin Scranton",
    email: "michael.scott@dundermifflin.com",
    phone: "555-0101",
    address: "1725 Slough Avenue, Scranton, PA",
    city: "Scranton",
    state: "PA",
    zipCode: "18505",
    country: "USA",
    customerType: "Corporate", // Corporate, Individual, Reseller
    status: "Active", // Active, Inactive, Prospect
    joinedDate: "2005-03-24",
    notes: 'Loves "That\'s what she said" jokes. Buys a lot of paper.',
    taxId: "DM-SCRANTON-TAXID",
  },
  {
    id: "cust002",
    firstName: "Leslie",
    lastName: "Knope",
    companyName: "Pawnee Parks Department",
    email: "leslie.knope@pawneeparks.gov",
    phone: "555-0102",
    address: "3500 N Liberty Dr, Pawnee, IN",
    city: "Pawnee",
    state: "IN",
    zipCode: "47501",
    country: "USA",
    customerType: "Government",
    status: "Active",
    joinedDate: "2009-04-09",
    notes: "Very enthusiastic about binders and public service.",
  },
  {
    id: "cust003",
    firstName: "Peter",
    lastName: "Parker",
    companyName: "", // Individual customer
    email: "spidey@dailybugle.com",
    phone: "555-0103",
    address: "20 Ingram Street, Forest Hills, Queens, NY",
    city: "Queens",
    state: "NY",
    zipCode: "11375",
    country: "USA",
    customerType: "Individual",
    status: "Prospect",
    joinedDate: "2023-08-10",
    notes: "Seems to disappear a lot. Interested in camera equipment.",
  },
  {
    id: "cust004",
    firstName: "Leia",
    lastName: "Organa",
    companyName: "Rebel Alliance Supplies",
    email: "leia.o@rebelbase.org",
    phone: "555-0104",
    address: "Echo Base, Hoth System",
    city: "Echo Base",
    state: "Hoth",
    zipCode: "N/A",
    country: "Outer Rim",
    customerType: "Non-Profit/Organization",
    status: "Active",
    joinedDate: "1977-05-25",
    notes: "Needs supplies for various outposts. Discreet shipping required.",
  },
];

let nextCustIdCounter = 5;

const simulateApiCall = (data, delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(data)));
    }, delay);
  });
};

export const getCustomers = async () => {
  return simulateApiCall(customers);
};

export const getCustomerById = async (id) => {
  const customer = customers.find((c) => c.id === id);
  return simulateApiCall(customer);
};

export const addCustomer = async (customerData) => {
  const newCustomer = {
    ...customerData,
    id: `cust${String(nextCustIdCounter++).padStart(3, "0")}`,
    joinedDate:
      customerData.joinedDate || new Date().toISOString().split("T")[0],
  };
  customers.push(newCustomer);
  return simulateApiCall(newCustomer);
};

export const updateCustomer = async (id, updatedCustomerData) => {
  const index = customers.findIndex((c) => c.id === id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...updatedCustomerData, id };
    return simulateApiCall(customers[index]);
  }
  return simulateApiCall(null);
};

export const deleteCustomer = async (id) => {
  const index = customers.findIndex((c) => c.id === id);
  if (index !== -1) {
    customers.splice(index, 1);
    return simulateApiCall({ success: true });
  }
  return simulateApiCall({ success: false });
};
