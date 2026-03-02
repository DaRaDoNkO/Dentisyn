import { patientRepository } from '../../../repositories/patientRepository';
import { getPunctualityIcon } from '../../../services/patientStatsService';
import {
  renderPatientCarton as renderCartonView,
  renderCartonContent,
  renderPeriodonticPlaceholder,
  renderAppointmentHistory
} from './render';
import { renderNewPatientForm, initNewPatientForm } from '../NewPatient/index';
import type { Appointment } from '../../../types/patient';

/**
 * Initialize Patient Carton event handlers
 * @param preselectedId - If provided, skip search setup
 */
export function initPatientCarton(preselectedId?: string): void {
  if (preselectedId) {
    setupCartonTabs();
    setupBackToSearch();
    setupEditButton();
  } else {
    setupCartonSearch();
  }
}

// ─── Search within Carton ────────────────────────────

function setupCartonSearch(): void {
  const input = document.getElementById('cartonSearchInput') as HTMLInputElement | null;
  if (!input) return;

  let debounce: ReturnType<typeof setTimeout>;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const query = input.value.trim();
      renderSearchResults(query);
    }, 250);
  });

  input.focus();
  setupNewPatientButton();
}

function setupNewPatientButton(): void {
  document.getElementById('cartonCreateNewBtn')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('patient:createNew'));
  });
}

function renderSearchResults(query: string): void {
  const container = document.getElementById('cartonSearchResults');
  if (!container) return;

  if (query.length < 2) {
    container.innerHTML = '';
    return;
  }

  const results = patientRepository.search(query).slice(0, 10);

  if (results.length === 0) {
    container.innerHTML = `
      <div class="list-group-item text-muted text-center small py-2">
        No patients found
      </div>`;
    return;
  }

  container.innerHTML = results.map(p => `
    <button type="button" class="list-group-item list-group-item-action carton-search-result"
      data-patient-id="${p.id}">
      <div class="d-flex justify-content-between align-items-center">
        <span>
          ${getPunctualityIcon(p.id)}
          <strong class="ms-1">${p.name}</strong>
          <small class="text-muted ms-2">${p.phone}</small>
        </span>
        ${p.idType ? `<span class="badge bg-light text-dark">${p.idType}</span>` : ''}
      </div>
    </button>
  `).join('');

  // Wire click handlers
  container.querySelectorAll('.carton-search-result').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = (btn as HTMLElement).dataset.patientId ?? '';
      openCartonForPatient(pid);
    });
  });
}

function openCartonForPatient(patientId: string): void {
  const patient = patientRepository.getById(patientId);
  if (!patient) return;

  const container = document.getElementById('cartonContainer');
  if (!container) return;

  container.outerHTML = renderCartonContent(patient);
  setupCartonTabs();
  setupBackToSearch();
  setupEditButton();

  console.info(
    `[AUDIT] OPEN_CARTON | Patient: ${patient.name} | ID: ${patientId} | Time: ${new Date().toISOString()}`
  );
}

// ─── Edit Patient ────────────────────────────────────

function setupEditButton(): void {
  document.getElementById('cartonEditBtn')?.addEventListener('click', () => {
    const patientIdEl = document.getElementById('cartonPatientId');
    const patientId = patientIdEl?.dataset.patientId ?? '';
    if (!patientId) return;
    openEditForm(patientId);
  });
}

function openEditForm(patientId: string): void {
  const patient = patientRepository.getById(patientId);
  if (!patient) return;

  const container = document.getElementById('cartonContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="card shadow-sm border-0 rounded-4">
      <div class="card-header bg-transparent border-bottom-0 pt-4 px-4 pb-0">
        <div class="d-flex align-items-center gap-2 mb-1">
          <div class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center
            justify-content-center" style="width:38px;height:38px">
            <i class="bi bi-pencil text-primary"></i>
          </div>
          <div>
            <h5 class="mb-0 fw-bold">${patient.name}</h5>
            <small class="text-muted" data-i18n="patient.editPatientSub">
              Edit patient information
            </small>
          </div>
        </div>
      </div>
      <div class="card-body p-4">
        ${renderNewPatientForm()}
      </div>
    </div>
  `;

  initNewPatientForm(patientId);

  // One-time listeners: re-open carton after save or cancel
  const onDone = (e: Event): void => {
    const ev = e as CustomEvent<{ patientId: string }>;
    document.removeEventListener('patient:editSaved', onDone);
    document.removeEventListener('patient:editCancelled', onDone);
    openCartonForPatient(ev.detail.patientId);
  };

  document.addEventListener('patient:editSaved', onDone);
  document.addEventListener('patient:editCancelled', onDone);

  console.info(
    `[AUDIT] EDIT_CARTON_OPEN | Patient: ${patient.name} | ID: ${patientId} | Time: ${new Date().toISOString()}`
  );
}

// ─── Carton Tab Navigation ───────────────────────────

function setupCartonTabs(): void {
  const tabs = document.querySelectorAll('#cartonTabs .nav-link');
  const content = document.getElementById('cartonTabContent');
  if (!content) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = (tab as HTMLElement).dataset.cartonTab ?? 'treatment';

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      renderTabContent(tabName, content);
    });
  });
}

function renderTabContent(tab: string, container: HTMLElement): void {
  if (tab === 'treatment') {
    container.innerHTML = renderTreatmentTab();
  } else if (tab === 'periodontic') {
    container.innerHTML = renderPeriodonticPlaceholder();
  } else if (tab === 'history') {
    const dataEl = document.getElementById('cartonAppointmentsData');
    const raw = dataEl?.dataset.appointments ?? '[]';
    const appointments: Appointment[] = JSON.parse(raw);
    container.innerHTML = renderAppointmentHistory(appointments);
  }
}

function renderTreatmentTab(): string {
  return `
    <div class="card border-0 bg-body-tertiary rounded-3">
      <div class="card-body text-center py-5">
        <i class="bi bi-clipboard2-pulse text-muted" style="font-size:2.5rem"></i>
        <p class="mt-3 text-muted" data-i18n="patient.treatmentPlaceholder">
          Dental chart and treatment history will be available in a future update.
        </p>
      </div>
    </div>
  `;
}

// ─── Back to search ──────────────────────────────────

function setupBackToSearch(): void {
  document.getElementById('cartonBackToSearch')?.addEventListener('click', () => {
    const container = document.getElementById('cartonContainer');
    if (!container) return;
    container.outerHTML = renderCartonView();
    setupCartonSearch();
  });
}
