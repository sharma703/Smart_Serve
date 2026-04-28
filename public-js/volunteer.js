/* ============================================================
   SmartServe — volunteer.js  (API-connected version)
   ============================================================ */

'use strict';

const API_BASE = 'http://localhost:5000/api';

let currentStep    = 1;
const selectedSkills = new Set();

// ── Step Navigation ──
function nextStep(step) {
  if (step > currentStep) {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
  }

  document.getElementById(`step-${currentStep}`).classList.add('hidden');
  document.getElementById(`step-${step}`).classList.remove('hidden');

  document.querySelectorAll('.form-step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active', 'completed');
    if (n === step) s.classList.add('active');
    if (n < step)  s.classList.add('completed');
    const circle = s.querySelector('.step-circle');
    circle.textContent = n < step ? '✓' : n;
  });

  currentStep = step;
  if (step === 3) updatePreview();
}

function validateStep1() {
  const v1 = validateRequired('volName');
  const v2 = validateEmail('volEmail');
  const v3 = validateRequired('volPhone');
  const v4 = validateRequired('volLocation');
  if (!v1 || !v2 || !v3 || !v4) {
    showToast('⚠️ Please fill in all personal details.', 'error');
    return false;
  }
  return true;
}

function validateStep2() {
  const v1 = validateSelect('volSkill');
  if (!v1) { showToast('⚠️ Please select your primary skill.', 'error'); return false; }
  return true;
}

// ── Skill Chips ──
document.querySelectorAll('.skill-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('selected');
    const skill = chip.dataset.skill;
    if (chip.classList.contains('selected')) selectedSkills.add(skill);
    else selectedSkills.delete(skill);
  });
});

// ── Day Toggles ──
document.querySelectorAll('.day-toggle').forEach(day => {
  day.addEventListener('click', () => day.classList.toggle('selected'));
});

// ── Preview Update ──
function updatePreview() {
  const name  = document.getElementById('volName')?.value || '';
  const skill = document.getElementById('volSkill')?.value || '';
  const loc   = document.getElementById('volLocation')?.value || '';

  const nameEl  = document.getElementById('previewName');
  const skillEl = document.getElementById('previewSkill');
  const avatar  = document.getElementById('previewAvatar');

  if (nameEl)  nameEl.textContent  = name || 'Your Name';
  if (skillEl) skillEl.textContent = [skill, loc].filter(Boolean).join(' · ') || 'Skill · Location';
  if (avatar && name) {
    avatar.textContent = name.trim().split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();
  }
}

// ── Load recent volunteers from API ──
async function loadRecentVolunteers() {
  try {
    const res  = await fetch(`${API_BASE}/volunteers?limit=3`);
    const json = await res.json();
    if (!json.success || !json.data.length) return;

    const container = document.querySelector('.recent-reports');
    if (!container) return;
    const colors = ['blue', 'purple', 'teal'];

    container.innerHTML = json.data.map((v, i) => {
      const initials = v.name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();
      const timeAgo  = getTimeAgo(v.createdAt);
      return `
        <div class="recent-item">
          <div class="avatar ${colors[i % 3]}">${initials}</div>
          <div>
            <p class="recent-area">${v.name}</p>
            <p class="recent-meta">${v.skill} · ${v.location} · Joined ${timeAgo}</p>
          </div>
        </div>
      `;
    }).join('');

    // Update count
    const countEl = document.querySelector('.vol-count-num');
    if (countEl) countEl.textContent = json.total;

  } catch (err) {
    console.warn('[volunteer] Could not load recent volunteers:', err.message);
  }
}

// ── Form Submit ──
const volunteerForm = document.getElementById('volunteerForm');
if (volunteerForm) {
  volunteerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('volSubmitBtn');
    btn.classList.add('loading');
    btn.textContent = 'Registering…';

    try {
      const selectedDays = [...document.querySelectorAll('.day-toggle.selected')].map(d => d.dataset.day);
      const timeSlot     = document.querySelector('input[name="timeSlot"]:checked')?.value || 'Anytime';

      const payload = {
        name:             document.getElementById('volName').value.trim(),
        email:            document.getElementById('volEmail').value.trim(),
        phone:            document.getElementById('volPhone').value.trim(),
        location:         document.getElementById('volLocation').value.trim(),
        age:              document.getElementById('volAge').value || null,
        skill:            document.getElementById('volSkill').value,
        additionalSkills: [...selectedSkills],
        experience:       document.getElementById('experience').value,
        bio:              document.getElementById('bio').value.trim(),
        availability:     { days: selectedDays, timeSlot },
        hoursPerWeek:     document.getElementById('hoursPerWeek').value,
        startDate:        document.getElementById('startDate').value || null,
        emergency:        document.getElementById('emergencyAvail').checked,
      };

      const res  = await fetch(`${API_BASE}/volunteers`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          showToast('⚠️ This email is already registered.', 'error', 5000);
        } else if (json.errors) {
          showToast(`⚠️ ${json.errors.map(e => e.message).join(', ')}`, 'error', 5000);
        } else {
          showToast(`❌ ${json.message || 'Registration failed.'}`, 'error');
        }
        return;
      }

      // Success
      document.getElementById('volId').textContent = '#' + json.data.id.slice(0, 8).toUpperCase();
      openModal('successModal');

      // Reset
      volunteerForm.reset();
      currentStep = 1;
      nextStep(1);
      document.querySelectorAll('.form-control').forEach(el => el.classList.remove('valid','invalid'));
      document.querySelectorAll('.skill-chip').forEach(c => c.classList.remove('selected'));
      document.querySelectorAll('.day-toggle').forEach(d => d.classList.remove('selected'));
      selectedSkills.clear();

      loadRecentVolunteers();

    } catch (err) {
      console.error('[volunteer] Submit error:', err);
      showToast('🔌 Cannot connect to server. Is the backend running?', 'error', 5000);
    } finally {
      btn.classList.remove('loading');
      btn.textContent = '🙋 Complete Registration';
    }
  });
}

// ── Real-time validation ──
['volName','volPhone','volLocation'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('blur', () => validateRequired(id));
});
const emailEl = document.getElementById('volEmail');
if (emailEl) emailEl.addEventListener('blur', () => validateEmail('volEmail'));

// ── Util ──
function getTimeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Init ──
document.addEventListener('DOMContentLoaded', loadRecentVolunteers);
