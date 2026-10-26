// Settings persisted in localStorage, shared by navbar.js, panel.js and index.html.
// Load this script before the others.

const SETTINGS_KEY = "ais-settings";

function loadSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    } catch (e) {
        return {}; // ignore bad/missing localStorage
    }
}

function saveSettings(patch) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...loadSettings(), ...patch }));
    } catch (e) {
        // ignore bad/missing localStorage
    }
}
