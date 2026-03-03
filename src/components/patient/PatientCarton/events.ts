import { patientRepository } from '../../../repositories/patientRepository';
import { getPunctualityIcon } from '../../../services/patientStatsService';
import {
  renderPatientCarton as renderCartonView,
  renderCartonContent,
  renderPeriodonticPlaceholder,
  renderAppointmentHistory
} from './render';
import type { Appointment } from '../../../types/patient';

/**
 * Initialize Patient Carton event handlers
 * @param preselectedId - If provided, skip search setup
 */
export function initPatientCarton(preselectedId?: string): void {
  if (preselectedId) {
    setupCartonTabs();
    setupBackToSearch();
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

  // Focus on mount
  input.focus();
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

  console.info(
    `[AUDIT] OPEN_CARTON | Patient: ${patient.name} | ID: ${patientId} | Time: ${new Date().toISOString()}`
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
