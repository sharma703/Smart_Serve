/* ============================================================
   SmartServe — dashboard.js
   Dummy data + auto-assign logic + table + charts
   ============================================================ */

"use strict";

/* ── Dummy Data ── */
const DUMMY_TASKS = [
  {
    id: "TSK-1001",
    area: "North District",
    type: "Food",
    severity: "High",
    volunteer: "Akanksha Srivastava",
    skill: "Cooking",
    status: "Assigned",
    avatar: "AK",
    ac: "blue",
  },
  {
    id: "TSK-1002",
    area: "West Colony",
    type: "Medical",
    severity: "High",
    volunteer: "Sonia Patel",
    skill: "Medical",
    status: "Urgent",
    avatar: "SP",
    ac: "purple",
  },
  {
    id: "TSK-1003",
    area: "Old Town",
    type: "Education",
    severity: "Low",
    volunteer: "Rahul Nair",
    skill: "Teaching",
    status: "Assigned",
    avatar: "RN",
    ac: "teal",
  },
  {
    id: "TSK-1004",
    area: "East Block",
    type: "Logistics",
    severity: "Medium",
    volunteer: "—",
    skill: "—",
    status: "Pending",
    avatar: "?",
    ac: "danger",
  },
  {
    id: "TSK-1005",
    area: "South Market",
    type: "Food",
    severity: "High",
    volunteer: "Meera Iyer",
    skill: "Cooking",
    status: "Urgent",
    avatar: "MI",
    ac: "blue",
  },
  {
    id: "TSK-1006",
    area: "Green Valley",
    type: "Medical",
    severity: "Medium",
    volunteer: "Karan Singh",
    skill: "Medical",
    status: "Assigned",
    avatar: "KS",
    ac: "purple",
  },
  {
    id: "TSK-1007",
    area: "River Road",
    type: "Logistics",
    severity: "Low",
    volunteer: "Priya Sharma",
    skill: "Driving",
    status: "Completed",
    avatar: "PS",
    ac: "teal",
  },
  {
    id: "TSK-1008",
    area: "Central Zone",
    type: "Shelter",
    severity: "High",
    volunteer: "—",
    skill: "—",
    status: "Pending",
    avatar: "?",
    ac: "danger",
  },
  {
    id: "TSK-1009",
    area: "Lake View",
    type: "Education",
    severity: "Medium",
    volunteer: "Deepa Rao",
    skill: "Teaching",
    status: "Assigned",
    avatar: "DR",
    ac: "blue",
  },
  {
    id: "TSK-1010",
    area: "Hill Side",
    type: "Water",
    severity: "High",
    volunteer: "Ravi Menon",
    skill: "Logistics",
    status: "Urgent",
    avatar: "RM",
    ac: "danger",
  },
];

const DUMMY_VOLUNTEERS = [
  {
    name: "Arjun Kumar",
    skill: "Medical",
    loc: "Bangalore",
    tasks: 24,
    ac: "blue",
  },
  {
    name: "Sonia Patel",
    skill: "Teaching",
    loc: "Delhi",
    tasks: 19,
    ac: "purple",
  },
  {
    name: "Rahul Nair",
    skill: "Driving",
    loc: "Mumbai",
    tasks: 17,
    ac: "teal",
  },
  {
    name: "Meera Iyer",
    skill: "Cooking",
    loc: "Chennai",
    tasks: 15,
    ac: "blue",
  },
  {
    name: "Karan Singh",
    skill: "Medical",
    loc: "Hyderabad",
    tasks: 12,
    ac: "danger",
  },
];

const DUMMY_URGENT = [
  {
    area: "South Market",
    type: "Food",
    note: "~800 people without food supplies",
  },
  {
    area: "West Colony",
    type: "Medical",
    note: "Clinic running out of medicines",
  },
  { area: "East Block", type: "Logistics", note: "Supply chain disruption" },
  { area: "Hill Side", type: "Water", note: "Contaminated water source" },
  { area: "Central Zone", type: "Shelter", note: "40 families displaced" },
];

const ASSIGN_RESULTS = [
  {
    vol: "Arjun Kumar",
    area: "East Block",
    task: "Logistics Coordination",
    type: "success",
  },
  {
    vol: "Sonia Patel",
    area: "Central Zone",
    task: "Emergency Shelter Setup",
    type: "urgent",
  },
  {
    vol: "Deepa Rao",
    area: "South Market",
    task: "Food Distribution",
    type: "success",
  },
  {
    vol: "Karan Singh",
    area: "Hill Side",
    task: "Water Safety Testing",
    type: "urgent",
  },
];

/* ── Render Tasks Table ── */
let allTasks = [...DUMMY_TASKS];

function renderTable(tasks) {
  const tbody = document.getElementById("tasksBody");
  if (!tbody) return;

  const statusBadge = {
    Assigned: "badge-blue",
    Urgent: "badge-danger",
    Pending: "badge-warning",
    Completed: "badge-success",
  };

  const severityColor = {
    High: "badge-danger",
    Medium: "badge-warning",
    Low: "badge-success",
  };

  tbody.innerHTML = tasks
    .map(
      (t) => `
    <tr>
      <td><span style="font-family:monospace;font-size:0.8rem;color:var(--muted)">${t.id}</span></td>
      <td style="font-weight:500;color:var(--off-white)">${t.area}</td>
      <td>
        <span class="badge badge-muted">${t.type}</span>
      </td>
      <td><span class="badge ${severityColor[t.severity] || "badge-muted"}">${t.severity}</span></td>
      <td>
        ${
          t.volunteer !== "—"
            ? `
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="avatar ${t.ac}" style="width:28px;height:28px;font-size:0.7rem">${t.avatar}</div>
            <span style="font-size:0.88rem">${t.volunteer}</span>
          </div>
        `
            : `<span style="color:var(--muted-2);font-size:0.85rem">Unassigned</span>`
        }
      </td>
      <td><span class="badge ${statusBadge[t.status] || "badge-muted"}">${t.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="showToast('🔍 Viewing task ${t.id}', 'info')">
          View
        </button>
      </td>
    </tr>
  `,
    )
    .join("");

  const count = document.getElementById("tableCount");
  if (count)
    count.textContent = `Showing ${tasks.length} of ${allTasks.length} tasks`;
}

/* ── Filter Table ── */
function filterTable(query = "") {
  const statusFilter = document.getElementById("filterStatus")?.value || "";
  const q = query.toLowerCase();

  const filtered = allTasks.filter((t) => {
    const matchQ =
      !q ||
      t.area.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.volunteer.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q);
    const matchS = !statusFilter || t.status === statusFilter;
    return matchQ && matchS;
  });

  renderTable(filtered);
}

/* ── Render Volunteers ── */
function renderVolunteers() {
  const list = document.getElementById("volList");
  if (!list) return;

  // Merge with localStorage volunteers
  const stored = JSON.parse(
    localStorage.getItem("ss_volunteers") || "[]",
  ).slice(0, 3);
  const storedMapped = stored.map((v, i) => ({
    name: v.name,
    skill: v.skill,
    loc: v.location,
    tasks: Math.floor(Math.random() * 10) + 1,
    ac: ["blue", "purple", "teal"][i % 3],
  }));

  const vols = [...storedMapped, ...DUMMY_VOLUNTEERS].slice(0, 5);
  const colors = ["blue", "purple", "teal", "blue", "danger"];

  list.innerHTML = vols
    .map((v, i) => {
      const initials = v.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      return `
      <div class="vol-item">
        <div class="avatar ${v.ac || colors[i % colors.length]}">${initials}</div>
        <div class="vol-info">
          <p class="vol-name">${v.name}</p>
          <p class="vol-meta">${v.skill} · ${v.loc}</p>
        </div>
        <span class="vol-tasks">${v.tasks} tasks</span>
      </div>
    `;
    })
    .join("");
}

/* ── Render Urgent Needs ── */
function renderUrgent() {
  const list = document.getElementById("urgentList");
  if (!list) return;

  // Merge stored reports
  const stored = JSON.parse(localStorage.getItem("ss_reports") || "[]")
    .filter((r) => r.severity === "High" || r.urgent)
    .slice(0, 3)
    .map((r) => ({
      area: r.areaName,
      type: r.problemType,
      note: r.description || "Needs immediate attention",
    }));

  const urgent = [...stored, ...DUMMY_URGENT].slice(0, 5);

  list.innerHTML = urgent
    .map(
      (u) => `
    <div class="urgent-item">
      <div class="urgent-pulse"></div>
      <div>
        <p class="urgent-title">${u.area} — ${u.type}</p>
        <p class="urgent-meta">${u.note.slice(0, 60)}${u.note.length > 60 ? "…" : ""}</p>
      </div>
    </div>
  `,
    )
    .join("");
}

/* ── Auto-Assign ── */
let assignDone = false;

function runAutoAssign() {
  const btn = document.getElementById("assignBtn");
  const results = document.getElementById("assignResults");
  if (!btn || !results) return;

  if (assignDone) {
    results.innerHTML = "";
    assignDone = false;
  }

  btn.classList.add("loading");
  btn.textContent = "Running algorithm…";
  results.innerHTML = `<div class="assign-empty">⚙️ Analyzing needs and matching volunteers…</div>`;

  // Simulate progressive assignment
  let delay = 1000;
  setTimeout(() => {
    results.innerHTML = "";
    btn.classList.remove("loading");
    btn.textContent = "🔄 Re-Run Assignment";
    assignDone = true;

    ASSIGN_RESULTS.forEach((r, i) => {
      setTimeout(() => {
        const item = document.createElement("div");
        item.className = `assign-result-item ${r.type}`;
        item.style.animationDelay = `${i * 0.1}s`;
        item.innerHTML = `
          <p>✅ <strong style="color:var(--white)">${r.vol}</strong> → ${r.area}</p>
          <small>Task: ${r.task}</small>
        `;
        results.appendChild(item);

        // Update a task in the table
        const pending = allTasks.find((t) => t.status === "Pending");
        if (pending) {
          pending.volunteer = r.vol;
          pending.status = "Assigned";
          pending.avatar = r.vol
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2);
          pending.ac = "blue";
          renderTable(allTasks);
        }
      }, i * 500);
    });

    showToast("⚡ 4 volunteers successfully assigned!", "success", 4000);

    // Decrement urgent count
    const urgentStat = document.getElementById("statUrgent");
    if (urgentStat) {
      const current = parseInt(urgentStat.textContent);
      animateCount(urgentStat, Math.max(0, current - 4));
    }
    const assignedStat = document.getElementById("statAssigned");
    if (assignedStat) {
      const current = parseInt(assignedStat.textContent.replace(",", ""));
      animateCount(assignedStat, current + 4);
    }
  }, delay + 400);
}

/* ── Progress Bars Animation ── */
function animateBars() {
  document.querySelectorAll(".progress-bar[data-target]").forEach((bar) => {
    const target = bar.dataset.target;
    bar.style.setProperty("--target-width", target + "%");
    setTimeout(() => {
      bar.style.width = target + "%";
    }, 300);
  });
}

/* ── Refresh ── */
function refreshData() {
  showToast("🔄 Data refreshed!", "info", 2000);
  const stats = [
    { id: "statAreas", val: 83 + Math.floor(Math.random() * 5) },
    { id: "statVols", val: 247 + Math.floor(Math.random() * 10) },
    { id: "statUrgent", val: 15 + Math.floor(Math.random() * 5) },
    { id: "statAssigned", val: 1204 + Math.floor(Math.random() * 50) },
  ];
  stats.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) animateCount(el, s.val);
  });
}

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  renderTable(DUMMY_TASKS);
  renderVolunteers();
  renderUrgent();
  animateBars();

  // Animate stat cards on load
  setTimeout(() => {
    animateCount(document.getElementById("statAreas"), 83);
    animateCount(document.getElementById("statVols"), 247);
    animateCount(document.getElementById("statUrgent"), 18);
    animateCount(document.getElementById("statAssigned"), 1204);
  }, 400);

  // Initial assign results placeholder
  const results = document.getElementById("assignResults");
  if (results) {
    results.innerHTML = `<div class="assign-empty">Click the button above to automatically assign available volunteers to pending tasks.</div>`;
  }
});

/* ── Expose filter to HTML ── */
window.filterTable = filterTable;
window.runAutoAssign = runAutoAssign;
window.refreshData = refreshData;
