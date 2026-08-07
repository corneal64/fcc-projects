/* ============================================
   JavaScript Documentation - Interactivity
   ============================================ */

const menuToggle = document.getElementById("menu");
const navbar = document.getElementById("nav-menu");
const overlay = document.getElementById("overlay");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".main-section");

/* ---------- Mobile Menu Toggle ---------- */
function openMenu() {
  navbar.classList.add("open");
  overlay.classList.add("show");
  menuToggle.classList.add("open");
  document.body.classList.add("menu-open");
  menuToggle.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  navbar.classList.remove("open");
  overlay.classList.remove("show");
  menuToggle.classList.remove("open");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", function () {
  const isOpen = navbar.classList.contains("open");
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

/* Close menu when clicking overlay */
overlay.addEventListener("click", closeMenu);

/* Close menu when clicking a nav link (mobile) */
navLinks.forEach(function (link) {
  link.addEventListener("click", closeMenu);
});

/* Close menu when pressing Escape */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeMenu();
  }
});

/* ---------- Scroll Spy (active nav link highlighting) ---------- */
function updateActiveLink() {
  const scrollPosition = window.scrollY + 120;

  sections.forEach(function (section) {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      const currentId = section.getAttribute("id");

      navLinks.forEach(function (link) {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + currentId) {
          link.classList.add("active");
        }
      });
    }
  });
}

window.addEventListener("scroll", updateActiveLink);
window.addEventListener("resize", updateActiveLink);
updateActiveLink();

/* ---------- Scroll to Top Button ---------- */
const scrollTopButton = document.createElement("button");
scrollTopButton.className = "scroll-top";
scrollTopButton.setAttribute("aria-label", "Scroll to top");
scrollTopButton.innerHTML = "&#8593;";
document.body.appendChild(scrollTopButton);

scrollTopButton.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

window.addEventListener("scroll", function () {
  if (window.scrollY > 400) {
    scrollTopButton.classList.add("show");
  } else {
    scrollTopButton.classList.remove("show");
  }
});
