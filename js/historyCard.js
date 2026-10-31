// History player card.
// Desktop: dragged by its header, sticks to a screen edge when dropped near one, position is remembered.
//   Double-clicking the header puts it back at the bottom center.
// Phones and desktop: can be minimized to just the header (name, time, play), state is remembered.

const historyCard = document.getElementById("history-controls");
const historyCardHeader = document.getElementById("history-card-header");
const CARD_MARGIN = 12;   // gap to the screen edge when snapped
const SNAP_DISTANCE = 48; // dropped this close to an edge -> sticks to it

// null = default bottom center, else { x, y, snapX: "left" | "right" | null, snapY: "top" | "bottom" | null }
let cardPos = loadSettings().historyCardPos ?? null;

// top of the free area, below the navbar unless it is auto-hidden
const cardTopLimit = () => Math.max(0, document.querySelector(".navbar").getBoundingClientRect().bottom) + CARD_MARGIN;

// keeps the card on screen and against the edges it was snapped to, also after resizes and minimizing
window.placeHistoryCard = function () {
    if (historyCard.style.display === "none") return;
    const floating = cardPos && !isMobile();
    historyCard.classList.toggle("is-floating", !!floating);
    if (!floating) {
        historyCard.style.left = historyCard.style.top = "";
        return;
    }

    const maxX = window.innerWidth - historyCard.offsetWidth - CARD_MARGIN;
    const maxY = window.innerHeight - historyCard.offsetHeight - CARD_MARGIN;
    const x = cardPos.snapX === "left" ? CARD_MARGIN : cardPos.snapX === "right" ? maxX : cardPos.x;
    const y = cardPos.snapY === "top" ? cardTopLimit() : cardPos.snapY === "bottom" ? maxY : cardPos.y;
    historyCard.style.left = `${Math.max(CARD_MARGIN, Math.min(x, maxX))}px`;
    historyCard.style.top = `${Math.max(cardTopLimit(), Math.min(y, maxY))}px`;
};

function setHistoryCardMinimized(minimized) {
    historyCard.classList.toggle("is-minimized", minimized);
    const button = document.getElementById("history-minimize-button");
    button.querySelector("i").className = minimized ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down";
    button.setAttribute("aria-label", minimized ? "Visa hela" : "Förminska");
    saveSettings({ historyCardMinimized: minimized });
    window.placeHistoryCard();
}

window.toggleHistoryCardMinimized = () => setHistoryCardMinimized(!historyCard.classList.contains("is-minimized"));

setHistoryCardMinimized(loadSettings().historyCardMinimized === true);

// Dragging on desktop: follows the pointer, then snaps to any edge it is dropped near.
let cardDrag = null;

historyCardHeader.addEventListener("pointerdown", (e) => {
    if (isMobile() || e.button !== 0 || e.target.closest("button")) return;
    const rect = historyCard.getBoundingClientRect();
    cardDrag = { startX: e.clientX, startY: e.clientY, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top, moved: false };
    historyCardHeader.setPointerCapture(e.pointerId);
});

historyCardHeader.addEventListener("pointermove", (e) => {
    if (!cardDrag) return;
    if (!cardDrag.moved && Math.hypot(e.clientX - cardDrag.startX, e.clientY - cardDrag.startY) < 4) return; // still a click
    cardDrag.moved = true;
    historyCard.classList.add("is-dragging");
    cardPos = { x: e.clientX - cardDrag.offsetX, y: e.clientY - cardDrag.offsetY, snapX: null, snapY: null };
    window.placeHistoryCard();
});

function endCardDrag() {
    if (!cardDrag) return;
    const { moved } = cardDrag;
    cardDrag = null;
    historyCard.classList.remove("is-dragging");
    if (!moved) return;

    const rect = historyCard.getBoundingClientRect();
    const nearLeft = rect.left - CARD_MARGIN < SNAP_DISTANCE;
    const nearRight = window.innerWidth - rect.right - CARD_MARGIN < SNAP_DISTANCE;
    const nearTop = rect.top - cardTopLimit() < SNAP_DISTANCE;
    const nearBottom = window.innerHeight - rect.bottom - CARD_MARGIN < SNAP_DISTANCE;
    cardPos = {
        x: rect.left,
        y: rect.top,
        snapX: nearLeft ? "left" : nearRight ? "right" : null,
        snapY: nearTop ? "top" : nearBottom ? "bottom" : null
    };
    window.placeHistoryCard();
    saveSettings({ historyCardPos: cardPos });
}

historyCardHeader.addEventListener("pointerup", endCardDrag);
historyCardHeader.addEventListener("pointercancel", endCardDrag);

historyCardHeader.addEventListener("dblclick", (e) => {
    if (isMobile() || e.target.closest("button")) return;
    cardPos = null;
    saveSettings({ historyCardPos: null });
    window.placeHistoryCard();
});

window.addEventListener("resize", window.placeHistoryCard);
