// Toggle hamburger menu
function toggleMenu() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.classList.toggle("active");
}

// Close dropdown if clicked outside
document.addEventListener("click", function(event) {
  const menu = document.getElementById("dropdownMenu");
  const hamburger = document.querySelector(".hamburger");

  if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
    menu.classList.remove("active");
  }
});

// Handle district click (optional)
function handleDistrictClick(districtName) {
  alert("You clicked on " + districtName);
}

// Tooltip reference
const tooltip = document.getElementById("map-tooltip");

document.addEventListener('DOMContentLoaded', () => {
  // Load district CSV data
  fetch('data/state_data.csv')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load CSV file.');
      return response.text();
    })
    .then(csv => {
      const lines = csv.trim().split('\n');
      const tbody = document.querySelector('#odisha-data-table tbody');
      const districtData = {};

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const district = values[0].trim();
        const pcsPlanned = parseInt(values[1].trim());
        const pcsVisited = parseInt(values[2].trim());

        districtData[district] = { pcsPlanned, pcsVisited };

        const row = document.createElement('tr');
        values.forEach(val => {
          const cell = document.createElement('td');
          cell.textContent = val.trim();
          row.appendChild(cell);
        });
        tbody.appendChild(row);
      }

      // Tooltip handling for map paths
      document.querySelectorAll('svg path[id]').forEach(path => {
        path.addEventListener("mousemove", (e) => {
          const districtName = path.id;
          const data = districtData[districtName];

          const pcsInfo = data
            ? `PCs Planned: ${data.pcsPlanned}<br>PCs Visited: ${data.pcsVisited}`
            : "PCs Planned: Data not available";

          tooltip.innerHTML = `<strong>${districtName}</strong><br>${pcsInfo}`;
          tooltip.style.display = "block";
          tooltip.style.left = e.pageX + 10 + "px";
          tooltip.style.top = e.pageY + 10 + "px";
        });

        path.addEventListener("mouseleave", () => {
          tooltip.style.display = "none";
        });

        path.addEventListener("click", () => {
          handleDistrictClick(path.id);
        });
      });
    })
    .catch(error => console.error('Error loading CSV:', error));

  // Load weekly visits CSV
  fetch('data/weekly_visit.csv')
    .then(response => response.text())
    .then(data => {
      const rows = data.trim().split('\n').slice(1);
      const weekTableBody = document.querySelector('.week-table tbody');
      const barChartContainer = document.querySelector('.bar-chart');

      let maxVal = 0;
      const weeklyData = rows.map(row => {
        const [week, completed] = row.split(',');
        const count = parseInt(completed.trim());
        if (count > maxVal) maxVal = count;
        return { week: week.trim(), completed: count };
      });

      weekTableBody.innerHTML = '';
      barChartContainer.innerHTML = '';

      weeklyData.forEach(({ week, completed }) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${week}</td><td>${completed}</td>`;
        weekTableBody.appendChild(tr);

        const barHeight = (completed / maxVal * 100).toFixed(1);
        const barGroup = document.createElement('div');
        barGroup.classList.add('bar-group');
        barGroup.innerHTML = `
          <span class="bar-value">${completed}</span>
          <div class="bar" style="height: ${barHeight}%"></div>
          <div class="week-label-wrapper">
            <div class="week-label">Week</div>
            <div class="week-number">${week}</div>
          </div>
        `;
        barChartContainer.appendChild(barGroup);
      });
    })
    .catch(error => console.error('Error loading weekly visits:', error));
});

// Hide tooltip when clicking outside the map or tooltip
document.addEventListener("click", function (event) {
  if (!event.target.closest("svg") && !event.target.closest("#map-tooltip")) {
    tooltip.style.display = "none";
  }
});
