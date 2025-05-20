/**
 * Notification System
 * Replaces alert() with beautiful notifications
 */

// Create notification
function showNotification(type, title, message, duration = 5000) {
  const container = document.getElementById("notification-container");

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  // Icon based on type
  let iconHtml = "";
  if (type === "success") {
    iconHtml = `
            <div class="notification-icon">
                <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
            </div>
        `;
  } else if (type === "error") {
    iconHtml = `
            <div class="notification-icon">
                <i class="fas fa-times"></i>
            </div>
        `;
  } else if (type === "info") {
    iconHtml = `
            <div class="notification-icon">
                <i class="fas fa-info"></i>
            </div>
        `;
  } else if (type === "warning") {
    iconHtml = `
            <div class="notification-icon">
                <i class="fas fa-exclamation"></i>
            </div>
        `;
  }

  // Set notification content
  notification.innerHTML = `
        ${iconHtml}
        <div class="notification-content">
            <h4 class="notification-title">${title}</h4>
            <p class="notification-message">${message}</p>
        </div>
        <button class="notification-close">&times;</button>
    `;

  // Add to container
  container.appendChild(notification);

  // Close button functionality
  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.addEventListener("click", () => {
    closeNotification(notification);
  });

  // Auto close after duration
  setTimeout(() => {
    closeNotification(notification);
  }, duration);

  return notification;
}

// Close notification with animation
function closeNotification(notification) {
  notification.classList.add("closing");

  // Remove after animation completes
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

// Success notification
function showSuccess(message, title = "Success") {
  return showNotification("success", title, message);
}

// Error notification
function showError(message, title = "Error") {
  return showNotification("error", title, message);
}

// Info notification
function showInfo(message, title = "Information") {
  return showNotification("info", title, message);
}

// Warning notification
function showWarning(message, title = "Warning") {
  return showNotification("warning", title, message);
}

// Override the default alert
window.originalAlert = window.alert;
window.alert = (message) => {
  showInfo(message);
};
