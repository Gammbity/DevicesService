document.addEventListener("DOMContentLoaded", async () => {
  // URL parametridan tokenni olish
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get("token");

  // localStorage'dan token va foydalanuvchi ma'lumotlarini olish
  let token = localStorage.getItem("authToken");
  let userRole = localStorage.getItem("userRole");
  let userEmail = localStorage.getItem("userEmail");
  
  

  // Agar token URL'da bo‘lsa, uni localStorage'ga saqlash
  if (tokenFromUrl) {
    try {
      // Backenddan tokenni tekshirish
      const response = await fetch(`/api/verify-token?token=${tokenFromUrl}`);
      const result = await response.json();

      if (result.success) {
        // Token to‘g‘ri bo‘lsa, localStorage'ga saqlash
        localStorage.setItem("authToken", tokenFromUrl);
        localStorage.setItem("userRole", result.role);
        localStorage.setItem("userEmail", result.email);

        // Yangilangan ma'lumotlarni o‘qish
        token = tokenFromUrl;
        userRole = result.role;
        userEmail = result.email;
      } else {
        // Token noto‘g‘ri bo‘lsa, login sahifasiga yo‘naltirish
        window.location.href = "/login.html";
        return;
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      window.location.href = "/login.html";
      return;
    }
  }

  // Token yoki userRole to‘g‘ri emas bo‘lsa, login sahifasiga yo‘naltirish
  // if (!token || userRole !== "client") {
  //   window.location.href = "/login.html";
  //   return;
  // }

  // Foydalanuvchi emailini ko‘rsatish
  if (username) {
    document.getElementById("user-email").textContent = username;
  }

  // Load applications
  loadApplications(token); // Tokenni funksiyaga uzatish

  // Load messages
  loadMessages(token); // Tokenni funksiyaga uzatish

  // Update dashboard stats
  updateDashboardStats();

  // Setup navigation
  setupNavigation();

  // Setup form submissions
  setupFormSubmissions(token); // Tokenni funksiyaga uzatish

  // Setup logout button
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    window.location.href = "../../frontend/login.html";
  });

  // Setup quick action buttons
  document
    .getElementById("new-application-btn")
    .addEventListener("click", () => {
      showSection("submit-application-content");
      setActiveNavItem("submit-application-link");
    });

  document
    .getElementById("view-applications-btn")
    .addEventListener("click", () => {
      showSection("my-applications-content");
      setActiveNavItem("my-applications-link");
    });

  document.getElementById("view-messages-btn").addEventListener("click", () => {
    showSection("messages-content");
    setActiveNavItem("messages-link");
  });

  // Setup modal close buttons
  const closeButtons = document.querySelectorAll(".close");
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal");
      modal.style.display = "none";
    });
  });

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    const modals = document.querySelectorAll(".modal");
    modals.forEach((modal) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  });

  // Setup message modal close button
  document
    .getElementById("message-modal-close")
    .addEventListener("click", () => {
      document.getElementById("message-modal").style.display = "none";
    });

  // Setup search and filter for applications
  const searchApplications = document.getElementById("search-applications");
  if (searchApplications) {
    searchApplications.addEventListener("input", () => {
      filterApplications();
    });
  }

  const statusFilter = document.getElementById("status-filter");
  if (statusFilter) {
    statusFilter.addEventListener("change", () => {
      filterApplications();
    });
  }
});

// Setup navigation between sections
function setupNavigation() {
  document.getElementById("dashboard-link").addEventListener("click", (e) => {
    e.preventDefault();
    showSection("dashboard-content");
    setActiveNavItem("dashboard-link");
  });

  document
    .getElementById("submit-application-link")
    .addEventListener("click", (e) => {
      e.preventDefault();
      showSection("submit-application-content");
      setActiveNavItem("submit-application-link");
    });

  document
    .getElementById("my-applications-link")
    .addEventListener("click", (e) => {
      e.preventDefault();
      showSection("my-applications-content");
      setActiveNavItem("my-applications-link");
    });

  document.getElementById("messages-link").addEventListener("click", (e) => {
    e.preventDefault();
    showSection("messages-content");
    setActiveNavItem("messages-link");
  });
}

// Show a specific section and hide others
function showSection(sectionId) {
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");
}

// Set active navigation item
function setActiveNavItem(itemId) {
  const navItems = document.querySelectorAll(".sidebar-nav ul li");
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  document.getElementById(itemId).classList.add("active");
}

// Setup form submissions
function setupFormSubmissions(token) {
  // Application form submission
  const applicationForm = document.getElementById("application-form");
  if (applicationForm) {
    applicationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        name: document.getElementById("device-name").value,
        description: document.getElementById("description").value,
        location: document.getElementById("location").value,
      };
      function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.startsWith(name + "=")) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }

    const csrftoken = getCookie("csrftoken");

      try {
        // Backendga so‘rov yuborish
        const response = await fetch("http://127.0.0.1:8000/api/v1/main/device/create/", {
          method: "POST",
          headers: { "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify(formData),
          credentials: "include"
        });

        const result = await response.json();

        if (result.success) {
          showSuccess("Application submitted successfully!");
          applicationForm.reset();
          loadApplications(token); // Yangi arizalarni yuklash
          showSection("dashboard-content");
          setActiveNavItem("dashboard-link");
        } else {
          showError(result.message || "Failed to submit application");
        }
      } catch (error) {
        console.error("Error submitting application:", error);
        showError("An error occurred. Please try again.");
      }
    });
  }

  // Cancel application button
  const cancelApplicationBtn = document.getElementById(
    "cancel-application-btn"
  );
  if (cancelApplicationBtn) {
    cancelApplicationBtn.addEventListener("click", () => {
      applicationForm.reset();
      showSection("dashboard-content");
      setActiveNavItem("dashboard-link");
    });
  }
}

// Load applications from backend
async function loadApplications(token) {
  try {
    const response = await fetch(`/api/get-applications?token=${token}`);
    const result = await response.json();

    if (result.success) {
      // Backenddan olingan arizalarni localStorage'ga saqlash
      localStorage.setItem(
        "userApplications",
        JSON.stringify(result.applications)
      );

      // Ariza ma'lumotlarini ko‘rsatish
      displayApplications(result.applications, "applications-container");

      // Dashboarddagi so‘nggi arizalarni yangilash
      displayRecentApplications(result.applications);

      // Statistikani yangilash
      updateDashboardStats();
    } else {
      showError(result.message || "Failed to load applications");
    }
  } catch (error) {
    console.error("Error loading applications:", error);
    showError("An error occurred while loading applications.");
  }
}

// Display applications in the specified container
function displayApplications(applications, containerId) {
  const container = document.getElementById(containerId);

  // Clear existing content
  container.innerHTML = "";

  // Show no applications message if no applications
  if (applications.length === 0) {
    const noApplicationsMessage = document.createElement("div");
    noApplicationsMessage.className = "no-applications-message";
    noApplicationsMessage.innerHTML = `
      <i class="fas fa-clipboard-list"></i>
      <p>No applications found. Submit your first application!</p>
    `;
    container.appendChild(noApplicationsMessage);
    return;
  }

  // Sort applications by date (newest first)
  applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Create and append application cards
  applications.forEach((application) => {
    const applicationCard = createApplicationCard(application);
    container.appendChild(applicationCard);
  });
}

// Display recent applications in dashboard
function displayRecentApplications(applications) {
  // Get only the 3 most recent applications
  const recentApplications = applications
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  displayApplications(recentApplications, "recent-applications-container");
}

// Create an application card element
function createApplicationCard(application) {
  const card = document.createElement("div");
  card.className = "application-card";

  // Map status to display text and class
  const statusMap = {
    pending: { text: "Pending", class: "status-pending" },
    "in-progress": { text: "In Progress", class: "status-in-progress" },
    completed: { text: "Completed", class: "status-completed" },
    rejected: { text: "Rejected", class: "status-rejected" },
  };

  // Map issue type to display text
  const issueTypeMap = {
    hardware: "Hardware Issue",
    software: "Software Issue",
    both: "Hardware & Software Issue",
    "not-sure": "Not Specified",
  };

  // Format created date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
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
      <span class="application-status ${statusMap[application.status].class}">${
    statusMap[application.status].text
  }</span>
    </div>
    <div class="application-info">
      <p><i class="fas fa-tag"></i> ${application.problemType}</p>
      <p><i class="fas fa-laptop-code"></i> ${
        issueTypeMap[application.issueType]
      }</p>
      <p><i class="fas fa-map-marker-alt"></i> ${application.location}</p>
    </div>
    <div class="application-description">
      <p>${application.description}</p>
    </div>
    ${rejectionHtml}
    <div class="application-footer">
      <span><i class="far fa-calendar-alt"></i> ${createdDate}</span>
      <span>ID: ${application._id.toString().slice(-6)}</span>
    </div>
  `;

  return card;
}

// Filter applications based on search and status filter
function filterApplications() {
  const searchTerm = document
    .getElementById("search-applications")
    .value.toLowerCase();
  const statusFilter = document.getElementById("status-filter").value;

  // Get applications from localStorage
  let applications = JSON.parse(
    localStorage.getItem("userApplications") || "[]"
  );

  // Apply search filter
  if (searchTerm) {
    applications = applications.filter(
      (application) =>
        application.deviceName.toLowerCase().includes(searchTerm) ||
        application.problemType.toLowerCase().includes(searchTerm) ||
        application.description.toLowerCase().includes(searchTerm) ||
        application.location.toLowerCase().includes(searchTerm)
    );
  }

  // Apply status filter
  if (statusFilter !== "all") {
    applications = applications.filter(
      (application) => application.status === statusFilter
    );
  }

  // Display filtered applications
  displayApplications(applications, "applications-container");
}

// Update dashboard statistics
function updateDashboardStats() {
  // Get applications from localStorage
  const applications = JSON.parse(
    localStorage.getItem("userApplications") || "[]"
  );

  // Count total applications
  document.getElementById("total-applications").textContent =
    applications.length;

  // Count in-progress applications
  const inProgressCount = applications.filter(
    (application) => application.status === "in-progress"
  ).length;
  document.getElementById("in-progress").textContent = inProgressCount;

  // Count completed applications
  const completedCount = applications.filter(
    (application) => application.status === "completed"
  ).length;
  document.getElementById("completed").textContent = completedCount;
}

// Load messages from backend
async function loadMessages(token) {
  try {
    const response = await fetch(`/api/get-messages?token=${token}`);
    const result = await response.json();

    if (result.success) {
      // Backenddan olingan xabarlarni localStorage'ga saqlash
      localStorage.setItem("userMessages", JSON.stringify(result.messages));

      // Xabarlarni ko‘rsatish
      displayMessages(result.messages);

      // Yangilanmagan xabarlar sonini yangilash
      updateUnreadCount(result.messages);

      // Bildirishnomalarni yangilash
      updateNotifications(result.messages);
    } else {
      showError(result.message || "Failed to load messages");
    }
  } catch (error) {
    console.error("Error loading messages:", error);
    showError("An error occurred while loading messages.");
  }
}

// Display messages in the messages container
function displayMessages(messages) {
  const messagesContainer = document.getElementById("messages-container");

  // Clear existing content
  messagesContainer.innerHTML = "";

  // Show no messages message if no messages
  if (messages.length === 0) {
    const noMessagesMessage = document.createElement("div");
    noMessagesMessage.className = "no-messages-message";
    noMessagesMessage.innerHTML = `
      <i class="fas fa-envelope-open"></i>
      <p>No messages found.</p>
    `;
    messagesContainer.appendChild(noMessagesMessage);
    return;
  }

  // Sort messages by date (newest first)
  messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Create and append message cards
  messages.forEach((message) => {
    const messageCard = createMessageCard(message);
    messagesContainer.appendChild(messageCard);
  });
}

// Create a message card element
function createMessageCard(message) {
  const card = document.createElement("div");
  card.className = "message-card";
  card.dataset.id = message._id;

  if (!message.read) {
    card.classList.add("unread");
  }

  // Format created date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };
  const createdDate = formatDate(message.createdAt);

  card.innerHTML = `
    <div class="message-header">
      <h3 class="message-subject">${message.subject}</h3>
      <div class="message-sender">
        <i class="fas fa-user"></i>
        <span>${message.sender}</span>
      </div>
    </div>
    <div class="message-preview">
      ${message.content}
    </div>
    <div class="message-footer">
      <div class="message-time">
        <i class="far fa-clock"></i>
        <span>${createdDate}</span>
      </div>
      <div class="message-actions">
        <button class="mark-read-btn" title="Mark as Read" ${
          message.read ? "disabled" : ""
        }>
          <i class="fas fa-check"></i>
        </button>
        <button class="delete-btn" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

  // Add event listener to open message modal
  card.addEventListener("click", (e) => {
    // Don't open modal if clicking on action buttons
    if (e.target.closest(".message-actions")) {
      return;
    }

    openMessageModal(message);

    // Mark as read if unread
    if (!message.read) {
      markMessageAsRead(message._id);
    }
  });

  // Add event listener to mark as read button
  const markReadBtn = card.querySelector(".mark-read-btn");
  if (markReadBtn) {
    markReadBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      markMessageAsRead(message._id);
    });
  }

  return card;
}

// Open message modal
function openMessageModal(message) {
  // Set modal content
  document.getElementById("message-modal-subject").textContent =
    message.subject;
  document.getElementById("message-modal-sender").textContent = message.sender;

  // Format date
  const date = new Date(message.createdAt);
  const formattedDate = date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("message-modal-date").textContent = formattedDate;

  // Set message content
  document.getElementById("message-modal-content").textContent =
    message.content;

  // Show modal
  document.getElementById("message-modal").style.display = "block";
}

// Mark message as read
async function markMessageAsRead(messageId) {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch("/api/mark-message-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, messageId }),
    });

    const result = await response.json();

    if (result.success) {
      // Get all messages from localStorage
      const allMessages = JSON.parse(localStorage.getItem("messages") || "[]");

      // Update message
      const updatedMessages = allMessages.map((message) => {
        if (message._id === messageId) {
          return { ...message, read: true };
        }
        return message;
      });

      // Save to localStorage
      localStorage.setItem("messages", JSON.stringify(updatedMessages));

      // Update user messages
      const userEmail = localStorage.getItem("userEmail");
      const userMessages = updatedMessages.filter(
        (msg) => msg.receiver === userEmail
      );
      localStorage.setItem("userMessages", JSON.stringify(userMessages));

      // Update UI
      const messageCard = document.querySelector(
        `.message-card[data-id="${messageId}"]`
      );
      if (messageCard) {
        messageCard.classList.remove("unread");
        const markReadBtn = messageCard.querySelector(".mark-read-btn");
        if (markReadBtn) {
          markReadBtn.setAttribute("disabled", "disabled");
        }
      }

      // Update unread count
      updateUnreadCount(userMessages);

      // Update notifications
      updateNotifications(userMessages);
    } else {
      showError(result.message || "Failed to mark message as read");
    }
  } catch (error) {
    console.error("Error marking message as read:", error);
    showError("An error occurred while marking message as read.");
  }
}

// Update unread count
function updateUnreadCount(messages) {
  const unreadCount = messages.filter((message) => !message.read).length;
  const unreadCountElement = document.getElementById("unread-count");

  if (unreadCount > 0) {
    unreadCountElement.textContent = unreadCount;
    unreadCountElement.style.display = "inline-flex";
  } else {
    unreadCountElement.textContent = "0";
    unreadCountElement.style.display = "none";
  }
}

// Update notifications
function updateNotifications(messages) {
  const unreadMessages = messages.filter((message) => !message.read);
  const notificationCount = unreadMessages.length;
  const notificationCountElement =
    document.getElementById("notification-count");
  const notificationsContainer = document.getElementById(
    "notifications-container"
  );

  // Update notification count
  if (notificationCount > 0) {
    notificationCountElement.textContent = notificationCount;
    notificationCountElement.style.display = "inline-flex";
  } else {
    notificationCountElement.textContent = "0";
    notificationCountElement.style.display = "none";
  }

  // Clear existing notifications
  notificationsContainer.innerHTML = "";

  // Show no notifications message if no unread messages
  if (unreadMessages.length === 0) {
    const noNotifications = document.createElement("div");
    noNotifications.className = "no-notifications";
    noNotifications.innerHTML = `
      <i class="fas fa-bell-slash"></i>
      <p>No new notifications</p>
    `;
    notificationsContainer.appendChild(noNotifications);
    return;
  }

  // Create and append notification items
  unreadMessages.forEach((message) => {
    const notificationItem = createNotificationItem(message);
    notificationsContainer.appendChild(notificationItem);
  });
}

// Create a notification item
function createNotificationItem(message) {
  const item = document.createElement("div");
  item.className = "notification-item unread";
  item.dataset.id = message._id;

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }
  };

  item.innerHTML = `
    <div class="notification-dot"></div>
    <div class="notification-title">${message.subject}</div>
    <div class="notification-message">${message.content}</div>
    <div class="notification-time">${formatTime(message.createdAt)}</div>
  `;

  // Add event listener to open message modal
  item.addEventListener("click", () => {
    openMessageModal(message);
    markMessageAsRead(message._id);
  });

  return item;
}

// Success notification
function showSuccess(message, title = "Success") {
  if (window.showNotification) {
    window.showNotification("success", title, message);
  } else {
    alert(`${title}: ${message}`);
  }
}

// Error notification
function showError(message, title = "Error") {
  if (window.showNotification) {
    window.showNotification("error", title, message);
  } else {
    alert(`${title}: ${message}`);
  }
}
