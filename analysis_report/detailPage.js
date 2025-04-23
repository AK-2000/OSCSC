function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    question: params.get("question"),
    facility: params.get("facility"),
    district: params.get("district"),
    type: params.get("type") || "present"  // default to 'present'
  };
}

const params = getQueryParams();

// Update headings
document.getElementById("question").textContent = `🟢 Question: ${params.question}`;
document.getElementById("facility").textContent = `🏷️ Facility: ${params.facility}`;

// Get data from localStorage
const csvData = JSON.parse(localStorage.getItem("filteredData")) || [];

// Filter entries based on presence or absence
let filteredEntries;
if (params.type === "absent") {
  filteredEntries = csvData.filter(row => row[params.facility] !== "1");
} else {
  filteredEntries = csvData.filter(row => row[params.facility] === "1");
}

// Count and label
const countLabel = params.type === "absent" ? "Absent" : "Present";
document.getElementById("presentCount").textContent = `📊 ${countLabel}: ${filteredEntries.length}`;

// Populate the table
function populateTable(entries) {
  const tbody = document.querySelector("#breakdownTable tbody");
  tbody.innerHTML = "";
  entries.forEach(row => {
    const tr = document.createElement("tr");
    const pcCell = document.createElement("td");
    pcCell.textContent = row["PC Code"] || "N/A";

    const facilityCell = document.createElement("td");
    facilityCell.textContent = countLabel;

    tr.appendChild(pcCell);
    tr.appendChild(facilityCell);
    tbody.appendChild(tr);
  });
}

// Update table header with facility name
document.querySelector("#breakdownTable thead tr th:nth-child(2)").textContent = params.facility;

populateTable(filteredEntries);

// Live search filter
document.getElementById("pcCodeFilter").addEventListener("input", function () {
  const filterText = this.value.toLowerCase();
  const filteredRows = filteredEntries.filter(row =>
    row["PC Code"]?.toLowerCase().includes(filterText)
  );
  populateTable(filteredRows);
});

// Excel download
function downloadTable() {
  const table = document.getElementById("breakdownTable");
  const wb = XLSX.utils.table_to_book(table, { sheet: `${countLabel} Data` });
  const safeFacility = params.facility.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_");
  XLSX.writeFile(wb, `${countLabel}Details_${safeFacility}.xlsx`);
}

// Go back
function goBack() {
  window.history.back();
}
