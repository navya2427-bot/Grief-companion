let selectedMood = null;

function setMood(mood) {
    selectedMood = mood;
    const map = {1:"Very low",2:"Low",3:"Okay",4:"Good",5:"Very good"};
    document.getElementById("moodText").innerText =
        "Current mood: " + map[mood];
}
async function sendMessage() {
    const input = document.getElementById("chatInput");
    const chatBox = document.getElementById("chatBox");
    const token = localStorage.getItem("token");

    if (!input.value.trim()) return;

    const userMsg = document.createElement("div");
    userMsg.className = "user-msg";
    userMsg.innerText = input.value;
    chatBox.appendChild(userMsg);

    const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            message: input.value,
            style: "friend",
            tone: "supportive"
        })
    });

    const data = await res.json();

    const botMsg = document.createElement("div");
    botMsg.className = "bot-msg";
    botMsg.innerText = data.reply;
    chatBox.appendChild(botMsg);

    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
}
