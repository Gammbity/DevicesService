
const buttons = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');
const murojatlar = document.getElementById('all_requests');
const new_murojatlar = document.getElementById('new_murojatlar');
const all_products = document.getElementById('all_products');
const region = document.getElementById('region');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('border-blue-500', 'text-blue-600'));
    contents.forEach(c => c.classList.add('hidden'));
    document.getElementById(btn.dataset.tab).classList.remove('hidden');
    btn.classList.add('border-blue-500', 'text-blue-600');
  });
});

function renderStatus(status) {
  const map = {
    created: 'bg-gray-500',
    approved: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    completed: 'bg-green-500'
  };
  return `<span class="px-2 py-1 rounded text-white text-xs ${map[status.toLowerCase()] || 'bg-gray-400'}">${status}</span>`;
}

function openEditModal(id, status, end_time, price) {
  document.getElementById("edit-id").value = id;
  document.getElementById("edit-end-time").value = end_time ? new Date(end_time).toISOString().slice(0, 16) : '';
  document.getElementById("edit-price").value = price || '';
  document.getElementById("editModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("editModal").classList.add("hidden");
}

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

document.getElementById("editForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const id = document.getElementById("edit-id").value;
  const end_time = document.getElementById("edit-end-time").value;
  const price = document.getElementById("edit-price").value;
  const status = "approved";
  const csrftoken = getCookie("csrftoken");

  fetch(`http://127.0.0.1:8000/api/v1/main/devices/master/${id}/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken
    },
    body: JSON.stringify({ status, end_time, price })
  })
    .then(res => {
      if (!res.ok) throw new Error("Serverda xatolik");
      return res.json();
    })
    .then(() => {
      closeModal();
      renderDevices();
    })
    .catch(err => console.error("Xatolik:", err));
});

function renderDevices() {
  fetch("http://127.0.0.1:8000/api/v1/main/devices/master/", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("murojatlar-table-body");
      const search = document.getElementById("searchInput").value.toLowerCase();
      const filter = document.getElementById("statusFilter").value.toLowerCase();

      tbody.innerHTML = "";
      murojatlar.innerText = data.length;
      new_murojatlar.innerText = data.filter(d => d.status.toLowerCase() === "created").length;

      const filtered = data.filter(item => {
        const matchStatus = filter ? item.status.toLowerCase() === filter : true;
        const matchSearch = item.name.toLowerCase().includes(search) || item.user.email.toLowerCase().includes(search);
        return matchStatus && matchSearch;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 p-4">Hech narsa topilmadi.</td></tr>`;
        return;
      }

      // **Bu yerda barcha filtered device-lardan locationlarni olamiz**
      const locations = filtered
        .map(device => device.location)
        .filter(loc => loc); // null yoki undefined bo'lmaganlari

      // Location larni sanaymiz
      const counts = {};
      locations.forEach(loc => {
        counts[loc] = (counts[loc] || 0) + 1;
      });

      // Eng ko'p location-ni topamiz
      let maxLocation = "N/A";
      let maxCount = 0;
      for (const [loc, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count;
          maxLocation = loc;
        }
      }

      // Natijani HTML da ko'rsatamiz (element bor deb faraz qilamiz)
      const locationDisplay = document.getElementById("region");
      if (locationDisplay) {
        locationDisplay.innerText = `${maxLocation}`;
      }

      // Keyin filtered device-larni jadvalga chiqaramiz
      filtered.forEach(device => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50";
        tr.innerHTML = `
          <td class="py-2">${device.id}</td>
          <td>${device.name}</td>
          <td>${device.user.email || "-"}</td>
          <td>${new Date(device.created_at).toLocaleDateString()}</td>
          <td>${renderStatus(device.status)}</td>
          <td class="text-right">
            <button class="editBtn bg-blue-500 text-white px-3 py-1 rounded text-sm">Tahrirlash</button>
          </td>
        `;
        tbody.appendChild(tr);
        tr.querySelector(".editBtn").addEventListener("click", () => {
          openEditModal(device.id, device.status, device.end_time, device.price);
        });
      });
    });
}

function loadMahsulotlar() {
  fetch("http://127.0.0.1:8000/api/v1/main/products/", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("products-table-body");
      tbody.innerHTML = "";
      all_products.innerText = data.length;
      data.forEach((product, index) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50";
        tr.innerHTML = `
              <td class="px-4 py-2 border">${index + 1}</td>
              <td class="px-4 py-2 border">${product.name}</td>
              <td class="px-4 py-2 border">${product.description}</td>
              <td class="px-4 py-2 border">${product.price}</td>
              <td class="px-4 py-2 border">${product.count}</td>
              <td class="px-4 py-2 border">${new Date(product.created_at).toLocaleDateString()}</td>
            `;
        tbody.appendChild(tr);
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  renderDevices();
  loadMahsulotlar();
  document.getElementById("searchInput").addEventListener("input", renderDevices);
  document.getElementById("statusFilter").addEventListener("change", renderDevices);
  buttons[0].click(); // Default tab
});

