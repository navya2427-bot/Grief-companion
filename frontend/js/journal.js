const API = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");

function saveEntry() {
    const text = document.getElementById("text").value.trim();
    if (!text) return;

    fetch(`${API}/journal`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    }).then(() => {
        document.getElementById("text").value = "";
        loadEntries();
    });
}

function loadEntries() {
    fetch(`${API}/journal`, {
        headers: { "Authorization": "Bearer " + token }
    })
    .then(res => res.json())
    .then(entries => {
        const box = document.getElementById("entries");
        box.innerHTML = "";

        entries.forEach(e => {
            const div = document.createElement("div");
            div.innerHTML = `
                <p>${e.text}</p>
                <small>${new Date(e.created_at).toLocaleString()}</small>
                <button onclick="deleteEntry('${e.id}')">Delete</button>
                <hr>
            `;
            box.appendChild(div);
        });
    });
}

function deleteEntry(id) {
    fetch(`${API}/journal/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    }).then(loadEntries);
}

function goBack() {
    window.location.href = "rooms.html";
}

document.addEventListener("DOMContentLoaded", loadEntries);
