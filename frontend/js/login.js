document.addEventListener("DOMContentLoaded", () => {
  // Tab switching
  const clientTab = document.getElementById("client-tab");
  const managerTab = document.getElementById("manager-tab");
  const clientLogin = document.getElementById("client-login");
  const managerLogin = document.getElementById("manager-login");

  clientTab.addEventListener("click", () => {
    clientTab.classList.add("active");
    managerTab.classList.remove("active");
    clientLogin.classList.add("active");
    managerLogin.classList.remove("active");
  });

  managerTab.addEventListener("click", () => {
    managerTab.classList.add("active");
    clientTab.classList.remove("active");
    managerLogin.classList.add("active");
    clientLogin.classList.remove("active");
  });

  // Client login form submission
  const clientLoginForm = document.getElementById("client-login-form");
  clientLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("client-email").value;

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
      const response = await fetch(
        "http://13.49.213.104:8000/api/v1/user/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (result.email) {
        showSuccess(
          "Login link has been sent to your email. Please check your inbox.",
          "Email Sent"
        );
      } else {
        showError(result.message || "Failed to send login link");
      }
    } catch (error) {
      console.error("Error sending login link:", error);
      showError("An error occurred. Please try again.");
    }

     try {
    const res = await fetch("http://13.49.213.104:8000/api/v1/user/profile/");
    const data = await res.json();
    console.log(data);

    if (data.email) {
      window.location.href = "/client-cabinet.html";
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    showError("An error occurred while loading your profile.");
  }
  
  });

  

  // Manager login form submission
  const managerLoginForm = document.getElementById("manager-login-form");
  managerLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("manager-email").value;
    const password = document.getElementById("manager-password").value;

    // Function to get CSRF token from cookies
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
    // Get CSRF token
    const csrftoken = getCookie("csrftoken");
    try {
      const response = await fetch("http://13.49.213.104:8000/api/v1/user/master/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": csrftoken,},
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log(result);
      if (result.detail === "Login successful") {
        // Store token and user data
        localStorage.setItem("authToken", result.token);
        // localStorage.setItem("userRole", result.manager.role);
        localStorage.setItem("userEmail", result.email);

        showSuccess("Login successful. Redirecting to dashboard...", "Welcome");
        
        window.location.href = "http://13.49.213.104:5500/frontend/manager-cabinet.html";
      } 
      else {
        showError(result.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Error during manager login:", error);
      showError("An error occurred. Please try again.");
    }
  });
});

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
