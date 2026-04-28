/* ============================================================
   SmartServe — volunteer.js
   ============================================================ */

'use strict';

let currentStep = 1;
const selectedSkills = new Set();

// ── Step Navigation ──
function nextStep(step) {
  if (step > currentStep) {
    // Validate current step before advancing
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
  }

  // Hide current, show next
  document.getElementById(`step-${currentStep}`).classList.add('hidden');
  document.getElementById(`step-${step}`).classList.remove('hidden');

  // Update step indicators
  document.querySelectorAll('.form-step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active', 'completed');
    if (n === step) s.classList.add('active');
    if (n < step)  s.classList.add('completed');

    const circle = s.querySelector('.step-circle');
    if (n < step) circle.textContent = '✓';
    else          circle.textContent = n;
  });

  currentStep = step;

  // Update preview on step 3
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
  if (!v1) {
    showToast('⚠️ Please select your primary skill.', 'error');
    return false;
  }
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
  const name   = document.getElementById('volName')?.value || '';
  const skill  = document.getElementById('volSkill')?.value || '';
  const loc    = document.getElementById('volLocation')?.value || '';

  const nameEl  = document.getElementById('previewName');
  const skillEl = document.getElementById('previewSkill');
  const avatar  = document.getElementById('previewAvatar');

  if (nameEl)  nameEl.textContent  = name || 'Your Name';
  if (skillEl) skillEl.textContent = [skill, loc].filter(Boolean).join(' · ') || 'Skill · Location';

  if (avatar && name) {
    const parts = name.trim().split(' ');
    avatar.textContent = parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
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

    await delay(1800);

    // Gather data
    const selectedDays = [...document.querySelectorAll('.day-toggle.selected')].map(d => d.dataset.day);
    const timeSlot = document.querySelector('input[name="timeSlot"]:checked')?.value || 'Anytime';

    const volunteer = {
      id: genId('VOL'),
      name: document.getElementById('volName').value,
      email: document.getElementById('volEmail').value,
      phone: document.getElementById('volPhone').value,
      location: document.getElementById('volLocation').value,
      age: document.getElementById('volAge').value,
      skill: document.getElementById('volSkill').value,
      additionalSkills: [...selectedSkills],
      experience: document.getElementById('experience').value,
      bio: document.getElementById('bio').value,
      availability: { days: selectedDays, timeSlot },
      hoursPerWeek: document.getElementById('hoursPerWeek').value,
      startDate: document.getElementById('startDate').value,
      emergency: document.getElementById('emergencyAvail').checked,
      timestamp: new Date().toISOString()
    };

    const volunteers = JSON.parse(localStorage.getItem('ss_volunteers') || '[]');
    volunteers.unshift(volunteer);
    localStorage.setItem('ss_volunteers', JSON.stringify(volunteers.slice(0, 100)));

    btn.classList.remove('loading');
    btn.textContent = '🙋 Complete Registration';

    document.getElementById('volId').textContent = '#' + volunteer.id;
    openModal('successModal');

    // Reset
    volunteerForm.reset();
    currentStep = 1;
    nextStep(1);
    document.querySelectorAll('.form-control').forEach(el => el.classList.remove('valid', 'invalid'));
    document.querySelectorAll('.skill-chip').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.day-toggle').forEach(d => d.classList.remove('selected'));
    selectedSkills.clear();
  });
}

// ── Close modal resets step ──
window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
};

// ── Real-time validation ──
['volName','volPhone','volLocation'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('blur', () => validateRequired(id));
});
const emailEl = document.getElementById('volEmail');
if (emailEl) emailEl.addEventListener('blur', () => validateEmail('volEmail'));

// ── Util ──
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
