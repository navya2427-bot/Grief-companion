let allRooms = [];
let myRooms = [];

async function loadRooms() {
    const res = await fetch("http://127.0.0.1:8000/rooms");
    allRooms = await res.json();
    renderRooms(allRooms);
    renderMyRooms();
}

function renderRooms(rooms) {
    const list = document.getElementById("roomsList");
    list.innerHTML = "";

    if (!rooms.length) {
        list.innerHTML = "<p class='muted'>No active rooms</p>";
        return;
    }

    rooms.forEach(r => {
        const div = document.createElement("div");
        div.className = "room-card";
        div.innerHTML = `
            <strong>Topic:</strong> ${r.topic}<br>
            <strong>Active:</strong> ${r.count}
        `;
        list.appendChild(div);
    });
}

function filterRooms() {
    const q = document.getElementById("search").value.toLowerCase();
    renderRooms(allRooms.filter(r => r.topic.includes(q)));
}

async function createRoom() {
    const topic = document.getElementById("topic").value;

    const res = await fetch(
        `http://127.0.0.1:8000/rooms/create?topic=${topic}`,
        { method: "POST" }
    );

    const data = await res.json();
    myRooms.push(data.room_id);
    loadRooms();
}

function renderMyRooms() {
    const box = document.getElementById("myRooms");
    box.innerHTML = "";

    if (!myRooms.length) {
        box.innerHTML = "<p class='muted'>No rooms created yet</p>";
        return;
    }

    myRooms.forEach(id => {
        const d = document.createElement("div");
        d.className = "room-card";
        d.innerHTML = `
            Room ${id}
            <button onclick="deleteRoom('${id}')">Delete</button>
        `;
        box.appendChild(d);
    });
}

function deleteRoom(id) {
    myRooms = myRooms.filter(r => r !== id);
    renderMyRooms();
}

function goHome() {
    window.location.href = "home.html";
}
