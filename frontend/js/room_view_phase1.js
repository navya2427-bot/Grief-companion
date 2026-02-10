const roomId = new URLSearchParams(window.location.search).get("room");
const token = localStorage.getItem("token");

async function loadRoom() {
    const rooms = await fetch("http://127.0.0.1:8000/rooms").then(r => r.json());
    const room = rooms.find(r => r.room_id === roomId);

    document.getElementById("title").innerText = room.topic;

    loadMessages();
}

async function loadMessages() {
    const msgs = await fetch(
        `http://127.0.0.1:8000/rooms/${roomId}/messages`
    ).then(r => r.json());

    const box = document.getElementById("messages");
    box.innerHTML = "";

    msgs.forEach(m => {
        const d = document.createElement("div");
        d.innerText = m.content;
        box.appendChild(d);
    });
}

async function send() {
    const input = document.getElementById("msg");
    if (!input.value.trim()) return;

    await fetch(
        `http://127.0.0.1:8000/rooms/${roomId}/message`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ content: input.value })
        }
    );

    input.value = "";
    loadMessages();
}

function goBack() {
    window.location.href = "rooms.html";
}
