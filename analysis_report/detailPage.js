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
const filteredEntries = csvData.filter(row => row[params.facility] !== undefined);

let presentCount = 0;
let absentCount = 0;

filteredEntries.forEach(row => {
  if (row[params.facility] === "1") {
    presentCount++;
  } else {
    absentCount++;
  }
});

document.getElementById("presentCount").textContent = `📊 Present: ${presentCount}`;
document.getElementById("absentCount").textContent = `📊 Absent: ${absentCount}`;

const totalCount = presentCount + absentCount;
const presentPercentage = (presentCount / totalCount) * 100;
const absentPercentage = (absentCount / totalCount) * 100;

document.getElementById("presentBar").style.width = `${presentPercentage}%`;
document.getElementById("absentBar").style.width = `${absentPercentage}%`;

document.getElementById("presentCount").textContent = `📊 Present: ${presentCount} (${presentPercentage.toFixed(1)}%)`;
document.getElementById("absentCount").textContent = `📊 Absent: ${absentCount} (${absentPercentage.toFixed(1)}%)`;

const tbody = document.querySelector("#breakdownTable tbody");
tbody.innerHTML = "";

filteredEntries.forEach(row => {
  const tr = document.createElement("tr");
  const pcCell = document.createElement("td");
  pcCell.textContent = row["PC Code"] || "N/A";

  const facilityCell = document.createElement("td");
  facilityCell.textContent = row[params.facility] === "1" ? "Present" : "Absent";

  tr.appendChild(pcCell);
  tr.appendChild(facilityCell);
  tbody.appendChild(tr);
});

document.getElementById("pcCodeFilter").addEventListener("input", function () {
  const filterText = this.value.toLowerCase();
  const filteredRows = filteredEntries.filter(row => row["PC Code"]?.toLowerCase().includes(filterText));
  populateTable(filteredRows);
});

function populateTable(entries) {
  const tbody = document.querySelector("#breakdownTable tbody");
  tbody.innerHTML = "";

  entries.forEach(row => {
    const tr = document.createElement("tr");
    const pcCell = document.createElement("td");
    pcCell.textContent = row["PC Code"] || "N/A";

    const facilityCell = document.createElement("td");
    facilityCell.textContent = row[params.facility] === "1" ? "Present" : "Absent";

    tr.appendChild(pcCell);
    tr.appendChild(facilityCell);
    tbody.appendChild(tr);
  });
}

function downloadTable() {
  const table = document.getElementById("breakdownTable");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Details" });
  const safeFacility = params.facility.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_");
  XLSX.writeFile(wb, `Details_${safeFacility}.xlsx`);
}

function goBack() {
  window.history.back();
}
