let rooms = [];

async function loadRooms() {
    const res = await fetch("http://127.0.0.1:8000/rooms");
    rooms = await res.json();
    renderRooms();
}

function renderRooms() {
    const box = document.getElementById("roomsList");
    box.innerHTML = "";

    rooms.forEach(r => {
        const d = document.createElement("div");
        d.className = "room-card";
        d.innerHTML = `
            <h4>${r.topic}</h4>
            <p>${r.description || ""}</p>
            <small>Tags: ${(r.tags || []).join(", ")}</small><br>
            <small>Members: ${r.member_count}</small><br><br>
            <button onclick="enterRoom('${r.room_id}')">Enter</button>
        `;
        box.appendChild(d);
    });
}

async function createRoom() {
    const token = localStorage.getItem("token");

    const payload = {
        topic: document.getElementById("topic").value,
        description: document.getElementById("description").value,
        tags: document.getElementById("tags").value
            .split(",").map(t => t.trim()).filter(Boolean)
    };

    await fetch("http://127.0.0.1:8000/rooms", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload)
    });

    document.getElementById("description").value = "";
    document.getElementById("tags").value = "";

    loadRooms();
}

function enterRoom(roomId) {
    window.location.href = `room_view.html?room=${roomId}`;
}

function goHome() {
    window.location.href = "home.html";
}
