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
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Load data from CSV and populate dropdowns
function loadInfrastructureData() {
  Papa.parse("infrastructure.csv", {
    header: true,
    download: true,
    complete: function (results) {
      const data = results.data;
      const districtSet = new Set();
      const categorySet = new Set();

      // Collect distinct districts and categories
      data.forEach((row) => {
        if (row["District"]) {
          districtSet.add(formatName(row["District"].trim()));
        }
        if (row["Category"]) {
          categorySet.add(formatName(row["Category"].trim()));
        }
      });

      // Sort and populate the districts dropdown
      const sortedDistricts = Array.from(districtSet).sort();
      const districtList = document.getElementById("districtList");

      sortedDistricts.forEach((district) => {
        const item = document.createElement("div");
        item.classList.add("dropdown-item");
        item.textContent = district;
        item.onclick = () => {
          document.getElementById("selectedDistrict").textContent = district;
          districtList.style.display = "none";
        };
        districtList.appendChild(item);
      });

      // Sort and populate the categories dropdown
      const sortedCategories = Array.from(categorySet).sort();
      const categoryList = document.getElementById("categoryList");

      sortedCategories.forEach((category) => {
        const item = document.createElement("div");
        item.classList.add("dropdown-item");
        item.textContent = category;
        item.onclick = () => {
          document.getElementById("selectedCategory").textContent = category;
          categoryList.style.display = "none";
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

  // District Dropdown Logic
  const selectedDistrict = document.getElementById("selectedDistrict");
  const districtList = document.getElementById("districtList");
  const districtDropdown = document.getElementById("districtDropdown");

  selectedDistrict.addEventListener("click", () => {
    districtList.style.display = districtList.style.display === "block" ? "none" : "block";
  });

  // Category Dropdown Logic
  const selectedCategory = document.getElementById("selectedCategory");
  const categoryList = document.getElementById("categoryList");
  const categoryDropdown = document.getElementById("categoryDropdown");

  selectedCategory.addEventListener("click", () => {
    categoryList.style.display = categoryList.style.display === "block" ? "none" : "block";
  });

  const categoryItems = categoryList.querySelectorAll(".dropdown-item");
  categoryItems.forEach(item => {
    item.addEventListener("click", () => {
      selectedCategory.textContent = item.textContent;
      categoryList.style.display = "none";
    });
  });

  // Close dropdowns on outside click
  window.addEventListener("click", function (e) {
    if (!districtDropdown.contains(e.target)) {
      districtList.style.display = "none";
    }
    if (!categoryDropdown.contains(e.target)) {
      categoryList.style.display = "none";
    }
  });
};


