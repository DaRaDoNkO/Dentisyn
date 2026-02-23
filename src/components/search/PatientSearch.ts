import { patientRepository } from '../../repositories/patientRepository';
import { appointmentRepository } from '../../repositories/appointmentRepository';
import { getPunctualityIcon } from '../../services/patientStatsService';
import i18next from '../../i18n';
import type { Patient } from '../../types/patient';

/**
 * Render the search dropdown HTML (inserted into Navbar)
 */
export function renderSearchDropdown(): string {
  return `
    <div id="globalSearchOverlay" class="position-fixed d-none"
      style="inset:0;z-index:1055;background:rgba(0,0,0,.35)">
      <div class="position-absolute top-0 start-50 translate-middle-x mt-4"
        style="width:min(520px,90vw)">
        <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div class="card-body p-3">
            <div class="input-group mb-2">
              <span class="input-group-text bg-transparent border-end-0">
                <i class="bi bi-search"></i>
              </span>
              <input type="text" class="form-control border-start-0"
                id="globalSearchInput"
                placeholder="${i18next.t('table.search', 'Search')}"
                autocomplete="off">
              <button type="button" class="btn btn-outline-secondary" id="globalSearchClose">
                <kbd>Esc</kbd>
              </button>
            </div>
            <div id="globalSearchResults"
              style="max-height:320px;overflow-y:auto">
              <p class="text-muted small text-center my-3"
                data-i18n="table.searchHint">
                ${i18next.t('table.searchHint', 'Search by name, phone, EGN/LNCh, or email')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/**
 * Setup search event handlers
 * @param getCurrentView - Returns the current view ('dashboard'|'calendar'|'settings')
 * @param navigateTo - Function to navigate to a view
 */
export function setupGlobalSearch(
  getCurrentView: () => string,
  navigateTo: (view: string) => void
): void {
  const overlay = document.getElementById('globalSearchOverlay');
  const input = document.getElementById('globalSearchInput') as HTMLInputElement;
  const results = document.getElementById('globalSearchResults');
  const closeBtn = document.getElementById('globalSearchClose');
  const searchBtn = document.getElementById('globalSearchBtn');

  if (!overlay || !input || !results) return;

  const open = () => {
    overlay.classList.remove('d-none');
    input.value = '';
    results.innerHTML = `<p class="text-muted small text-center my-3">${i18next.t('table.searchHint', 'Search by name, phone, EGN/LNCh, or email')}</p>`;
    setTimeout(() => input.focus(), 50);
  };

  const close = () => {
    overlay.classList.add('d-none');
    input.value = '';
  };

  // Open triggers
  searchBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    open();
  });

  // Ctrl+K shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      open();
    }
    if (e.key === 'Escape' && !overlay.classList.contains('d-none')) {
      close();
    }
  });

  // Close triggers
  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Search input handler with debounce
  let debounceTimer: ReturnType<typeof setTimeout>;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const query = input.value.trim();
      if (query.length < 2) {
        results.innerHTML = `<p class="text-muted small text-center my-3">${i18next.t('table.searchHint', 'Search by name, phone, EGN/LNCh, or email')}</p>`;
        return;
      }
      renderResults(query, results, getCurrentView, navigateTo, close);
    }, 200);
  });
}

function renderResults(
  query: string,
  container: HTMLElement,
  getCurrentView: () => string,
  navigateTo: (view: string) => void,
  close: () => void
): void {
  const patients = searchPatients(query);

  if (patients.length === 0) {
    container.innerHTML = `
      <div class="text-center py-3">
        <p class="text-muted small mb-2">${i18next.t('table.noResults', 'No results found')}</p>
        <button type="button" class="btn btn-sm btn-outline-primary" id="searchNewPatientBtn">
          <i class="bi bi-person-plus me-1"></i>
          ${i18next.t('table.newPatient', 'New Patient')}
        </button>
      </div>`;
    document.getElementById('searchNewPatientBtn')?.addEventListener('click', () => {
      close();
      navigateTo('patients');
    });
    return;
  }

  const view = getCurrentView();
  const html = patients.map(p => {
    const icon = getPunctualityIcon(p.id);
    const idInfo = p.idType && p.idNumber
      ? `<span class="badge bg-secondary-subtle text-secondary me-1">${p.idType}</span>`
      : '';

    // Get upcoming appointments count
    const appts = appointmentRepository.getAll()
      .filter(a => a.patientId === p.id);
    const upcomingCount = appts.filter(a =>
      new Date(a.startTime) >= new Date() &&
      a.status !== 'Cancelled' && a.status !== 'NoShow'
    ).length;

    return `
      <button type="button" class="list-group-item list-group-item-action search-result-item py-2"
        data-patient-id="${p.id}">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-semibold">
              ${icon} ${p.name}
            </div>
            <small class="text-muted">
              <i class="bi bi-telephone me-1"></i>${p.phone}
              ${idInfo}
            </small>
          </div>
          <div class="text-end">
            ${upcomingCount > 0
        ? `<span class="badge bg-primary-subtle text-primary">${upcomingCount} ${i18next.t('table.upcoming', 'upcoming')}</span>`
        : ''}
          </div>
        </div>
      </button>`;
  }).join('');

  container.innerHTML = `<div class="list-group list-group-flush">${html}</div>`;

  // Attach click handlers based on current view
  container.querySelectorAll('.search-result-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const patientId = (btn as HTMLElement).dataset.patientId!;
      close();
      handleSearchResultClick(patientId, view, navigateTo);
    });
  });
}

function handleSearchResultClick(
  patientId: string,
  currentView: string,
  navigateTo: (view: string) => void
): void {
  const patient = patientRepository.getById(patientId);
  if (!patient) return;

  console.info(
    `[AUDIT] SEARCH_RESULT_CLICK | Patient: ${patientId} ` +
    `| View: ${currentView} | Time: ${new Date().toISOString()}`
  );

  if (currentView === 'dashboard') {
    // From dashboard: switch to calendar, show patient's appointments
    navigateTo('calendar');
  } else if (currentView === 'calendar') {
    // From calendar: show patient appointments in a popover
    showPatientAppointmentsPopover(patientId);
  } else {
    // From patients tab or other: open carton (placeholder)
    console.info(`[AUDIT] OPEN_CARTON | Patient: ${patientId}`);
  }
}

function showPatientAppointmentsPopover(patientId: string): void {
  const patient = patientRepository.getById(patientId);
  if (!patient) return;

  const appointments = appointmentRepository.getAll()
    .filter(a => a.patientId === patientId)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 10);

  // Remove existing popover
  document.getElementById('patientApptsPopover')?.remove();

  const icon = getPunctualityIcon(patientId);
  const rows = appointments.map(a => {
    const dt = new Date(a.startTime);
    const statusClass = a.status === 'Cancelled' ? 'text-danger' :
      a.status === 'NoShow' ? 'text-danger fw-bold' : '';
    return `
      <tr class="${statusClass}">
        <td class="small">${dt.toLocaleDateString()}</td>
        <td class="small">${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td class="small">${a.reason || '-'}</td>
        <td class="small">${a.status}</td>
      </tr>`;
  }).join('');

  const popoverHtml = `
    <div id="patientApptsPopover" class="position-fixed card shadow-lg border-0 rounded-4"
      style="z-index:1060;top:80px;right:20px;width:420px;max-height:400px;overflow-y:auto">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">${icon} ${patient.name}</h6>
        <button type="button" class="btn-close" id="closePatientApptsPopover"></button>
      </div>
      <div class="card-body p-0">
        ${appointments.length > 0 ? `
          <table class="table table-sm mb-0">
            <thead><tr>
              <th class="small">Date</th>
              <th class="small">Time</th>
              <th class="small">Reason</th>
              <th class="small">Status</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>` :
      `<p class="text-muted text-center py-3">${i18next.t('table.noAppointments', 'No appointments')}</p>`}
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', popoverHtml);
  document.getElementById('closePatientApptsPopover')?.addEventListener('click', () => {
    document.getElementById('patientApptsPopover')?.remove();
  });

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      const popover = document.getElementById('patientApptsPopover');
      if (popover && !popover.contains(e.target as Node)) {
        popover.remove();
        document.removeEventListener('click', handler);
      }
    });
  }, 100);
}

/**
 * Search patients by name, phone, EGN/LNCh, or email
 */
function searchPatients(query: string): Patient[] {
  const patients = patientRepository.getAll();
  const lowerQuery = query.toLowerCase().trim();
  return patients.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.phone.includes(lowerQuery) ||
    (p.idNumber && p.idNumber.includes(lowerQuery)) ||
    (p.email && p.email.toLowerCase().includes(lowerQuery))
  );
}
