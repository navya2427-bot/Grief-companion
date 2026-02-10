console.log("rooms.js running");

const API_BASE = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");

if (!token) {
    alert("Not logged in");
    window.location.href = "login.html";
}

// ---------------- LOAD ----------------
loadRooms();

// ---------------- FETCH ROOMS ----------------
function loadRooms() {
    fetch(API_BASE + "/rooms", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(renderRooms)
    .catch(err => console.error(err));
}

// ---------------- RENDER ----------------
function renderRooms(rooms) {
    const myRooms = document.getElementById("myRooms");
    const allRooms = document.getElementById("allRooms");

    myRooms.innerHTML = "";
    allRooms.innerHTML = "";

    if (rooms.length === 0) {
        allRooms.innerHTML = "<p class='muted'>No rooms available</p>";
        return;
    }

    rooms.forEach(room => {
        // ---- All rooms card ----
        const allCard = document.createElement("div");
        allCard.className = "room-card";
        allCard.innerHTML = `
            <h4>${room.name}</h4>
            <p class="muted">${room.topic}</p>
            <button onclick="enterRoom('${room.id}')">Enter</button>
        `;
        allRooms.appendChild(allCard);

        // ---- My rooms card ----
        if (room.is_owner) {
            const myCard = document.createElement("div");
            myCard.className = "room-card";
            myCard.innerHTML = `
                <h4>${room.name}</h4>
                <p class="muted">${room.topic}</p>
                <button onclick="enterRoom('${room.id}')">Enter</button>
                <button onclick="deleteRoom('${room.id}')">Delete</button>
            `;
            myRooms.appendChild(myCard);
        }
    });
}

// ---------------- CREATE ROOM ----------------
function createRoom() {
    const name = document.getElementById("roomName").value.trim();
    const topic = document.getElementById("roomTopic").value.trim();
    const description = document.getElementById("roomDesc").value.trim();

    if (!name || !topic) {
        alert("Name and topic required");
        return;
    }

    fetch(API_BASE + "/rooms", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, topic, description })
    })
    .then(res => res.json())
    .then(() => {
        toggleCreateRoom();
        clearForm();
        loadRooms();
    })
    .catch(err => alert("Create failed"));
}

// ---------------- DELETE ----------------
function deleteRoom(roomId) {
    if (!confirm("Delete this room?")) return;

    fetch(API_BASE + "/rooms/" + roomId, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(() => loadRooms())
    .catch(err => alert("Delete failed"));
}

// ---------------- HELPERS ----------------
function toggleCreateRoom() {
    const box = document.getElementById("createRoomBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

function clearForm() {
    document.getElementById("roomName").value = "";
    document.getElementById("roomTopic").value = "";
    document.getElementById("roomDesc").value = "";
}

function enterRoom(roomId) {
    window.location.href = `room.html?room=${roomId}`;
}
