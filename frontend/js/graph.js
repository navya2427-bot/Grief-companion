function updateGraph() {
    const canvas = document.getElementById("moodGraph");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (moodHistory.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height - moodHistory[0] * 20);

    moodHistory.forEach((mood, index) => {
        const x = (canvas.width / (moodHistory.length - 1)) * index;
        const y = canvas.height - mood * 20;
        ctx.lineTo(x, y);
    });

    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 2;
    ctx.stroke();
}
