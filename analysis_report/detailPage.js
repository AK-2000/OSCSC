function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    question: params.get("question"),
    facility: params.get("facility"),
    type: params.get("type") || "present" // Default to "present" if no type is passed
  };
}

const params = getQueryParams();
document.getElementById("question").textContent = `🟢 Question: ${params.question}`;
document.getElementById("facility").textContent = `🏷️ Facility: ${params.facility}`;

const csvData = JSON.parse(localStorage.getItem("filteredData")) || [];
const filteredEntries = csvData.filter(row => row[params.facility] !== ""); // Filter only rows where data exists for the facility

// Based on the 'type' in the URL, we show either Present or Absent data
let entriesToDisplay;
if (params.type === "present") {
  entriesToDisplay = filteredEntries.filter(row => row[params.facility] === "1");  // Show Present data
} else if (params.type === "absent") {
  entriesToDisplay = filteredEntries.filter(row => row[params.facility] === "0");  // Show Absent data
}

// Update the present/absent count based on filtered data
let count = entriesToDisplay.length;
const countElement = document.getElementById("presentCount");

// Dynamically change the color based on the type (present/absent)
if (params.type === "absent") {
  countElement.style.color = "red";  // Make the absent count red
  countElement.textContent = `📊 Absent: ${count}`;
} else {
  countElement.style.color = "green";  // Keep the present count green (or default)
  countElement.textContent = `📊 Present: ${count}`;
}

function populateTable(entries) {
  const tbody = document.querySelector("#breakdownTable tbody");
  tbody.innerHTML = "";
  
  // Loop through the entries and create rows
  entries.forEach(row => {
    const tr = document.createElement("tr");
    const pcCell = document.createElement("td");
    pcCell.textContent = row["PC Code"] || "N/A";

    const facilityCell = document.createElement("td");
    facilityCell.textContent = params.type.charAt(0).toUpperCase() + params.type.slice(1);
    
    // Change the color if we are showing absent data
    if (params.type === "absent") {
      facilityCell.style.color = "red"; // Red for absent data
    } else {
      facilityCell.style.color = "green"; // Green for present data (if desired)
    }

    tr.appendChild(pcCell);
    tr.appendChild(facilityCell);
    tbody.appendChild(tr);
  });
}

// Populate the table with filtered data (either present or absent)
populateTable(entriesToDisplay);

document.getElementById("pcCodeFilter").addEventListener("input", function () {
  const filterText = this.value.toLowerCase();
  const filteredRows = entriesToDisplay.filter(row =>
    row["PC Code"]?.toLowerCase().includes(filterText)
  );
  populateTable(filteredRows);
});

function downloadTable() {
  const table = document.getElementById("breakdownTable");
  const wb = XLSX.utils.table_to_book(table, { sheet: `${params.type.charAt(0).toUpperCase() + params.type.slice(1)} Data` });
  const safeFacility = params.facility.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_");
  XLSX.writeFile(wb, `${params.type.charAt(0).toUpperCase() + params.type.slice(1)}Details_${safeFacility}.xlsx`);
}

function goBack() {
  window.history.back();
}
