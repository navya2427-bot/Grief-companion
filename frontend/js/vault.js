const API_BASE = "http://127.0.0.1:8000";
const token = localStorage.getItem("token");

if (!token) {
    alert("Login required");
    window.location.href = "login.html";
}

const fileList = document.getElementById("fileList");
const uploader = document.getElementById("uploader");
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");

/* --------------------
   TOGGLE UPLOADER
-------------------- */
function toggleUploader() {
    uploader.classList.toggle("hidden");
}

/* --------------------
   DRAG & DROP
-------------------- */
dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    uploadFiles(e.dataTransfer.files);
});

fileInput.addEventListener("change", () => {
    uploadFiles(fileInput.files);
});

/* --------------------
   UPLOAD FILES
-------------------- */
function uploadFiles(files) {
    for (let file of files) {
        const form = new FormData();
        form.append("file", file);

        fetch(`${API_BASE}/vault`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: form
        }).then(loadFiles);
    }

    toggleUploader();
}

/* --------------------
   LOAD FILE LIST
-------------------- */
function loadFiles() {
    fetch(`${API_BASE}/vault`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(renderFiles);
}

/* --------------------
   RENDER LIST
-------------------- */
function renderFiles(files) {
    fileList.innerHTML = "";

    if (files.length === 0) {
        fileList.innerHTML = "<p class='muted'>No files uploaded yet</p>";
        return;
    }

    files.forEach(f => {
        const div = document.createElement("div");
        div.className = "file-item";

        div.innerHTML = `
            <span class="file-name">${f.filename}</span>
            <span class="file-type">${getType(f.content_type)}</span>
            <div class="file-actions">
                ${
                    isPreviewable(f.content_type)
                    ? `<button onclick="openFile('${f.id}')">Open</button>`
                    : ""
                }
                <button onclick="downloadFile('${f.id}', '${f.filename}')">Download</button>
                <button onclick="deleteFile('${f.id}')">Delete</button>
            </div>
        `;

        fileList.appendChild(div);
    });
}

/* --------------------
   FILE ACTIONS
-------------------- */
function openFile(id) {
    window.open(`${API_BASE}/vault/${id}`, "_blank");
}

function downloadFile(id, name) {
    const a = document.createElement("a");
    a.href = `${API_BASE}/vault/${id}`;
    a.download = name;
    a.click();
}

function deleteFile(id) {
    if (!confirm("Delete this file?")) return;

    fetch(`${API_BASE}/vault/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    }).then(loadFiles);
}

/* --------------------
   HELPERS
-------------------- */
function getType(type) {
    if (!type) return "File";
    if (type.startsWith("text")) return "Text";
    if (type.startsWith("image")) return "Image";
    if (type.includes("pdf")) return "PDF";
    return "File";
}

function isPreviewable(type) {
    return type && (type.startsWith("text") || type.startsWith("image"));
}

function goBack() {
    window.location.href = "rooms.html";
}

document.addEventListener("DOMContentLoaded", loadFiles);
