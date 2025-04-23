function toggleMenu() {
  document.getElementById("dropdownMenu").classList.toggle("active");
}

document.addEventListener("click", function (event) {
  const menu = document.getElementById("dropdownMenu");
  const hamburger = document.querySelector(".hamburger");
  if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
    menu.classList.remove("active");
  }
});

// Function to load CSV and create both floor and wall charts
async function loadCSV() {
  try {
    const response = await fetch('./infrastructure.csv');
    if (!response.ok) throw new Error("Failed to fetch CSV file");

    const data = await response.text();
    const rows = data.trim().split('\n');
    const headers = rows[0].split(',');

    const questionIndex = headers.indexOf('Question');
    const optionsIndex = headers.indexOf('Options');
    const countIndex = headers.indexOf('Count');

    if (questionIndex === -1 || optionsIndex === -1 || countIndex === -1) {
      console.error("Required columns missing in CSV.");
      return;
    }

    const totalCount = 1337;

    // ===== FLOOR SECTION =====
    const floorTypeData = { labels: [], counts: [] };
    const floorConditionData = { labels: [], counts: [] };

    // ===== WALL SECTION =====
    const wallTypeData = { labels: [], counts: [] };
    const wallConditionData = { labels: [], counts: [] };

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',');
      const question = row[questionIndex];
      const option = row[optionsIndex];
      const count = parseInt(row[countIndex]);

      // Floor filtering
      if (question === 'Type of floor available in Milling Area?') {
        floorTypeData.labels.push(option);
        floorTypeData.counts.push(count);
      } else if (question === 'Condition of floor in Milling Area?') {
        floorConditionData.labels.push(option);
        floorConditionData.counts.push(count);
      }

      // Wall filtering
      else if (question === 'Type of wall in Milling Area') {
        wallTypeData.labels.push(option);
        wallTypeData.counts.push(count);
      } else if (question === 'Condition of wall in Milling Area?') {
        wallConditionData.labels.push(option);
        wallConditionData.counts.push(count);
      }
    }

    // ===== FLOOR CHARTS =====
    createDoughnutChart('floorChart', 'Floor Type Proportion', floorTypeData, totalCount);
    createDoughnutChart('conditionChart', 'Floor Condition Proportion', floorConditionData, totalCount);

    // ===== WALL CHARTS =====
    createDoughnutChart('wallChart', 'Wall Type Proportion', wallTypeData, totalCount);
    createDoughnutChart('wallConditionChart', 'Wall Condition Proportion', wallConditionData, totalCount);

  } catch (error) {
    console.error("Error loading or parsing CSV:", error);
  }
}

// Reusable chart creation function
function createDoughnutChart(canvasId, label, dataSet, totalCount) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const percentages = dataSet.counts.map(count => (count / totalCount) * 100);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: dataSet.labels,
      datasets: [{
        label,
        data: percentages,
        counts: dataSet.counts, // for tooltip
        backgroundColor: [
          '#086966',
          'rgba(255, 204, 0, 0.8)',
          'rgba(12, 22, 79, 0.8)',
          'rgba(54, 14, 103, 0.8)',
          'rgba(164, 107, 234, 0.8)'          
        ],
        borderColor: [
          '#086966',
          'rgba(255, 204, 0, 1)',
          'rgba(12, 22, 79, 0.8)', 
          'rgba(54, 14, 103, 0.8)',
          'rgba(164, 107, 234, 0.8)'      
        ],
        borderWidth: 1,
        cutout: '75%' // thinner doughnut
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            title: function (tooltipItems) {
              return tooltipItems[0].label;
            },
            label: function (context) {
              const count = context.dataset.counts?.[context.dataIndex];
              const percentage = context.raw.toFixed(2);
              return `Count: ${count} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

window.onload = loadCSV;
