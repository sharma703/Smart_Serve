/* ============================================================
   SmartServe — main.js  (shared across all pages)
   ============================================================ */

"use strict";

/* ── Mobile Nav ── */
function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  menu.classList.toggle("open");
}
// Close on outside click
document.addEventListener("click", (e) => {
  const menu = document.getElementById("mobileMenu");
  const hamburger = document.querySelector(".hamburger");
  if (menu && !menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.classList.remove("open");
  }
});

/* ── Scroll Reveal ── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
);

document
  .querySelectorAll(".reveal")
  .forEach((el) => revealObserver.observe(el));

/* ── Toast Notifications ── */
function showToast(msg, type = "info", duration = 3500) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-msg">${msg}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeOut 0.35s ease forwards";
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/* ── Modal Helpers ── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("open");
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("open");
}
// Close modal on overlay click
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
  }
});

/* ── Form Validation Helpers ── */
function validateField(input, condition) {
  if (condition) {
    input.classList.remove("invalid");
    input.classList.add("valid");
    return true;
  } else {
    input.classList.remove("valid");
    input.classList.add("invalid");
    return false;
  }
}

function validateRequired(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return true;
  return validateField(el, el.value.trim().length > 0);
}

function validateSelect(selectId) {
  const el = document.getElementById(selectId);
  if (!el) return true;
  return validateField(el, el.value !== "");
}

function validateEmail(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return true;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return validateField(el, emailRe.test(el.value.trim()));
}

/* ── Slider Update Helper ── */
function updateSlider(slider, outId) {
  const out = document.getElementById(outId);
  if (!out) return;
  const val = parseInt(slider.value);
  if (outId === "expOut")
    out.textContent =
      val === 0
        ? "None"
        : val === 20
          ? "20+ years"
          : `${val} year${val > 1 ? "s" : ""}`;
  if (outId === "hoursOut")
    out.textContent = val === 1 ? "1 hour" : `${val} hours`;
}

/* ── Generate IDs ── */
function genId(prefix) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/* ── Nav scroll shadow ── */
window.addEventListener("scroll", () => {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  nav.style.boxShadow =
    window.scrollY > 20 ? "0 4px 32px rgba(0,0,0,0.3)" : "none";
});

/* ── Animate count numbers ── */
function animateCount(el, target, suffix = "") {
  let start = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = Math.round(start).toLocaleString() + suffix;
  }, 20);
}
