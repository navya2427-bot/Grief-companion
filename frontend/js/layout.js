let swapped = false;

function swapPanels() {
    const left = document.getElementById("leftPanel");
    const right = document.getElementById("rightPanel");

    if (!swapped) {
        left.style.width = "70%";
        right.style.width = "30%";
    } else {
        left.style.width = "30%";
        right.style.width = "70%";
    }

    swapped = !swapped;
}
