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

  // Populate district dropdown
  function populateDistrictDropdown(data) {
    const districtSet = new Set(
      data
        .map((row) => row.District.trim())
        .filter((d) => d !== "") // 🔥 filter out empty strings
    );
  
    const dropdown = document.getElementById("districtDropdown");
  
    // Convert Set to array, capitalize and sort alphabetically
    const sortedDistricts = Array.from(districtSet)
      .map(d => capitalizeWords(d))
      .sort((a, b) => a.localeCompare(b));
  
    sortedDistricts.forEach((district) => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      dropdown.appendChild(option);
    });
  }

  
  // Helper to capitalize only first letter of each word
  function capitalizeWords(str) {
    return str
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  // Handle the district selection and update the table
  document.getElementById("districtDropdown").addEventListener("change", function () {
    const selectedDistrict = this.value;
    const filteredData = csvData.filter((row) => row.District === selectedDistrict);

    // Display filtered data count
    document.getElementById("pcCount").textContent = filteredData.length;

    // Save filtered data to localStorage for use on detailPage
    localStorage.setItem("filteredData", JSON.stringify(filteredData));

    // Update the table with filtered data
    updateTable(filteredData);
  });

  // Update table with filtered data
  function updateTable(filteredData) {
    const tableBody = document.getElementById("questionTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = ""; // Clear the existing table rows

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

        // Always insert Serial Number
        const cell1 = row.insertCell(0);
        cell1.textContent = serialNumber;

        if (index === 0) {
          // Only insert the question cell on the first option row
          const cell2 = row.insertCell(1);
          cell2.textContent = question.question;
          cell2.rowSpan = question.options.length;
          cell2.style.fontWeight = "bold";
          cell2.style.backgroundColor = "#f2f2f2";
        }

        // Insert remaining cells
        const cell3 = row.insertCell(index === 0 ? 2 : 1); // Facility
        const cell4 = row.insertCell(index === 0 ? 3 : 2); // Present
        const cell5 = row.insertCell(index === 0 ? 4 : 3); // % Present
        const cell6 = row.insertCell(index === 0 ? 5 : 4); // Absent
        const cell7 = row.insertCell(index === 0 ? 6 : 5); // % Absent

        cell3.textContent = option;

        const presentCount = getPresentCount(filteredData, option);
        const absentCount = filteredData.length - presentCount;

        // Create clickable link for the Present column
        const presentLink = document.createElement("a");
        presentLink.href = `detailPage.html?question=${encodeURIComponent(question.question)}&facility=${encodeURIComponent(option)}&count=${presentCount}`;
        presentLink.textContent = presentCount;
        presentLink.style.color = "blue";
        presentLink.style.cursor = "pointer";
        presentLink.addEventListener("mouseover", function () {
          presentLink.style.textDecoration = "underline";
        });
        presentLink.addEventListener("mouseout", function () {
          presentLink.style.textDecoration = "none";
        });

        // Insert Present Link into the cell
        cell4.appendChild(presentLink);
        cell5.textContent = ((presentCount / filteredData.length) * 100).toFixed(2) + "%";
        cell6.textContent = absentCount;
        cell7.textContent = ((absentCount / filteredData.length) * 100).toFixed(2) + "%";

        serialNumber++;
      });
    });
  }

  // Function to count how many "1" values are in the column corresponding to the facility
  function getPresentCount(data, facility) {
    return data.filter((row) => row[facility] === "1").length;
  }

  // Initialize by fetching CSV data
  fetchCSVData();
});

// Export table to Excel
if (document.getElementById("exportBtn")) {
  document.getElementById("exportBtn").addEventListener("click", function () {
    const table = document.getElementById("questionTable");
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet 1" });
    XLSX.writeFile(wb, "Procurement_Center_Report.xlsx");
  });
}


