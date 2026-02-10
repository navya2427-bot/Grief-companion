console.log("room.js loaded");

const API_BASE = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");

if (!token) {
    alert("Not logged in");
    window.location.href = "login.html";
}

// --------------------
// GET ROOM ID
// --------------------
const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

if (!roomId) {
    alert("Room ID missing");
    window.location.href = "rooms.html";
}

// --------------------
// PAGE LOAD
// --------------------
document.addEventListener("DOMContentLoaded", () => {
    loadRoomInfo();
    loadMessages();
});

// --------------------
// LOAD ROOM INFO + AUTO JOIN
// --------------------
function loadRoomInfo() {
    fetch(`${API_BASE}/rooms/${roomId}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Room fetch failed");
        return res.json();
    })
    .then(room => {
        document.getElementById("roomTitle").innerText =
            room.name + " (" + room.topic + ")";

        document.getElementById("roomMeta").innerText =
            room.participants_count + " people inside";
    })
    .catch(err => {
        console.error(err);
        alert("Unable to load room");
    });
}

// --------------------
// LOAD MESSAGES
// --------------------
function loadMessages() {
    fetch(`${API_BASE}/rooms/${roomId}/messages`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(renderMessages)
    .catch(err => console.error("Messages error:", err));
}

// --------------------
// RENDER MESSAGES
// --------------------
function renderMessages(messages) {
    const box = document.getElementById("chatBox");
    box.innerHTML = "";

    if (messages.length === 0) {
        box.innerHTML = "<p class='muted'>No messages yet</p>";
        return;
    }

    messages.forEach(msg => {
        const div = document.createElement("div");
        div.className = "user-msg";
        div.innerText = msg.body;
        box.appendChild(div);
    });

    box.scrollTop = box.scrollHeight;
}

// --------------------
// SEND MESSAGE
// --------------------
function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();

    if (!text) return;

    fetch(`${API_BASE}/rooms/${roomId}/messages`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ body: text })
    })
    .then(res => {
        if (!res.ok) throw new Error("Send failed");
        return res.json();
    })
    .then(() => {
        input.value = "";
        loadMessages();
    })
    .catch(err => {
        console.error(err);
        alert("Message not sent");
    });
}

// --------------------
// NAV
// --------------------
function goBack() {
    window.location.href = "rooms.html";
}
