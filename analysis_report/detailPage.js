function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    question: params.get("question"),
    facility: params.get("facility"),
    count: params.get("count"),
    district: params.get("district")
  };
}

const params = getQueryParams();

document.getElementById("question").textContent = `🟢 Question: ${params.question}`;
document.getElementById("facility").textContent = `🏷️ Facility: ${params.facility}`;

const csvData = JSON.parse(localStorage.getItem("filteredData")) || [];
const filteredEntries = csvData.filter(row => row[params.facility] === "1");

let presentCount = filteredEntries.length;
document.getElementById("presentCount").textContent = `📊 Present: ${presentCount}`;

const tbody = document.querySelector("#breakdownTable tbody");
tbody.innerHTML = "";

function populateTable(entries) {
  tbody.innerHTML = "";
  entries.forEach(row => {
    const tr = document.createElement("tr");
    const pcCell = document.createElement("td");
    pcCell.textContent = row["PC Code"] || "N/A";
    const facilityCell = document.createElement("td");
    facilityCell.textContent = "Present";
    tr.appendChild(pcCell);
    tr.appendChild(facilityCell);
    tbody.appendChild(tr);
  });
}

populateTable(filteredEntries);

document.getElementById("pcCodeFilter").addEventListener("input", function () {
  const filterText = this.value.toLowerCase();
  const filteredRows = filteredEntries.filter(row => row["PC Code"]?.toLowerCase().includes(filterText));
  populateTable(filteredRows);
});

function downloadTable() {
  const table = document.getElementById("breakdownTable");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Details" });
  const safeFacility = params.facility.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_");
  XLSX.writeFile(wb, `Details_${safeFacility}.xlsx`);
}

function goBack() {
  window.history.back();
}
