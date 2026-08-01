// Code to automatically hide navbar

const navbar = document.querySelector(".navbar");

function show() {
    navbar.classList.remove("navbar-hidden");
}

function hide() {
    if (!navbar.matches(":hover")) {
        navbar.classList.add("navbar-hidden");
    }
}

// Hide navbar after startup
setTimeout(hide, 5000);

// When mouse moves, show navbar and hide it after a while
document.addEventListener("mousemove", (e) => {
    show();
    setTimeout(hide, 5000);
});