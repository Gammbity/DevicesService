const logoutBtn = document.getElementById("logout-btn");
const form = document.getElementById("application-form");
const userEmailSpan = document.getElementById("user-email");
const dashboardLink = document.getElementById("dashboard-link");
const dashboardContent = document.getElementById("dashboard-content");
const submitApplicationLink = document.getElementById("submit-application-link");
const submitApplicationContent = document.getElementById("submit-application-content");
const applicationsContainer = document.getElementById("recent-applications-container");

dashboardLink.addEventListener("click", () => switchSection(dashboardLink, dashboardContent));
submitApplicationLink.addEventListener("click", () => switchSection(submitApplicationLink, submitApplicationContent));




(async function () {
    try {
        const response = await fetch("http://13.49.213.104:8000/api/v1/main/devices", {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        const data = await response.json();
        const cardsGrid = document.querySelector(".cards-grid");

        cardsGrid.innerHTML = ""; // <<== DOM tozalanadi

        data.forEach((item) => {
            let formattedDate = "Belgilanmagan";

            if (item.end_time) {
                try {
                    const rawEndTime = item.end_time;
                    const safeDateString = rawEndTime.split('+')[0] + '+04:00';
                    const dateObj = new Date(safeDateString);
                    formattedDate = isNaN(dateObj) ? "Noma'lum sana" : dateObj.toDateString();
                } catch (e) {
                    formattedDate = "Noma'lum sana";
                }
            }
            const price = item.price !== undefined && item.price !== null ? item.price : "Narx belgilanmagan";

            const card = `
                <div class="listing-card">
                    <div class="header">
                        <div class="title-section">
                            <div class="laptop-icon"></div>
                            <h1 class="title">${item.name}</h1>
                        </div>
                        <div class="status-badge status-progress">${item.status}</div>
                    </div>

                    <div class="created-date">Yaratilgan sana: ${new Date(item.created_at).toDateString()}</div>
                    <div class="created-date">Tugash sanasi: ${formattedDate}</div>

                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-icon icon-clock"></span>
                            <span class="detail-label">Muammo turi:</span>
                            <span class="detail-value">${item.type === "Software" ? "Dasturiy ta'minot" : "Kompyuter jihozi"}</span>
                        </div>
                        <div class="detail-item price-item">
                            <span class="detail-icon icon-dollar"></span>
                            <span class="detail-label">Narx:</span>
                            <span class="detail-value">${price}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon icon-location"></span>
                            <span class="detail-label">Joylashuv:</span>
                            <span class="detail-value">${item.location}</span>
                        </div>
                    </div>

                    <div class="description-section">
                        <h3 class="description-title">Tavsif:</h3>
                        <div class="description-text">${item.description}</div>
                    </div>
                </div>
            `;
            cardsGrid.innerHTML += card;
        });

    } catch (error) {
        console.error("Xatolik:", error);
    }
})();



function getStatusClass(status) {
    switch ((status || '').toLowerCase()) {
        case "completed":
            return "status-completed";
        case "in progress":
            return "status-progress";
        case "pending":
            return "status-pending";
        default:
            return "status-pending";
    }
}



// SUBMIT APPLICATION — DEVICE CREATE
const applicationForm = document.getElementById("application-form");

applicationForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = "email";
    const username = "username";
    const name = document.getElementById("device-name").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value;

    const payload = {email, username, name, description, location };
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

    try {
        const response = await fetch("http://13.49.213.104:8000/api/v1/main/device/create/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"), // Agar kerak bo‘lsa (session-based auth)
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            credentials: "include"
        });

        if (!response.ok) {
            const errorText = await response.text(); // backenddan xatoni o'qib ol
            console.error("Error response:", errorText);
            throw new Error("Something went wrong");
        }

        const data = await response.json();

        applicationForm.reset();

        document.getElementById("dashboard-link").click();
        fetchApplications(); // <-- to‘g‘ri funksiya
    } catch (error) {
        console.error(error);
        showNotification("Error submitting application!", "error");
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn"); // tugma ID to‘g‘ri bo‘lsin

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

    // Logout
    logoutBtn.addEventListener("click", async () => {
        try {
            await fetch("http://13.49.213.104:8000/api/v1/user/logout/", {
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"), // Agar kerak bo‘lsa
                },
                method: "POST",
                credentials: "include"
            });
            window.location.href = "/frontend/index.html";
        } catch (err) {
            showNotification("Chiqishda xatolik", "error");
        }
    });
});
