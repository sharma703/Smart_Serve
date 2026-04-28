/* ============================================================
   SmartServe — community.js
   ============================================================ */

"use strict";

// ── Character count ──
const descArea = document.getElementById("description");
const descCount = document.getElementById("descCount");
if (descArea) {
  descArea.addEventListener("input", () => {
    const len = descArea.value.length;
    descCount.textContent = len;
    if (len > 500) {
      descArea.value = descArea.value.slice(0, 500);
      descCount.textContent = 500;
    }
    descCount.style.color = len > 450 ? "var(--warning)" : "var(--muted-2)";
  });
}

// ── Map placeholder click ──
const mapPlaceholder = document.querySelector(".map-placeholder");
if (mapPlaceholder) {
  mapPlaceholder.addEventListener("click", () => {
    const loc = document.getElementById("location");
    if (loc && !loc.value) {
      loc.value = "12.9716° N, 77.5946° E";
      loc.classList.add("valid");
      showToast("📍 Location pinned on map!", "success");
    }
  });
}

// ── Form Submission ──
const communityForm = document.getElementById("communityForm");
if (communityForm) {
  communityForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate
    const v1 = validateRequired("areaName");
    const v2 = validateSelect("problemType");
    const v3 = validateRequired("location");

    const severityVal = document.querySelector(
      'input[name="severity"]:checked',
    );
    const severityErr = document.getElementById("severityError");
    if (!severityVal) {
      severityErr.style.display = "block";
    } else {
      severityErr.style.display = "none";
    }

    if (!v1 || !v2 || !v3 || !severityVal) {
      showToast("⚠️ Please fill in all required fields.", "error");
      return;
    }

    // Show loading
    const btn = document.getElementById("submitBtn");
    btn.classList.add("loading");
    btn.querySelector(".btn-text").textContent = "Submitting…";

    // Simulate API call
    await delay(1600);

    // Save to localStorage
    const report = {
      id: genId("SSR"),
      areaName: document.getElementById("areaName").value,
      problemType: document.getElementById("problemType").value,
      severity: severityVal.value,
      location: document.getElementById("location").value,
      population: document.getElementById("population").value || "Unknown",
      description: descArea.value,
      urgent: document.getElementById("urgentFlag").checked,
      timestamp: new Date().toISOString(),
    };

    const reports = JSON.parse(localStorage.getItem("ss_reports") || "[]");
    reports.unshift(report);
    localStorage.setItem("ss_reports", JSON.stringify(reports.slice(0, 50)));

    // Show success modal
    btn.classList.remove("loading");
    btn.querySelector(".btn-text").textContent = "📋 Submit Report";

    document.getElementById("reportId").textContent = "#" + report.id;
    openModal("successModal");

    // Reset form
    communityForm.reset();
    document.querySelectorAll(".form-control").forEach((el) => {
      el.classList.remove("valid", "invalid");
    });
    if (descCount) descCount.textContent = "0";
  });
}

// ── Real-time validation ──
["areaName", "location"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("blur", () => validateRequired(id));
});
const ptSelect = document.getElementById("problemType");
if (ptSelect)
  ptSelect.addEventListener("change", () => validateSelect("problemType"));

// ── Severity error clear ──
document.querySelectorAll('input[name="severity"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const err = document.getElementById("severityError");
    if (err) err.style.display = "none";
  });
});

// ── Util ──
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
