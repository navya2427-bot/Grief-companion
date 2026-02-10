const API_BASE = "http://127.0.0.1:8000";
let moodChartInstance = null;

// --------------------
// Load user email
// --------------------
function loadUserEmail() {
    const email = localStorage.getItem("userEmail");
    if (email) {
        document.getElementById("userEmail").innerText = email;
    }
}


// --------------------
// Load mood graph
// --------------------
async function loadMoodGraph() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${API_BASE}/mood/daily`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await res.json();

    const chartEl = document.getElementById("moodChart");
    const welcomeEl = document.getElementById("welcomeMessage");

    // ---- No data case ----
    if (!Array.isArray(data) || data.length === 0) {
        welcomeEl.style.display = "block";
        chartEl.style.display = "none";
        return;
    }

    // ---- Data exists ----
    welcomeEl.style.display = "none";
    chartEl.style.display = "block";

    const labels = data.map(d => `Day ${d.day}`);
    const values = data.map(d => d.mood);

    // Destroy old chart if reloaded
    if (moodChartInstance) {
        moodChartInstance.destroy();
    }

    const ctx = chartEl.getContext("2d");

    moodChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Mood Progress",
                data: values,
                borderColor: "#4f46e5",
                backgroundColor: "rgba(79,70,229,0.15)",
                fill: true,
                tension: 0.35,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 1,
                    max: 10,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// --------------------
// Page load
// --------------------
document.addEventListener("DOMContentLoaded", () => {
    requireAuth();
    loadUserEmail();
    loadMoodGraph();
});

function requireAuth() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // ✅ Auth passed → now update UI
    const email = localStorage.getItem("userEmail");
    document.getElementById("userEmail").textContent =
        email ?? "anonymous@user";
}

function goTo(page) {
    window.location.href = page;
}
