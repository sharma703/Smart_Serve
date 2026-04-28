/* ============================================================
   SmartServe — community.js  (API-connected version)
   ============================================================ */

'use strict';

const API_BASE = 'http://localhost:5000/api';

// ── Character count ──
const descArea  = document.getElementById('description');
const descCount = document.getElementById('descCount');
if (descArea) {
  descArea.addEventListener('input', () => {
    const len = descArea.value.length;
    descCount.textContent = len;
    if (len > 500) { descArea.value = descArea.value.slice(0, 500); descCount.textContent = 500; }
    descCount.style.color = len > 450 ? 'var(--warning)' : 'var(--muted-2)';
  });
}

// ── Map placeholder click ──
const mapPlaceholder = document.querySelector('.map-placeholder');
if (mapPlaceholder) {
  mapPlaceholder.addEventListener('click', () => {
    const loc = document.getElementById('location');
    if (loc && !loc.value) {
      loc.value = '12.9716° N, 77.5946° E';
      loc.classList.add('valid');
      showToast('📍 Location pinned on map!', 'success');
    }
  });
}

// ── Load & display recent reports from API ──
async function loadRecentReports() {
  try {
    const res  = await fetch(`${API_BASE}/reports?limit=3&page=1`);
    const json = await res.json();
    if (!json.success || !json.data.length) return;

    const container = document.querySelector('.recent-reports');
    if (!container) return;

    const severityBadge = {
      High:   { cls: 'badge-danger',  label: 'Urgent' },
      Medium: { cls: 'badge-warning', label: 'Active' },
      Low:    { cls: 'badge-success', label: 'Logged' },
    };

    const typeIcon = { Food:'🥘', Medical:'🏥', Education:'📚', Logistics:'🚛', Shelter:'🏠', Water:'💧' };

    container.innerHTML = json.data.map(r => {
      const sb = severityBadge[r.severity] || severityBadge.Low;
      const timeAgo = getTimeAgo(r.createdAt);
      return `
        <div class="recent-item">
          <div class="recent-icon" style="background:rgba(61,111,255,0.1);color:var(--blue-light)">
            ${typeIcon[r.problemType] || '📋'}
          </div>
          <div>
            <p class="recent-area">${r.areaName}</p>
            <p class="recent-meta">${r.problemType} · ${r.severity} · ${timeAgo}</p>
          </div>
          <span class="badge ${sb.cls}">${sb.label}</span>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.warn('[community] Could not load recent reports:', err.message);
  }
}

// ── Form Submission ──
const communityForm = document.getElementById('communityForm');
if (communityForm) {
  communityForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate fields
    const v1 = validateRequired('areaName');
    const v2 = validateSelect('problemType');
    const v3 = validateRequired('location');

    const severityVal = document.querySelector('input[name="severity"]:checked');
    const severityErr = document.getElementById('severityError');
    if (!severityVal) severityErr.style.display = 'block';
    else              severityErr.style.display = 'none';

    if (!v1 || !v2 || !v3 || !severityVal) {
      showToast('⚠️ Please fill in all required fields.', 'error');
      return;
    }

    // Show loading state
    const btn     = document.getElementById('submitBtn');
    const btnText = btn.querySelector('.btn-text');
    btn.classList.add('loading');
    btnText.textContent = 'Submitting…';

    try {
      const payload = {
        areaName:    document.getElementById('areaName').value.trim(),
        problemType: document.getElementById('problemType').value,
        severity:    severityVal.value,
        location:    document.getElementById('location').value.trim(),
        population:  document.getElementById('population').value || null,
        description: descArea?.value?.trim() || '',
        urgent:      document.getElementById('urgentFlag').checked,
      };

      const res  = await fetch(`${API_BASE}/reports`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        // Handle validation errors from server
        if (json.errors && json.errors.length) {
          const msg = json.errors.map(e => e.message).join(', ');
          showToast(`⚠️ ${msg}`, 'error', 5000);
        } else {
          showToast(`❌ ${json.message || 'Submission failed.'}`, 'error');
        }
        return;
      }

      // Success
      document.getElementById('reportId').textContent = '#' + json.data.id.slice(0, 8).toUpperCase();
      openModal('successModal');

      // Reset form
      communityForm.reset();
      document.querySelectorAll('.form-control').forEach(el => el.classList.remove('valid', 'invalid'));
      if (descCount) descCount.textContent = '0';

      // Reload recent reports panel
      loadRecentReports();

    } catch (err) {
      console.error('[community] Submit error:', err);
      showToast('🔌 Cannot connect to server. Is the backend running?', 'error', 5000);
    } finally {
      btn.classList.remove('loading');
      btnText.textContent = '📋 Submit Report';
    }
  });
}

// ── Real-time field validation ──
['areaName', 'location'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('blur', () => validateRequired(id));
});
const ptSelect = document.getElementById('problemType');
if (ptSelect) ptSelect.addEventListener('change', () => validateSelect('problemType'));

document.querySelectorAll('input[name="severity"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const err = document.getElementById('severityError');
    if (err) err.style.display = 'none';
  });
});

// ── Utility: human-readable time ──
function getTimeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Init ──
document.addEventListener('DOMContentLoaded', loadRecentReports);
