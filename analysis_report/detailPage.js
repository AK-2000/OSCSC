function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    question: params.get("question"),
    facility: params.get("facility"),
    district: params.get("district"),
    showAbsent: params.get("showAbsent") === "true"
  };
}

const params = getQueryParams();
document.getElementById("question").textContent = `🟢 Question: ${params.question}`;
document.getElementById("facility").textContent = `🏷️ Facility: ${params.facility}`;

const csvData = JSON.parse(localStorage.getItem("filteredData")) || [];
// Filter the data based on the present or absent selection
let filteredEntries = [];
if (params.showAbsent) {
  filteredEntries = csvData.filter(row => row[params.facility] === "0"); // Absence (0) filtering
} else {
  filteredEntries = csvData.filter(row => row[params.facility] === "1"); // Presence (1) filtering
}

let presentCount = filteredEntries.length;
document.getElementById("presentCount").textContent = `📊 Present: ${presentCount}`;

function populateTable(entries, showAbsent) {
  const tbody = document.querySelector("#breakdownTable tbody");
  tbody.innerHTML = "";
  
  // Set the font color dynamically based on whether we're showing present or absent data
  const color = showAbsent ? 'red' : 'green'; // Red for absent, green for present

  entries.forEach(row => {
    const tr = document.createElement("tr");
    const pcCell = document.createElement("td");
    pcCell.textContent = row["PC Code"] || "N/A";

    const facilityCell = document.createElement("td");
    facilityCell.textContent = showAbsent ? "Absent" : "Present"; // Dynamic text
    facilityCell.style.color = color; // Apply dynamic color

    tr.appendChild(pcCell);
    tr.appendChild(facilityCell);
    tbody.appendChild(tr);
  });
}

document.querySelector("#breakdownTable thead tr th:nth-child(2)").textContent = params.facility;

populateTable(filteredEntries, params.showAbsent);

document.getElementById("pcCodeFilter").addEventListener("input", function () {
  const filterText = this.value.toLowerCase();
  const filteredRows = filteredEntries.filter(row =>
    row["PC Code"]?.toLowerCase().includes(filterText)
  );
  populateTable(filteredRows, params.showAbsent);
});

function downloadTable() {
  const table = document.getElementById("breakdownTable");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Details" });
  const safeFacility = params.facility.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_");
  XLSX.writeFile(wb, `${params.showAbsent ? 'Absent' : 'Present'}Details_${safeFacility}.xlsx`);
}

function goBack() {
  window.history.back();
}
