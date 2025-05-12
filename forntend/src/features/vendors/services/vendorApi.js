// A small part of VendorsListPage.jsx or a VendorCard.jsx component
function VendorCard({ vendor }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-800">{vendor.name}</h3>
      <p className="text-sm text-gray-600">{vendor.contactEmail}</p>
      <p className="text-sm text-gray-500 mt-2">Category: {vendor.category}</p>
      <div className="mt-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm">
          View Details
        </button>
      </div>
    </div>
  );
}
