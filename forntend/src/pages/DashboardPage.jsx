// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Package,
  ShoppingCart,
  Briefcase,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

// Import Chart.js components and register necessary elements
import { Bar, Doughnut, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, // Needed for Pie and Doughnut charts
} from "chart.js";

// Import mock data functions
import { getVendors } from "../data/mockVendors";
import { getProducts } from "../data/mockProducts";
import { getPurchaseOrders } from "../data/mockPurchaseOrders";
import { getEmployees } from "../data/mockEmployees";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Reusable Stat Card Component
const StatCard = ({
  title,
  value,
  icon,
  linkTo,
  bgColorClass = "bg-white",
  textColorClass = "text-accent",
}) => {
  const IconComponent = icon;
  const cardContent = (
    <div
      className={`${bgColorClass} p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out h-full flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          {IconComponent && (
            <IconComponent className={`w-8 h-8 ${textColorClass} opacity-80`} />
          )}
        </div>
        <p className={`text-4xl font-bold ${textColorClass}`}>{value}</p>
      </div>
      {linkTo && (
        <div className="mt-4 text-sm text-gray-500 hover:text-accent transition-colors">
          View Details →
        </div>
      )}
    </div>
  );

  return linkTo ? (
    <Link to={linkTo}>{cardContent}</Link>
  ) : (
    <div>{cardContent}</div>
  );
};

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState({
    totalVendors: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalPOs: 0,
    pendingPOs: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    // For charts
    poByStatusData: null,
    employeesByDeptData: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Parallel fetching for efficiency
        const [vendors, products, purchaseOrders, employees] =
          await Promise.all([
            getVendors(),
            getProducts(),
            getPurchaseOrders(),
            getEmployees(),
          ]);

        const lowStockCount = products.filter(
          (p) => p.stock <= (p.lowStockThreshold || 0)
        ).length;
        const pendingPOCount = purchaseOrders.filter(
          (po) =>
            po.status?.toLowerCase() === "pending approval" ||
            po.status?.toLowerCase() === "approved" // Consider 'approved' as also pending action
        ).length;
        const activeEmpCount = employees.filter(
          (emp) => emp.status?.toLowerCase() === "active"
        ).length;

        // Prepare data for PO Status Chart (Doughnut)
        const poStatusCounts = purchaseOrders.reduce((acc, po) => {
          acc[po.status] = (acc[po.status] || 0) + 1;
          return acc;
        }, {});
        const poStatusChart = {
          labels: Object.keys(poStatusCounts),
          datasets: [
            {
              label: "POs by Status",
              data: Object.values(poStatusCounts),
              backgroundColor: [
                "rgba(255, 159, 64, 0.7)", // Pending Approval (Orange)
                "rgba(54, 162, 235, 0.7)", // Approved (Blue)
                "rgba(75, 192, 192, 0.7)", // Ordered (Teal)
                "rgba(153, 102, 255, 0.7)", // Partially Received (Purple)
                "rgba(100, 220, 100, 0.7)", // Received (Green)
                "rgba(255, 99, 132, 0.7)", // Cancelled (Red)
              ],
              borderColor: [
                "rgba(255, 159, 64, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(100, 220, 100, 1)",
                "rgba(255, 99, 132, 1)",
              ],
              borderWidth: 1,
            },
          ],
        };

        // Prepare data for Employees by Department Chart (Bar)
        const empDeptCounts = employees.reduce((acc, emp) => {
          acc[emp.department] = (acc[emp.department] || 0) + 1;
          return acc;
        }, {});
        const empDeptChart = {
          labels: Object.keys(empDeptCounts),
          datasets: [
            {
              label: "Employees per Department",
              data: Object.values(empDeptCounts),
              backgroundColor: "rgba(75, 192, 192, 0.6)", // Teal
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        };

        setDashboardData({
          totalVendors: vendors.length,
          totalProducts: products.length,
          lowStockProducts: lowStockCount,
          totalPOs: purchaseOrders.length,
          pendingPOs: pendingPOCount,
          totalEmployees: employees.length,
          activeEmployees: activeEmpCount,
          poByStatusData: poStatusChart,
          employeesByDeptData: empDeptChart,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load dashboard data. Please try again later.");
        showErrorToast("Error loading dashboard data."); // Assuming you have showErrorToast
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array means this runs once on mount

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Important for sizing within a div
    plugins: {
      legend: {
        position: "top", // or 'bottom', 'left', 'right'
      },
      title: {
        display: true,
        font: { size: 16 },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // Ensure y-axis shows whole numbers for counts
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-accent"></div>
        <p className="ml-4 text-2xl text-gray-600">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-red-600 mb-2">
          Error Loading Dashboard
        </h2>
        <p className="text-gray-700">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-6"
          variant="primary"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
        Dashboard Overview
      </h1>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Vendors"
          value={dashboardData.totalVendors}
          icon={Users}
          linkTo="/vendors"
          textColorClass="text-blue-600"
        />
        <StatCard
          title="Total Products"
          value={dashboardData.totalProducts}
          icon={Package}
          linkTo="/inventory"
          textColorClass="text-green-600"
        />
        <StatCard
          title="Total Purchase Orders"
          value={dashboardData.totalPOs}
          icon={ShoppingCart}
          linkTo="/purchasing/purchase-orders"
          textColorClass="text-purple-600"
        />
        <StatCard
          title="Total Employees"
          value={dashboardData.totalEmployees}
          icon={Briefcase}
          linkTo="/hr/employees"
          textColorClass="text-teal-600"
        />

        {/* More specific stats */}
        <StatCard
          title="Low Stock Items"
          value={dashboardData.lowStockProducts}
          icon={AlertCircle}
          linkTo="/inventory?filter=lowstock"
          bgColorClass="bg-yellow-50"
          textColorClass="text-yellow-600"
        />
        <StatCard
          title="Pending POs"
          value={dashboardData.pendingPOs}
          icon={Clock}
          linkTo="/purchasing/purchase-orders?filter=pending"
          bgColorClass="bg-orange-50"
          textColorClass="text-orange-600"
        />
        <StatCard
          title="Active Employees"
          value={dashboardData.activeEmployees}
          icon={CheckCircle}
          linkTo="/hr/employees?filter=active"
          bgColorClass="bg-cyan-50"
          textColorClass="text-cyan-600"
        />
        <StatCard
          title="Total PO Value (Example)"
          value={"$125,670"}
          icon={DollarSign}
          linkTo="/purchasing/purchase-orders"
          textColorClass="text-indigo-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* POs by Status Chart */}
        {dashboardData.poByStatusData && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Purchase Orders by Status
            </h2>
            <div className="h-80 md:h-96">
              {" "}
              {/* Set a fixed height for the chart container */}
              <Doughnut
                data={dashboardData.poByStatusData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: "PO Status Distribution",
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Employees by Department Chart */}
        {dashboardData.employeesByDeptData && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Employees by Department
            </h2>
            <div className="h-80 md:h-96">
              {" "}
              {/* Set a fixed height for the chart container */}
              <Bar
                data={dashboardData.employeesByDeptData}
                options={{
                  ...barChartOptions,
                  plugins: {
                    ...barChartOptions.plugins,
                    title: {
                      ...barChartOptions.plugins.title,
                      text: "Department Sizes",
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Placeholder for other sections like Recent Activity, Quick Links, etc. */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Recent Activity / Quick Links
        </h2>
        <p className="text-gray-600">
          This area could show recent POs created, new employees added, or
          provide quick links to common tasks. (Placeholder for future
          enhancements).
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/purchasing/purchase-orders/new"
            className="block p-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-center font-medium"
          >
            Create PO
          </Link>
          <Link
            to="/hr/employees"
            className="block p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center font-medium"
          >
            View Employees
          </Link>
          <Link
            to="/inventory"
            className="block p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center font-medium"
          >
            Manage Inventory
          </Link>
          <Link
            to="/vendors/new"
            className="block p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-center font-medium"
          >
            Add Vendor
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
