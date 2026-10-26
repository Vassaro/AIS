// Control panel with filters, ship list and settings.
// Desktop: card opened/closed from the navbar button (state is remembered).
// Phones: bottom sheet with three states, changed by dragging the header:
//   open -> strip at the bottom -> tucked away (only the navbar button brings it back).
// Closing always returns to the strip or tucked state, whichever was chosen last.

const panel = document.getElementById("controlPanel");
const panelHeader = document.getElementById("panelHeader");
const panelToggle = document.getElementById("panelToggle");
const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

function setPanelOpen(open) {
    panel.classList.toggle("is-open", open);
    panelToggle.setAttribute("aria-expanded", String(open));
    if (!isMobile()) saveSettings({ panelOpen: open });
}

function setPanelTucked(tucked) {
    panel.classList.toggle("is-tucked", tucked);
    saveSettings({ panelTucked: tucked });
}

function togglePanel() {
    setPanelOpen(!panel.classList.contains("is-open"));
}

// Called after picking a ship or tapping the map so the map is visible again.
window.collapsePanelOnMobile = function () {
    if (isMobile()) setPanelOpen(false);
};

// Start closed on phones, open on desktop unless the user closed it last time.
const savedPanel = loadSettings();
panel.classList.toggle("is-open", !isMobile() && savedPanel.panelOpen !== false);
panel.classList.toggle("is-tucked", savedPanel.panelTucked === true);
panelToggle.setAttribute("aria-expanded", String(panel.classList.contains("is-open")));

panelToggle.addEventListener("click", togglePanel);

// Dragging the sheet on phones: follows the finger, then snaps to the nearest
// state, or to the next state in the direction it was flicked.
let drag = null;
let wasDragged = false;

function currentSheetY(stripY, hiddenY) {
    if (panel.classList.contains("is-open")) return 0;
    return panel.classList.contains("is-tucked") ? hiddenY : stripY;
}

panelHeader.addEventListener("pointerdown", (e) => {
    if (!isMobile()) return;
    const hiddenY = panel.offsetHeight;
    const stripY = hiddenY - panelHeader.offsetHeight;
    const startY = currentSheetY(stripY, hiddenY);
    drag = { pointerY: e.clientY, startY, stripY, hiddenY, y: startY, lastY: e.clientY, velocity: 0 };
    wasDragged = false;
    panel.classList.add("is-dragging");
    panelHeader.setPointerCapture(e.pointerId);
});

panelHeader.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dy = e.clientY - drag.pointerY;
    if (Math.abs(dy) < 8 && !wasDragged) return; // small wiggles are still a tap
    wasDragged = true;
    drag.y = Math.min(Math.max(drag.startY + dy, 0), drag.hiddenY);
    drag.velocity = e.clientY - drag.lastY; // px since last move, + = down
    drag.lastY = e.clientY;
    panel.style.transform = `translateY(${drag.y}px)`;
});

function endDrag() {
    if (!drag) return;
    const { y, stripY, hiddenY, velocity } = drag;
    drag = null;
    panel.classList.remove("is-dragging");
    panel.style.transform = "";
    if (!wasDragged) return;

    const snaps = [0, stripY, hiddenY];
    let target;
    if (velocity > 4) target = snaps.find(s => s > y) ?? hiddenY;             // flicked down
    else if (velocity < -4) target = [...snaps].reverse().find(s => s < y) ?? 0; // flicked up
    else target = snaps.reduce((a, b) => Math.abs(b - y) < Math.abs(a - y) ? b : a); // let go

    if (target === 0) {
        setPanelOpen(true);
    } else {
        setPanelTucked(target === hiddenY);
        setPanelOpen(false);
    }
}

panelHeader.addEventListener("pointerup", endDrag);
panelHeader.addEventListener("pointercancel", endDrag);

panelHeader.addEventListener("click", () => {
    if (isMobile() && !wasDragged) togglePanel();
    wasDragged = false;
});

// Tapping outside the open panel closes it (on phones: back to the strip or tucked state).
// Only real taps count, so panning the map leaves the panel alone.
let outsideDown = null;

document.addEventListener("pointerdown", (e) => {
    const outside = !panel.contains(e.target) && !panelToggle.contains(e.target);
    outsideDown = outside && panel.classList.contains("is-open") ? { x: e.clientX, y: e.clientY } : null;
});

document.addEventListener("pointerup", (e) => {
    if (!outsideDown) return;
    const moved = Math.hypot(e.clientX - outsideDown.x, e.clientY - outsideDown.y);
    outsideDown = null;
    if (moved < 8) setPanelOpen(false);
});
