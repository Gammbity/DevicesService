document.addEventListener("DOMContentLoaded", async () => {
  // Token va foydalanuvchi ma'lumotlarini olish
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail");

  // Token yoki rol to‘g‘ri emas bo‘lsa, login sahifasiga yo‘naltirish
  if (!token || userRole !== "manager") {
    window.location.href = "/login.html";
    return;
  }

  // Foydalanuvchi emailini ko‘rsatish
  if (userEmail) {
    document.getElementById("user-email").textContent = userEmail;
  }

  // Ma'lumotlarni yuklash
  try {
    await Promise.all([
      loadApplications(token),
      loadProducts(token),
      loadStatistics(token),
    ]);
  } catch (error) {
    showError("Ma'lumotlarni yuklashda xato yuz berdi.");
    console.error("Error loading data:", error);
  }

  // Chartlarni ishga tushirish
  initializeCharts();

  // Navigatsiyani sozlash
  setupNavigation();

  // Formalarni sozlash
  setupFormSubmissions(token);

  // Logout knopkasi
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    window.location.href = "/login.html";
  });

  // Quick action knopkalari
  document
    .getElementById("view-applications-btn")
    .addEventListener("click", () => {
      showSection("applications-content");
      setActiveNavItem("applications-link");
    });

  document.getElementById("add-service-btn").addEventListener("click", () => {
    showSection("add-service-content");
    setActiveNavItem("add-service-link");
  });

  document.getElementById("view-products-btn").addEventListener("click", () => {
    showSection("products-content");
    setActiveNavItem("products-link");
  });

  document
    .getElementById("view-statistics-btn")
    .addEventListener("click", () => {
      showSection("statistics-content");
      setActiveNavItem("statistics-link");
    });

  // Modal yopish knopkalari
  const closeButtons = document.querySelectorAll(".close");
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      this.closest(".modal").style.display = "none";
    });
  });

  // Modal tashqarisida bosilganda yopish
  window.addEventListener("click", (event) => {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  });

  // Mahsulot qo‘shish knopkasi
  document.getElementById("add-product-btn").addEventListener("click", () => {
    document.getElementById("add-product-modal").style.display = "block";
  });

  // Bekor qilish knopkalari
  document
    .getElementById("cancel-service-btn")
    .addEventListener("click", () => {
      document.getElementById("service-form").reset();
      showSection("dashboard-content");
      setActiveNavItem("dashboard-link");
    });

  document
    .getElementById("cancel-product-btn")
    .addEventListener("click", () => {
      document.getElementById("add-product-form").reset();
      document.getElementById("add-product-modal").style.display = "none";
    });

  document.getElementById("cancel-edit-btn").addEventListener("click", () => {
    document.getElementById("edit-application-modal").style.display = "none";
  });

  document
    .getElementById("cancel-edit-product-btn")
    .addEventListener("click", () => {
      document.getElementById("edit-product-modal").style.display = "none";
    });

  document.getElementById("cancel-delete-btn").addEventListener("click", () => {
    document.getElementById("delete-confirmation-modal").style.display = "none";
  });

  // Mahsulotni o‘chirishni tasdiqlash
  document
    .getElementById("confirm-delete-btn")
    .addEventListener("click", () => {
      const productId = document.getElementById("delete-product-id").value;
      deleteProduct(productId, token);
    });

  // Status o‘zgarishi uchun hodisa tinglovchisi
  document
    .getElementById("edit-status")
    .addEventListener("change", function () {
      const rejectionReasonGroup = document.getElementById(
        "rejection-reason-group"
      );
      if (this.value === "rejected") {
        rejectionReasonGroup.style.display = "block";
        document
          .getElementById("rejection-reason")
          .setAttribute("required", "required");
      } else {
        rejectionReasonGroup.style.display = "none";
        document.getElementById("rejection-reason").removeAttribute("required");
      }
    });

  // Ariza qidirish va filtrlash
  document
    .getElementById("search-applications")
    .addEventListener("input", () => filterApplications(token));
  document
    .getElementById("status-filter")
    .addEventListener("change", () => filterApplications(token));

  // Mahsulot qidirish va filtrlash
  document.getElementById("search-products").addEventListener("input", () => {
    filterProducts(token);
  });
  document
    .getElementById("category-filter")
    .addEventListener("change", () => filterProducts(token));
});

// Ariza kartasini yaratish
function createApplicationCard(application) {
  const card = document.createElement("div");
  card.className = "application-card";
  card.dataset.id = application._id;

  const statusMap = {
    pending: { text: "Pending", class: "status-pending" },
    "in-progress": { text: "In Progress", class: "status-in-progress" },
    completed: { text: "Completed", class: "status-completed" },
    rejected: { text: "Rejected", class: "status-rejected" },
  };

  const issueTypeMap = {
    hardware: "Hardware Issue",
    software: "Software Issue",
    both: "Hardware & Software Issue",
    "not-sure": "Not Specified",
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleString("default", { month: "long" })} ${date.getDate()}, ${date.getFullYear()}`;
  };
  const createdDate = formatDate(application.createdAt);

  let rejectionHtml = "";
  if (application.status === "rejected" && application.rejectionReason) {
    rejectionHtml = `
      <div class="application-rejection">
        <p><strong>Rejection Reason:</strong> ${application.rejectionReason}</p>
      </div>
    `;
  }

  card.innerHTML = `
    <div class="application-header">
      <h3 class="application-title">${application.deviceName}</h3>
      <span class="application-status ${statusMap[application.status].class}">${statusMap[application.status].text}</span>
    </div>
    <div class="application-info">
      <p><i class="fas fa-user"></i> ${application.email}</p>
      <p><i class="fas fa-tag"></i> ${application.problemType}</p>
      <p><i class="fas fa-laptop-code"></i> ${issueTypeMap[application.issueType]}</p>
      <p><i class="fas fa-map-marker-alt"></i> ${application.location}</p>
    </div>
    <div class="application-description">
      <p>${application.description}</p>
    </div>
    ${rejectionHtml}
    <div class="application-footer">
      <span><i class="far fa-calendar-alt"></i> ${createdDate}</span>
      <span>ID: ${application._id.slice(-6)}</span>
    </div>
    <div class="application-actions">
      <button class="btn primary-btn edit-application-btn" data-id="${application._id}">
        <i class="fas fa-edit"></i> Edit
      </button>
      <button class="btn secondary-btn reject-application-btn" data-id="${application._id}">
        <i class="fas fa-times"></i> Reject
      </button>
    </div>
  `;

  return card;
}

// Mahsulot kartasini yaratish
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.id = product._id;

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="product-image">
    <div class="product-details">
      <span class="product-category">${product.category}</span>
      <h3 class="product-name">${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <p class="product-price">$${product.price.toFixed(2)}</p>
      <p class="product-stock">In Stock: ${product.stock}</p>
      <div class="product-actions">
        <button class="btn small-btn primary-btn edit-product-btn" data-id="${product._id}">Edit</button>
        <button class="btn small-btn secondary-btn delete-product-btn" data-id="${product._id}">Delete</button>
      </div>
    </div>
  `;

  return card;
}

// Dinamik elementlar uchun hodisa tinglovchilari
document.addEventListener("click", async (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  const token = localStorage.getItem("authToken");

  // Ariza tahrirlash
  if (target.classList.contains("edit-application-btn")) {
    const appId = target.dataset.id;
    try {
      const response = await fetch(`/api/get-applications?token=${token}`);
      const result = await response.json();
      if (result.success) {
        const application = result.applications.find((app) => app._id === appId);
        if (application) {
          openEditApplicationModal(application);
        } else {
          showError("Ariza topilmadi.");
        }
      } else {
        showError(result.message || "Arizalarni olishda xato.");
      }
    } catch (error) {
      showError("Server bilan aloqa xatosi.");
      console.error("Error fetching applications:", error);
    }
  }

  // Ariza rad etish
  if (target.classList.contains("reject-application-btn")) {
    const appId = target.dataset.id;
    try {
      const response = await fetch(`/api/get-applications?token=${token}`);
      const result = await response.json();
      if (result.success) {
        const application = result.applications.find((app) => app._id === appId);
        if (application) {
          openEditApplicationModal(application, true);
        } else {
          showError("Ariza topilmadi.");
        }
      } else {
        showError(result.message || "Arizalarni olishda xato.");
      }
    } catch (error) {
      showError("Server bilan aloqa xatosi.");
      console.error("Error fetching applications:", error);
    }
  }

  // Mahsulot tahrirlash
  if (target.classList.contains("edit-product-btn")) {
    const productId = target.dataset.id;
    try {
      const response = await fetch(`/api/get-products?token=${token}`);
      const result = await response.json();
      if (result.success) {
        const product = result.products.find((p) => p._id === productId);
        if (product) {
          openEditProductModal(product);
        } else {
          showError("Mahsulot topilmadi.");
        }
      } else {
        showError(result.message || "Mahsulotlarni olishda xato.");
      }
    } catch (error) {
      showError("Server bilan aloqa xatosi.");
      console.error("Error fetching products:", error);
    }
  }

  // Mahsulot o‘chirish
  if (target.classList.contains("delete-product-btn")) {
    const productId = target.dataset.id;
    openDeleteConfirmationModal(productId);
  }
});

// Ariza yuklash
async function loadApplications(token) {
  try {
    const response = await fetch(`/api/get-applications?token=${token}`);
    const result = await response.json();
    if (result.success) {
      displayApplications(result.applications);
      updateDashboardStats(result.applications);
    } else {
      showError(result.message || "Arizalarni yuklashda xato.");
    }
  } catch (error) {
    showError("Server bilan aloqa xatosi.");
    console.error("Error loading applications:", error);
  }
}

// Arizalarni ko‘rsatish
function displayApplications(applications) {
  const applicationsContainer = document.getElementById(
    "applications-container"
  );
  const noApplicationsMessage = document.getElementById(
    "no-applications-message"
  );

  applicationsContainer.innerHTML = "";

  if (applications.length === 0) {
    applicationsContainer.appendChild(noApplicationsMessage);
    return;
  }

  if (noApplicationsMessage) {
    noApplicationsMessage.remove();
  }

  applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  applications.forEach((application) => {
    const applicationCard = createApplicationCard(application);
    applicationsContainer.appendChild(applicationCard);
  });
}

// Ariza tahrirlash modalini ochish
function openEditApplicationModal(application, rejectMode = false) {
  document.getElementById("edit-application-id").value = application._id;
  document.getElementById("edit-device-name").value = application.deviceName;
  document.getElementById("edit-problem-type").value = application.problemType;
  document.getElementById("edit-issue-type").value = application.issueType;
  document.getElementById("edit-description").value = application.description;
  document.getElementById("edit-location").value = application.location;
  document.getElementById("edit-status").value = rejectMode
    ? "rejected"
    : application.status;

  const rejectionReasonGroup = document.getElementById("rejection-reason-group");
  if (rejectMode || application.status === "rejected") {
    rejectionReasonGroup.style.display = "block";
    document
      .getElementById("rejection-reason")
      .setAttribute("required", "required");
    if (application.rejectionReason) {
      document.getElementById("rejection-reason").value =
        application.rejectionReason;
    }
  } else {
    rejectionReasonGroup.style.display = "none";
    document.getElementById("rejection-reason").removeAttribute("required");
  }

  document.getElementById("edit-application-modal").style.display = "block";
}

// Arizalarni filtrlash
async function filterApplications(token) {
  const searchTerm = document
    .getElementById("search-applications")
    .value.toLowerCase();
  const statusFilter = document.getElementById("status-filter").value;

  try {
    const response = await fetch(`/api/get-applications?token=${token}`);
    const result = await response.json();
    if (result.success) {
      let applications = result.applications;

      if (searchTerm) {
        applications = applications.filter(
          (application) =>
            application.deviceName.toLowerCase().includes(searchTerm) ||
            application.problemType.toLowerCase().includes(searchTerm) ||
            application.description.toLowerCase().includes(searchTerm) ||
            application.email.toLowerCase().includes(searchTerm) ||
            application.location.toLowerCase().includes(searchTerm)
        );
      }

      if (statusFilter !== "all") {
        applications = applications.filter(
          (application) => application.status === statusFilter
        );
      }

      displayApplications(applications);
    } else {
      showError(result.message || "Arizalarni filtrlashda xato.");
    }
  } catch (error) {
    showError("Server bilan aloqa xatosi.");
    console.error("Error filtering applications:", error);
  }
}

// Mahsulotlarni yuklash
async function loadProducts(token) {
  try {
    const response = await fetch(`/api/get-products?token=${token}`);
    const result = await response.json();
    if (result.success) {
      displayProducts(result.products);
      updateDashboardStats([], result.products);
    } else {
      showError(result.message || "Mahsulotlarni yuklashda xato.");
    }
  } catch (error) {
    showError("Server bilan aloqa xatosi.");
    console.error("Error loading products:", error);
  }
}

// Mahsulotlarni ko‘rsatish
function displayProducts(products) {
  const productsContainer = document.getElementById("products-container");
  productsContainer.innerHTML = "";

  products.sort((a, b) => {
    if (a.category === b.category) {
      return a.name.localeCompare(b.name);
    }
    return a.category.localeCompare(b.category);
  });

  products.forEach((product) => {
    const productCard = createProductCard(product);
    productsContainer.appendChild(productCard);
  });
}

// Mahsulot tahrirlash modalini ochish
function openEditProductModal(product) {
  document.getElementById("edit-product-id").value = product._id;
  document.getElementById("edit-product-name").value = product.name;
  document.getElementById("edit-product-category").value = product.category;
  document.getElementById("edit-product-description").value = product.description;
  document.getElementById("edit-product-price").value = product.price;
  document.getElementById("edit-product-stock").value = product.stock;
  document.getElementById("edit-product-image").value = product.image;

  document.getElementById("edit-product-modal").style.display = "block";
}

// Mahsulot o‘chirish modalini ochish
function openDeleteConfirmationModal(productId) {
  document.getElementById("delete-product-id").value = productId;
  document.getElementById("delete-confirmation-modal").style.display = "block";
}

// Mahsulotni o‘chirish
async function deleteProduct(productId, token) {
  try {
    const response = await fetch("/api/delete-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, productId }),
    });
    const result = await response.json();
    if (result.success) {
      showSuccess("Mahsulot muvaffaqiyatli o‘chirildi!");
      document.getElementById("delete-confirmation-modal").style.display = "none";
      loadProducts(token);
    } else {
      showError(result.message || "Mahsulotni o‘chirishda xato.");
    }
  } catch (error) {
    showError("Server bilan aloqa xatosi.");
    console.error("Error deleting product:", error);
  }
}

// Mahsulotlarni filtrlash
async function filterProducts(token) {
  const searchTerm = document
    .getElementById("search-products")
    .value.toLowerCase();
  const categoryFilter = document.getElementById("category-filter").value;

  try {
    const response = await fetch(`/api/get-products?token=${token}`);
    const result = await response.json();
    if (result.success) {
      let products = result.products;

      if (searchTerm) {
        products = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
      }

      if (categoryFilter !== "all") {
        products = products.filter(
          (product) => product.category === categoryFilter
        );
      }

      displayProducts(products);
    } else {
      showError(result.message || "Mahsulotlarni filtrlashda xato.");
    }
  } catch (error) {
    showError("Server bilan aloqa xatosi.");
    console.error("Error filtering products:", error);
  }
}

// Statistikani yuklash
async function loadStatistics(token) {
  try {
    const response = await fetch(`/api/get-statistics?token=${token}`);
    const result = await response.json();
    if (result.success) {
      updateStatisticsDisplay(result.statistics);
      updateCharts(result.statistics);
    } else {
      showError(result.message || "Statistikani yuklashda xato.");
    }
  } catch (error) {
    showError("Server bilan aloqa xatosi.");
    console.error("Error loading statistics:", error);
  }
}

// Statistikani ko‘rsatish
function updateStatisticsDisplay(statistics) {
  document.getElementById("stats-total-applications").textContent =
    statistics.totalApplications;
  document.getElementById("stats-recent-applications").textContent =
    statistics.recentApplications;
  document.getElementById("stats-total-products").textContent =
    statistics.totalProducts;
}

// Chartlarni ishga tushirish
function initializeCharts() {
  const locationChartCtx = document
    .getElementById("location-chart")
    .getContext("2d");
  const statusChartCtx = document.getElementById("status-chart").getContext("2d");
  const statsLocationChartCtx = document
    .getElementById("stats-location-chart")
    .getContext("2d");
  const statsStatusChartCtx = document
    .getElementById("stats-status-chart")
    .getContext("2d");
  const statsIssueTypeChartCtx = document
    .getElementById("stats-issue-type-chart")
    .getContext("2d");

  window.locationChart = new Chart(locationChartCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Applications by Location",
          data: [],
          backgroundColor: "rgba(74, 108, 247, 0.6)",
          borderColor: "rgba(74, 108, 247, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });

  window.statusChart = new Chart(statusChartCtx, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          label: "Applications by Status",
          data: [],
          backgroundColor: [
            "rgba(255, 193, 7, 0.6)", // pending
            "rgba(0, 123, 255, 0.6)", // in-progress
            "rgba(40, 167, 69, 0.6)", // completed
            "rgba(220, 53, 69, 0.6)", // rejected
          ],
          borderColor: [
            "rgba(255, 193, 7, 1)",
            "rgba(0, 123, 255, 1)",
            "rgba(40, 167, 69, 1)",
            "rgba(220, 53, 69, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  });

  window.statsLocationChart = new Chart(statsLocationChartCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Applications by Location",
          data: [],
          backgroundColor: "rgba(74, 108, 247, 0.6)",
          borderColor: "rgba(74, 108, 247, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });

  window.statsStatusChart = new Chart(statsStatusChartCtx, {
    type: "pie",
    data: {
      labels: [],
      datasets: [
        {
          label: "Applications by Status",
          data: [],
          backgroundColor: [
            "rgba(255, 193, 7, 0.6)", // pending
            "rgba(0, 123, 255, 0.6)", // in-progress
            "rgba(40, 167, 69, 0.6)", // completed
            "rgba(220, 53, 69, 0.6)", // rejected
          ],
          borderColor: [
            "rgba(255, 193, 7, 1)",
            "rgba(0, 123, 255, 1)",
            "rgba(40, 167, 69, 1)",
            "rgba(220, 53, 69, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  });

  window.statsIssueTypeChart = new Chart(statsIssueTypeChartCtx, {
    type: "pie",
    data: {
      labels: [],
      datasets: [
        {
          label: "Applications by Issue Type",
          data: [],
          backgroundColor: [
            "rgba(74, 108, 247, 0.6)", // hardware
            "rgba(16, 185, 129, 0.6)", // software
            "rgba(245, 158, 11, 0.6)", // both
            "rgba(107, 114, 128, 0.6)", // not-sure
          ],
          borderColor: [
            "rgba(74, 108, 247, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(107, 114, 128, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  });
}

// Chartlarni yangilash
function updateCharts(statistics) {
  const locationLabels = statistics.locationStats.map((stat) => stat._id);
  const locationData = statistics.locationStats.map((stat) => stat.count);

  window.locationChart.data.labels = locationLabels;
  window.locationChart.data.datasets[0].data = locationData;
  window.locationChart.update();

  window.statsLocationChart.data.labels = locationLabels;
  window.statsLocationChart.data.datasets[0].data = locationData;
  window.statsLocationChart.update();

  const statusLabels = statistics.statusStats.map((stat) => {
    const statusMap = {
      pending: "Pending",
      "in-progress": "In Progress",
      completed: "Completed",
      rejected: "Rejected",
    };
    return statusMap[stat._id] || stat._id;
  });
  const statusData = statistics.statusStats.map((stat) => stat.count);

  window.statusChart.data.labels = statusLabels;
  window.statusChart.data.datasets[0].data = statusData;
  window.statusChart.update();

  window.statsStatusChart.data.labels = statusLabels;
  window.statsStatusChart.data.datasets[0].data = statusData;
  window.statsStatusChart.update();

  const issueTypeLabels = statistics.issueTypeStats.map((stat) => {
    const issueTypeMap = {
      hardware: "Hardware",
      software: "Software",
      both: "Hardware & Software",
      "not-sure": "Not Specified",
    };
    return issueTypeMap[stat._id] || stat._id;
  });
  const issueTypeData = statistics.issueTypeStats.map((stat) => stat.count);

  window.statsIssueTypeChart.data.labels = issueTypeLabels;
  window.statsIssueTypeChart.data.datasets[0].data = issueTypeData;
  window.statsIssueTypeChart.update();
}

// Dashboard statistikasini yangilash
function updateDashboardStats(applications, products) {
  document.getElementById("total-applications").textContent =
    applications.length;
  document.getElementById("in-progress").textContent = applications.filter(
    (app) => app.status === "in-progress"
  ).length;
  document.getElementById("completed").textContent = applications.filter(
    (app) => app.status === "completed"
  ).length;
  document.getElementById("total-products").textContent = products.length;
}

// Navigatsiyani sozlash
function setupNavigation() {
  document.getElementById("dashboard-link").addEventListener("click", (e) => {
    e.preventDefault();
    showSection("dashboard-content");
    setActiveNavItem("dashboard-link");
  });

  document
    .getElementById("applications-link")
    .addEventListener("click", (e) => {
      e.preventDefault();
      showSection("applications-content");
      setActiveNavItem("applications-link");
    });

  document.getElementById("add-service-link").addEventListener("click", (e) => {
    e.preventDefault();
    showSection("add-service-content");
    setActiveNavItem("add-service-link");
  });

  document.getElementById("products-link").addEventListener("click", (e) => {
    e.preventDefault();
    showSection("products-content");
    setActiveNavItem("products-link");
  });

  document.getElementById("statistics-link").addEventListener("click", (e) => {
    e.preventDefault();
    showSection("statistics-content");
    setActiveNavItem("statistics-link");
  });

  document.getElementById("messages-link").addEventListener("click", (e) => {
    e.preventDefault();
    showSection("messages-content");
    setActiveNavItem("messages-link");
  });

  document.getElementById("settings-link").addEventListener("click", (e) => {
    e.preventDefault();
    showSection("settings-content");
    setActiveNavItem("settings-link");
  });
}

// Bo‘limni ko‘rsatish
function showSection(sectionId) {
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");
}

// Faol navigatsiya elementini belgilash
function setActiveNavItem(itemId) {
  const navItems = document.querySelectorAll(".sidebar-nav ul li");
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  document.getElementById(itemId).classList.add("active");
}

// Muvaffaqiyat xabarini ko‘rsatish
function showSuccess(message, title = "Muvaffaqiyat") {
  if (window.showNotification) {
    window.showNotification("success", title, message);
  } else {
    alert(`${title}: ${message}`);
  }
}

// Xato xabarini ko‘rsatish
function showError(message, title = "Xato") {
  if (window.showNotification) {
    window.showNotification("error", title, message);
  } else {
    alert(`${title}: ${message}`);
  }
}

// Formalarni sozlash
function setupFormSubmissions(token) {
  // Xizmat qo‘shish formasi
  const serviceForm = document.getElementById("service-form");
  if (serviceForm) {
    serviceForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById("service-name").value,
        category: document.getElementById("service-category").value,
        description: document.getElementById("service-description").value,
        price: Number.parseFloat(
          document.getElementById("service-price").value
        ),
        duration: Number.parseFloat(
          document.getElementById("service-duration").value
        ),
      };

      try {
        const response = await fetch("/api/add-service", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, service: formData }),
        });
        const result = await response.json();
        if (result.success) {
          showSuccess("Xizmat muvaffaqiyatli qo‘shildi!");
          serviceForm.reset();
          showSection("dashboard-content");
          setActiveNavItem("dashboard-link");
        } else {
          showError(result.message || "Xizmat qo‘shishda xato.");
        }
      } catch (error) {
        showError("Server bilan aloqa xatosi.");
        console.error("Error adding service:", error);
      }
    });
  }

  // Mahsulot qo‘shish formasi
  const addProductForm = document.getElementById("add-product-form");
  if (addProductForm) {
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById("product-name").value,
        category: document.getElementById("product-category").value,
        description: document.getElementById("product-description").value,
        price: Number.parseFloat(
          document.getElementById("product-price").value
        ),
        stock: Number.parseInt(document.getElementById("product-stock").value),
        image:
          document.getElementById("product-image").value ||
          "https://via.placeholder.com/150",
      };

      try {
        const response = await fetch("/api/add-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, product: formData }),
        });
        const result = await response.json();
        if (result.success) {
          showSuccess("Mahsulot muvaffaqiyatli qo‘shildi!");
          addProductForm.reset();
          document.getElementById("add-product-modal").style.display = "none";
          loadProducts(token);
        } else {
          showError(result.message || "Mahsulot qo‘shishda xato.");
        }
      } catch (error) {
        showError("Server bilan aloqa xatosi.");
        console.error("Error adding product:", error);
      }
    });
  }

  // Mahsulot tahrirlash formasi
  const editProductForm = document.getElementById("edit-product-form");
  if (editProductForm) {
    editProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const productId = document.getElementById("edit-product-id").value;
      const updates = {
        name: document.getElementById("edit-product-name").value,
        category: document.getElementById("edit-product-category").value,
        description: document.getElementById("edit-product-description").value,
        price: Number.parseFloat(
          document.getElementById("edit-product-price").value
        ),
        stock: Number.parseInt(
          document.getElementById("edit-product-stock").value
        ),
        image: document.getElementById("edit-product-image").value,
      };

      try {
        const response = await fetch("/api/update-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, productId, updates }),
        });
        const result = await response.json();
        if (result.success) {
          showSuccess("Mahsulot muvaffaqiyatli yangilandi!");
          document.getElementById("edit-product-modal").style.display = "none";
          loadProducts(token);
        } else {
          showError(result.message || "Mahsulotni yangilashda xato.");
        }
      } catch (error) {
        showError("Server bilan aloqa xatosi.");
        console.error("Error updating product:", error);
      }
    });
  }

  // Ariza tahrirlash formasi
  const editApplicationForm = document.getElementById("edit-application-form");
  if (editApplicationForm) {
    editApplicationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const applicationId = document.getElementById(
        "edit-application-id"
      ).value;
      const status = document.getElementById("edit-status").value;

      const updates = {
        deviceName: document.getElementById("edit-device-name").value,
        problemType: document.getElementById("edit-problem-type").value,
        issueType: document.getElementById("edit-issue-type").value,
        description: document.getElementById("edit-description").value,
        location: document.getElementById("edit-location").value,
        status: status,
      };

      if (status === "rejected") {
        updates.rejectionReason =
          document.getElementById("rejection-reason").value;
      }

      try {
        const response = await fetch("/api/update-application", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, applicationId, updates }),
        });
        const result = await response.json();
        if (result.success) {
          showSuccess("Ariza muvaffaqiyatli yangilandi!");
          document.getElementById("edit-application-modal").style.display =
            "none";
          loadApplications(token);
          updateDashboardStats();
        } else {
          showError(result.message || "Arizani yangilashda xato.");
        }
      } catch (error) {
        showError("Server bilan aloqa xatosi.");
        console.error("Error updating application:", error);
      }
    });
  }

  // Xabar yuborish formasi
  const sendMessageForm = document.getElementById("send-message-form");
  if (sendMessageForm) {
    sendMessageForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        receiver: document.getElementById("message-recipient").value,
        subject: document.getElementById("message-subject").value,
        content: document.getElementById("message-content").value,
      };

      try {
        const response = await fetch("/api/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, ...formData }),
        });
        const result = await response.json();
        if (result.success) {
          showSuccess("Xabar muvaffaqiyatli yuborildi!");
          sendMessageForm.reset();
        } else {
          showError(result.message || "Xabar yuborishda xato.");
        }
      } catch (error) {
        showError("Server bilan aloqa xatosi.");
        console.error("Error sending message:", error);
      }
    });
  }

  // Parolni o‘zgartirish formasi
  const changePasswordForm = document.getElementById("change-password-form");
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const currentPassword = document.getElementById("current-password").value;
      const newPassword = document.getElementById("new-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (newPassword !== confirmPassword) {
        showError("Yangi parollar mos kelmadi.");
        return;
      }

      try {
        const response = await fetch("/api/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, currentPassword, newPassword }),
        });
        const result = await response.json();
        if (result.success) {
          showSuccess("Parol muvaffaqiyatli o‘zgartirildi!");
          changePasswordForm.reset();
        } else {
          showError(result.message || "Parolni o‘zgartirishda xato.");
        }
      } catch (error) {
        showError("Server bilan aloqa xatosi.");
        console.error("Error changing password:", error);
      }
    });
  }
}