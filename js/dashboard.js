// ============================================
//  Dashboard JS - د. مارينا ميخائيل
//  PIN: 1234 (قابل للتغيير هنا)
// ============================================

const CORRECT_PIN = '01281440083@Marina';
const STORAGE_KEY  = 'dr_marina_clinics';

/* ── Auth ── */
function attemptLogin() {
  const pin = document.getElementById('pin-input').value.trim();
  const hint = document.getElementById('login-hint');
  if (pin.toLowerCase() === CORRECT_PIN.toLowerCase()) {
    sessionStorage.setItem('dm_auth', '1');
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    renderClinics();
  } else {
    hint.textContent = 'الرمز غير صحيح. حاول مرة أخرى.';
    document.getElementById('pin-input').value = '';
    document.getElementById('pin-input').focus();
    setTimeout(() => { hint.textContent = ''; }, 3000);
  }
}

function togglePasswordVisibility() {
  const input = document.getElementById('pin-input');
  const icon = document.getElementById('pwd-eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

function logout() {
  sessionStorage.removeItem('dm_auth');
  location.reload();
}

// Enter key on PIN
document.getElementById('pin-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') attemptLogin();
});

// Auto-login if already authenticated this session
if (sessionStorage.getItem('dm_auth') === '1') {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'flex';
  renderClinics();
  loadSiteSettings();
}

/* ── Tab navigation ── */
function showTab(name, el) {
  // hide all tabs
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

  document.getElementById(`tab-${name}`).style.display = '';
  el.classList.add('active');

  // Update header title
  const titles = {
    clinics: 'إدارة العيادات',
    social: 'إعدادات السوشيال ميديا والخرائط',
    info: 'معلومات الموقع'
  };
  document.getElementById('dash-page-title').textContent = titles[name] || '';

  // Show/hide add button
  document.getElementById('btn-add-clinic').style.display = name === 'clinics' ? 'flex' : 'none';

  if (name === 'social') {
    loadSiteSettings();
  }

  return false;
}

/* ── Site Settings (Social & Maps) ── */
const SETTINGS_KEY = 'dr_marina_site_settings';

function getSiteSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

function loadSiteSettings() {
  const settings = getSiteSettings();
  const fb = document.getElementById('setting-fb');
  const ig = document.getElementById('setting-ig');
  const tt = document.getElementById('setting-tt');
  const yt = document.getElementById('setting-yt');
  const mapsEmbed = document.getElementById('setting-maps-embed');
  const mapsDir = document.getElementById('setting-maps-directions');

  if (fb) fb.value = settings.fb || '';
  if (ig) ig.value = settings.ig || '';
  if (tt) tt.value = settings.tt || '';
  if (yt) yt.value = settings.yt || '';
  if (mapsEmbed) mapsEmbed.value = settings.mapsEmbed || '';
  if (mapsDir) mapsDir.value = settings.mapsDir || '';
}

function saveSiteSettings(e) {
  e.preventDefault();
  let rawMapsEmbed = document.getElementById('setting-maps-embed').value.trim();

  // If user pasted whole iframe tag e.g. <iframe src="...">, extract just the src
  if (rawMapsEmbed.includes('<iframe')) {
    const srcMatch = rawMapsEmbed.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      rawMapsEmbed = srcMatch[1];
      document.getElementById('setting-maps-embed').value = rawMapsEmbed;
    }
  }

  const settings = {
    fb: document.getElementById('setting-fb').value.trim(),
    ig: document.getElementById('setting-ig').value.trim(),
    tt: document.getElementById('setting-tt').value.trim(),
    yt: document.getElementById('setting-yt').value.trim(),
    mapsEmbed: rawMapsEmbed,
    mapsDir: document.getElementById('setting-maps-directions').value.trim()
  };

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  showToast('تم حفظ روابط السوشيال ميديا وجوجل ماب بنجاح ✅', 'success');
}

/* ── Clinics CRUD ── */
function getClinics() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveClinicsToStorage(clinics) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clinics));
}

function renderClinics() {
  const clinics = getClinics();
  const list    = document.getElementById('clinics-list');
  const empty   = document.getElementById('empty-state');

  if (clinics.length === 0) {
    list.innerHTML = '';
    empty.style.display = '';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = clinics.map((c, i) => `
    <div class="dash-card" id="clinic-card-${c.id}" data-id="${escapeHTML(c.id)}">
      <div class="dash-card-header">
        <div>
          <div class="dash-card-tag">عيادة ${i + 2}</div>
          <h3>${escapeHTML(c.name)}</h3>
        </div>
        <div class="clinic-actions">
          <button class="btn-edit" onclick="editClinic('${escapeHTML(c.id)}')" aria-label="تعديل ${escapeHTML(c.name)}">
            <i class="fas fa-pen"></i> تعديل
          </button>
          <button class="btn-delete" onclick="deleteClinic('${escapeHTML(c.id)}')" aria-label="حذف ${escapeHTML(c.name)}">
            <i class="fas fa-trash"></i> حذف
          </button>
        </div>
      </div>
      <div class="dash-card-body">
        <div class="info-row"><i class="fas fa-map-marker-alt"></i><span>${escapeHTML(c.address)}</span></div>
        ${c.city ? `<div class="info-row"><i class="fas fa-city"></i><span>${escapeHTML(c.city)}</span></div>` : ''}
        ${c.hours ? `<div class="info-row"><i class="fas fa-clock"></i><span>${escapeHTML(c.hours)}</span></div>` : ''}
        <div class="info-row"><i class="fas fa-phone-alt"></i><span>${escapeHTML(c.phone)}</span></div>
        ${c.whatsapp ? `<div class="info-row"><i class="fab fa-whatsapp"></i><span>${escapeHTML(c.whatsapp)}</span></div>` : ''}
      </div>
    </div>
  `).join('');
}

/* ── Modal ── */
let editingId = null;

function openModal(id = null) {
  editingId = id;
  const modal = document.getElementById('modal-overlay');
  const form  = document.getElementById('clinic-form');
  form.reset();
  document.getElementById('clinic-id').value = '';

  if (id) {
    const clinic = getClinics().find(c => c.id === id);
    if (!clinic) return;
    document.getElementById('modal-title').textContent = 'تعديل العيادة';
    document.getElementById('clinic-id').value = clinic.id;
    document.getElementById('field-name').value     = clinic.name    || '';
    document.getElementById('field-city').value     = clinic.city    || '';
    document.getElementById('field-address').value  = clinic.address || '';
    document.getElementById('field-phone').value    = clinic.phone   || '';
    document.getElementById('field-whatsapp').value = clinic.whatsapp || '';
    document.getElementById('field-hours').value    = clinic.hours   || '';
  } else {
    document.getElementById('modal-title').textContent = 'إضافة عيادة جديدة';
  }

  modal.style.display = 'flex';
  document.getElementById('field-name').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  editingId = null;
}

// Close on overlay click
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

function saveClinic(e) {
  e.preventDefault();
  const id      = document.getElementById('clinic-id').value;
  const name    = document.getElementById('field-name').value.trim();
  const city    = document.getElementById('field-city').value.trim();
  const address = document.getElementById('field-address').value.trim();
  const phone   = document.getElementById('field-phone').value.trim();
  const whatsapp = document.getElementById('field-whatsapp').value.trim() || ('20' + phone.replace(/^0/, ''));
  const hours   = document.getElementById('field-hours').value.trim();

  const clinics = getClinics();

  if (id) {
    // Edit
    const idx = clinics.findIndex(c => c.id === id);
    if (idx !== -1) {
      clinics[idx] = { id, name, city, address, phone, whatsapp, hours };
      showToast('تم تعديل العيادة بنجاح ✅', 'success');
    }
  } else {
    // Add
    const newClinic = {
      id: 'clinic_' + Date.now(),
      name, city, address, phone, whatsapp, hours
    };
    clinics.push(newClinic);
    showToast('تمت إضافة العيادة بنجاح ✅', 'success');
  }

  saveClinicsToStorage(clinics);
  renderClinics();
  closeModal();
}

function editClinic(id) { openModal(id); }

function deleteClinic(id) {
  if (!confirm('هل أنت متأكد من حذف هذه العيادة؟')) return;
  const clinics = getClinics().filter(c => c.id !== id);
  saveClinicsToStorage(clinics);
  renderClinics();
  showToast('تم حذف العيادة', 'error');
}

/* ── Toast ── */
let toastTimer;
function showToast(msg, type = '') {
  let toast = document.getElementById('toast-el');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-el';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  void toast.offsetWidth; // reflow
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ── Utility ── */
function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
