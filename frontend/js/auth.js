const API_BASE = "http://127.0.0.1:8000/auth";

async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem("token", data.access_token);
    // ✅ store email for UI usage
        localStorage.setItem("userEmail", email);
        message.style.color = "green";
        message.innerText = "Registered successfully";
        setTimeout(() => window.location.href = "login.html", 1000);
    } else {
        message.style.color = "red";
        message.innerText = data.detail || "Registration failed";
    }
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem("token", data.access_token);
        window.location.href = "home.html";
    } else {
        message.innerText = data.detail || "Login failed";
    }
}

function requireAuth() {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html";
    }
}
function authHeader() {
    const token = localStorage.getItem("token");
    return {
        "Authorization": "Bearer " + token
    };
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}
