// src/utils/exportUtils.js
import Papa from "papaparse";

/**
 * Exports an array of objects to a CSV file.
 * @param {Array<Object>} data - The array of data objects to export.
 * @param {Array<{key: string, header: string}>} columns - Array of column definitions.
 *                                                        'key' is the object key, 'header' is the CSV header.
 * @param {string} filename - The desired filename for the CSV file (without .csv extension).
 */
export const exportToCsv = (data, columns, filename = "export") => {
  if (!data || data.length === 0) {
    console.warn("No data provided for CSV export.");
    // Optionally show a toast notification here
    return;
  }

  if (!columns || columns.length === 0) {
    console.warn("No column definitions provided for CSV export.");
    return;
  }

  // Prepare data based on column definitions
  const csvData = data.map((row) => {
    const newRow = {};
    columns.forEach((col) => {
      // Handle nested keys if necessary, e.g., 'user.name'
      // For simplicity, we assume direct keys for now
      newRow[col.header] =
        row[col.key] !== undefined && row[col.key] !== null
          ? String(row[col.key])
          : "";
    });
    return newRow;
  });

  // Extract just the headers for PapaParse
  const csvHeaders = columns.map((col) => col.header);

  const csv = Papa.unparse({
    fields: csvHeaders, // Use the extracted headers
    data: csvData.map((row) => csvHeaders.map((header) => row[header])), // Map data to match header order
  });

  // Create a Blob with the CSV data
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    // Check if browser supports download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up
  } else {
    // Fallback for older browsers (less common now)
    console.error("Browser does not support automatic downloads.");
    // You could display the CSV data in a textarea for manual copy-paste
  }
};
