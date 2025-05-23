// Toggle hamburger menu
function toggleMenu() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.classList.toggle("active");
}

// Close dropdown if clicked outside
document.addEventListener("click", function (event) {
  const menu = document.getElementById("dropdownMenu");
  const hamburger = document.querySelector(".hamburger");

  if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
    menu.classList.remove("active");
  }
});

// ---------------------------------------------------
// District Filter Logic (loads after DOM is ready)
// ---------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  let csvData = [];

  // Fetch CSV data and parse it
  function fetchCSVData() {
    fetch("data.csv")
      .then((response) => response.text())
      .then((data) => {
        csvData = parseCSV(data);
        populateDistrictDropdown(csvData);
      })
      .catch((err) => console.error("Error loading CSV:", err));
  }

  // Parse the CSV data into a usable object
  function parseCSV(data) {
    const rows = data.trim().split("\n");
    const headers = rows[0].split(",");

    return rows.slice(1).map((row) => {
      const values = row.split(",");
      let entry = {};
      headers.forEach((header, index) => {
        entry[header.trim()] = values[index]?.trim() || "";
      });
      return entry;
    });
  }

  // Populate district dropdown with case normalization
  function populateDistrictDropdown(data) {
    const districtSet = new Set(
      data
        .map((row) => row.District.trim().toLowerCase())
        .filter((d) => d !== "")
    );

    const dropdown = document.getElementById("districtDropdown");

    const sortedDistricts = Array.from(districtSet)
      .map(d => capitalizeWords(d))
      .sort((a, b) => a.localeCompare(b));

    sortedDistricts.forEach((district) => {
      const option = document.createElement("option");
      option.value = district.toLowerCase();
      option.textContent = district;
      dropdown.appendChild(option);
    });
  }

  function capitalizeWords(str) {
    return str
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  document.getElementById("districtDropdown").addEventListener("change", function () {
    const selectedDistrict = this.value.toLowerCase();
    const filteredData = csvData.filter((row) => row.District.toLowerCase() === selectedDistrict);
    document.getElementById("pcCount").textContent = filteredData.length;
    localStorage.setItem("filteredData", JSON.stringify(filteredData));
    updateTable(filteredData);
  });

  function updateTable(filteredData) {
    const tableBody = document.getElementById("questionTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";

    const questions = [
      {
        question: "Which of the following facilities are available at the Procurement Center?",
        options: [
          "Biometrics verification of farmers",
          "Procurement Center board/Banner",
          "Drinking water facility",
          "Toilet facility",
          "Help Desk",
          "Administrative building",
          "Drainage",
          "Quality Check Room"
        ]
      },
      {
        question: "What is the type of floor available for unloading of grains at the Procurement Center?",
        options: [
          "Kutcha Floor",
          "Kutcha Floor with Tarpaulin",
          "Brick Flooring",
          "Cement Floor"
        ]
      },
      {
        question: "How is the weighment of grains done?",
        options: [
          "Not performed",
          "Manual scale without Calibration Certificate",
          "Manual scale with Calibration Certificate",
          "Digital Weighing scale without calibration certificate",
          "Digital Weighing scale with calibration certificate",
          "Weighbridge"
        ]
      },
      {
        question: "What is the source of power available at the center?",
        options: [
          "Not Available",
          "Electricity Connection/Grid energy",
          "Generator"
        ]
      },
      {
        question: "Which of the following information is displayed in the Procurement Center?",
        options: [
          "Not available",
          "MSP",
          "Procurement Center operation days and timings",
          "Quality specifications",
          "Duties of Procurement Center officials",
          "Contact details of the officials",
          "Contact details for grievance redressal",
          "List of token generated farmers"
        ]
      }
    ];

    let serialNumber = 1;

    questions.forEach((question) => {
      question.options.forEach((option, index) => {
        const row = tableBody.insertRow();

        const cell1 = row.insertCell(0);
        cell1.textContent = serialNumber;

        if (index === 0) {
          const cell2 = row.insertCell(1);
          cell2.textContent = question.question;
          cell2.rowSpan = question.options.length;
          cell2.style.fontWeight = "bold";
          cell2.style.backgroundColor = "#f2f2f2";
        }

        const cell3 = row.insertCell(index === 0 ? 2 : 1);
        const cell4 = row.insertCell(index === 0 ? 3 : 2);
        const cell5 = row.insertCell(index === 0 ? 4 : 3);
        const cell6 = row.insertCell(index === 0 ? 5 : 4);
        const cell7 = row.insertCell(index === 0 ? 6 : 5);

        cell3.textContent = option;

        const presentCount = getPresentCount(filteredData, option);
        const absentCount = filteredData.length - presentCount;

        const presentLink = document.createElement("a");
        presentLink.href = `detailPage.html?question=${encodeURIComponent(question.question)}&facility=${encodeURIComponent(option)}&type=present&count=${presentCount}`;
        presentLink.textContent = presentCount;
        presentLink.style.color = "blue";
        presentLink.style.cursor = "pointer";
        presentLink.addEventListener("mouseover", function () {
          presentLink.style.textDecoration = "underline";
        });
        presentLink.addEventListener("mouseout", function () {
          presentLink.style.textDecoration = "none";
        });
        cell4.appendChild(presentLink);

        cell5.textContent = ((presentCount / filteredData.length) * 100).toFixed(2) + "%";

        const absentLink = document.createElement("a");
        absentLink.href = `detailPage.html?question=${encodeURIComponent(question.question)}&facility=${encodeURIComponent(option)}&type=absent&count=${absentCount}`;
        absentLink.textContent = absentCount;
        absentLink.style.color = "red";
        absentLink.style.cursor = "pointer";
        absentLink.addEventListener("mouseover", function () {
          absentLink.style.textDecoration = "underline";
        });
        absentLink.addEventListener("mouseout", function () {
          absentLink.style.textDecoration = "none";
        });
        cell6.appendChild(absentLink);

        cell7.textContent = ((absentCount / filteredData.length) * 100).toFixed(2) + "%";

        serialNumber++;
      });
    });
  }

  function getPresentCount(data, facility) {
    return data.filter((row) => row[facility] === "1").length;
  }

  fetchCSVData();
});

if (document.getElementById("exportBtn")) {
  document.getElementById("exportBtn").addEventListener("click", function () {
    const table = document.getElementById("questionTable");
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet 1" });
    XLSX.writeFile(wb, "Procurement_Center_Report.xlsx");
  });
}
