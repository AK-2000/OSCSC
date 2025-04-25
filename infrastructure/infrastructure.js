// Menu toggle for dropdown
function toggleMenu() {
  document.getElementById("dropdownMenu").classList.toggle("active");
}

// Close dropdowns if clicked outside
document.addEventListener("click", function (event) {
  const menu = document.getElementById("dropdownMenu");
  const hamburger = document.querySelector(".hamburger");
  if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
    menu.classList.remove("active");
  }
});

// Utility function to format names
function formatName(name) {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

let allData = [];
const totalPCs = 1402;

// Updated category to question mapping
const categoryToQuestions = {
  "Floor": ["Type of floor available for unloading of Paddy?"],
  "Dunnage": [
    "Is dunnage available at the unloading location?",
    "Type of dunnage available at the unloading location?"
  ],
  "Source Of Power": ["What is the source of power available at the center?"],
  "Procurement Center Banner": ["Is there a Procurement Center board/banner displayed prominently?"],
  "Waiting Space": ["Is there a waiting space for farmers at the purchase center?"],
  "Storage Facilities": ["What kind of storage facility is available at procurement center for procured grains?"]
};

// Show questions under selected category
function displayQuestions(district, category) {
  const questions = categoryToQuestions[category] || [];
  const chartsArea = document.getElementById("chartsArea");
  chartsArea.innerHTML = ""; // Clear previous content

  const container = document.createElement("div");
  container.className = "question-list";

  const title = document.createElement("h3");
  title.textContent = `Questions under category: ${category}`;
  container.appendChild(title);

  const list = document.createElement("ul");
  questions.forEach(q => {
    const item = document.createElement("li");
    item.textContent = q;
    list.appendChild(item);
  });

  container.appendChild(list);
  chartsArea.appendChild(container);
}

// Chart rendering function
function renderChartsForSelection(district, category) {
  const questions = categoryToQuestions[category] || [];
  const chartsArea = document.getElementById("chartsArea");

  questions.forEach((question) => {
    const filtered = allData.filter(entry =>
      entry["District"] && entry["District"].trim().toLowerCase() === district.toLowerCase() &&
      entry["Question"] && entry["Question"].trim() === question
    );

    const optionCounts = {};
    const allOptions = getAllOptionsForQuestion(question); // Helper function to get all possible options for this question
    
    // Initialize all options to 0 in optionCounts
    allOptions.forEach(option => {
      optionCounts[option] = 0;
    });

    // Count the occurrences of each option in the filtered data
    filtered.forEach(entry => {
      const option = entry["Option"];
      optionCounts[option] = (optionCounts[option] || 0) + 1;
    });

    const labels = Object.keys(optionCounts);
    const counts = labels.map(label => optionCounts[label]);
    const percentages = counts.map(count => ((count / totalPCs) * 100).toFixed(1));
    const remainingPercentages = percentages.map(p => 100 - p); // Remaining percentage to complete 100%

    const container = document.createElement("div");
    container.className = "chart-container";

    const title = document.createElement("h3");
    title.className = "chart-title";
    title.textContent = question;
    container.appendChild(title);

    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    chartsArea.appendChild(container);

    // Set canvas height to reduce vertical space
    canvas.height = 120;  // Adjust this value to control the chart height

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Count Percentage',
            data: percentages,
            backgroundColor: '#00c0a3', // Green for count percentage
            borderRadius: 8,  // Rounded corners for bars
            barThickness: 20,  // Fixed bar width
            stack: 'stack1',  // Stack this dataset
          },
          {
            label: 'Remaining Percentage',
            data: remainingPercentages,
            backgroundColor: '#FFEB3B', // Yellow for remaining percentage
            borderRadius: 8,  // Rounded corners for bars
            barThickness: 20,  // Fixed bar width
            stack: 'stack1',  // Stack this dataset with the previous one
          }
        ]
      },
      options: {
        indexAxis: 'y', // Horizontal bars
        responsive: true,
        maintainAspectRatio: false,  // Allow custom height
        plugins: {
          tooltip: {
            intersect: false,  // Tooltip is triggered when hovering over any part of the bar
            callbacks: {
              label: function (context) {
                const index = context.dataIndex;
                // Check if it's green or yellow to display the right info
                if (context.datasetIndex === 0) {
                  // Green bar (Count Percentage)
                  return `Count: ${counts[index]}, Percentage: ${percentages[index]}%`;
                } else if (context.datasetIndex === 1) {
                  // Yellow bar (Remaining Percentage)
                  return `Count: ${totalPCs - counts[index]}, Percentage: ${remainingPercentages[index]}%`;
                }
              }
            },
            titleFont: {
              size: 18,  // Larger title font size in tooltip
              weight: 'bold',
            },
            bodyFont: {
              size: 16,  // Larger body font size in tooltip
            },
            backgroundColor: '#fff',  // Tooltip background color
            titleColor: '#333',  // Tooltip title color
            bodyColor: '#333',  // Tooltip body text color
            borderColor: '#ccc',  // Tooltip border color
            borderWidth: 1,  // Border width of tooltip
            padding: 10,  // Padding around tooltip content
          },
          legend: {
            display: false  // Hide the legend
          },
          datalabels: {
            display: true,  // Show labels on the bars
            align: 'center',  // Position the labels in the center of the bars
            color: '#fff',  // White color for the labels
            font: {
              weight: 'bold',  // Bold font for data labels
              size: 14,  // Font size for data labels
            },
            formatter: (value) => `${value} (${((value / totalPCs) * 100).toFixed(2)}%)`,  // Format the label as count with percentage
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: '% of Total Procurement Centers',
              font: {
                size: 15, // Adjust this value for larger text size
                weight: 'bold', // Make it bold
                family: 'Arial', // Optional: Set font family, can be changed as needed
              },
            },
            ticks: {
              font: {
                size: 20,  // Font size for x-axis labels
                weight: 'bold',  // Bold font for x-axis labels
              },
              color: '#333',  // Color for x-axis labels
            }
          },
          y: {
            min: 0,  // Set the minimum value for the y-axis
            max: 10, // Set the maximum value to reduce the vertical space
            ticks: {
              autoSkip: false,
              font: {
                size: 14,  // Font size for y-axis labels
              },
              color: '#333',  // Color for y-axis labels
              display: true,  // You can hide specific ticks if needed
            },
            // Reduce the number of ticks by increasing `stepSize`
            stepSize: 1,  // Adjust step size to control spacing
          }
        },
        animation: {
          duration: 1000,  // Set animation duration
          easing: 'easeOutBounce',  // Easing function for animation
        },
        responsive: true,
        stacked: true, // Enable stacking
        layout: {
          padding: {
            top: 0,  // Remove padding from top
            bottom: 0,  // Remove padding from bottom
            left: 0,  // Remove padding from left
            right: 0  // Remove padding from right
          }
        }
      }
    });
  });
}


// Load data from CSV and populate dropdowns
function loadInfrastructureData() {
  Papa.parse("infrastructure.csv", {
    header: true,
    download: true,
    complete: function (results) {
      allData = results.data;
      const districtSet = new Set();
      const categorySet = new Set();

      allData.forEach((row) => {
        if (row["District"]) {
          districtSet.add(formatName(row["District"].trim()));
        }
        if (row["Category"]) {
          categorySet.add(formatName(row["Category"].trim()));
        }
      });

      const sortedDistricts = Array.from(districtSet).sort();
      const districtList = document.getElementById("districtList");

      sortedDistricts.forEach((district) => {
        const item = document.createElement("div");
        item.classList.add("dropdown-item");
        item.textContent = district;
        item.onclick = () => {
          document.getElementById("selectedDistrict").textContent = district;
          districtList.style.display = "none";

          const selectedCategory = document.getElementById("selectedCategory").textContent.trim();
          if (selectedCategory !== "-- Choose Category --") {
            displayQuestions(district, selectedCategory);
            renderChartsForSelection(district, selectedCategory);
          }
        };
        districtList.appendChild(item);
      });

      const sortedCategories = Array.from(categorySet).sort();
      const categoryList = document.getElementById("categoryList");

      sortedCategories.forEach((category) => {
        const item = document.createElement("div");
        item.classList.add("dropdown-item");
        item.textContent = category;
        item.onclick = () => {
          document.getElementById("selectedCategory").textContent = category;
          categoryList.style.display = "none";

          const selectedDistrict = document.getElementById("selectedDistrict").textContent.trim();
          if (selectedDistrict !== "-- Select District --") {
            displayQuestions(selectedDistrict, category);
            renderChartsForSelection(selectedDistrict, category);
          }
        };
        categoryList.appendChild(item);
      });
    },
    error: function (err) {
      console.error("Error loading CSV:", err);
    }
  });
}

// Function executed when window is loaded
window.onload = function () {
  loadInfrastructureData();

  const selectedDistrict = document.getElementById("selectedDistrict");
  const districtList = document.getElementById("districtList");
  const districtDropdown = document.getElementById("districtDropdown");

  selectedDistrict.addEventListener("click", () => {
    districtList.style.display = districtList.style.display === "block" ? "none" : "block";
  });

  const selectedCategory = document.getElementById("selectedCategory");
  const categoryList = document.getElementById("categoryList");
  const categoryDropdown = document.getElementById("categoryDropdown");

  selectedCategory.addEventListener("click", () => {
    categoryList.style.display = categoryList.style.display === "block" ? "none" : "block";
  });

  window.addEventListener("click", function (e) {
    if (!districtDropdown.contains(e.target)) {
      districtList.style.display = "none";
    }
    if (!categoryDropdown.contains(e.target)) {
      categoryList.style.display = "none";
    }
  });
};
