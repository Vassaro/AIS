// Code to automatically hide navbar.
// Desktop (mouse): only reacts near the top edge / navbar itself
// Phones/touch: autohide is off entirely, navbar always stays visible.

const navbar = document.querySelector(".navbar");

const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

const PROXIMITY_PX = 60;    // how close (px) mouse must be to top before navbar shows
const HIDE_DELAY_MS = 250; // hide this long after mouse leaves the proximity zone

let autoHideEnabled = !isTouchDevice;
if (autoHideEnabled) {
    try {
        const saved = JSON.parse(localStorage.getItem("ais-settings") || "{}");
        if (typeof saved.autoHideNavbar === "boolean") autoHideEnabled = saved.autoHideNavbar;
    } catch (e) {
        // ignore bad/missing localStorage
    }
}

let hideTimer = null;

function show() {
    navbar.classList.remove("navbar-hidden");
}

function hide() {
    if (!autoHideEnabled) return;
    if (navbar.matches(":hover")) return;
    navbar.classList.add("navbar-hidden");
}

function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, HIDE_DELAY_MS);
}

// Called on load and whenever the setting is flipped
function applyAutoHideState() {
    clearTimeout(hideTimer);
    if (autoHideEnabled) {
        scheduleHide();
    } else {
        show();
    }
}

// Exposed so the settings switch in index.html can flip this live.
// No-op on touch devices: autohide always stays off there.
window.setNavbarAutoHideEnabled = function (enabled) {
    if (isTouchDevice) return;
    autoHideEnabled = enabled;
    applyAutoHideState();
};

applyAutoHideState();

if (!isTouchDevice) {
    // Throttle to one check per animation frame -> fewer redundant timer
    // resets/class toggles while the mouse is moving (less jitter).
    let ticking = false;

    function handlePointerY(y) {
        if (!autoHideEnabled) return;
        if (y <= PROXIMITY_PX) {
            show();
            clearTimeout(hideTimer);
        } else {
            // Mouse moved away from the top/navbar -> let it disappear again
            scheduleHide();
        }
    }

    document.addEventListener("mousemove", (e) => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            handlePointerY(e.clientY);
            ticking = false;
        });
    });

    // Re-hide promptly once cursor actually leaves the navbar
    navbar.addEventListener("mouseleave", () => {
        if (autoHideEnabled) scheduleHide();
    });
}
