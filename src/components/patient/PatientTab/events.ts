import { renderNewPatientForm, initNewPatientForm } from '../NewPatient/index';
import { renderPatientCarton, initPatientCarton } from '../PatientCarton/index';

type SubTab = 'new' | 'carton';
let currentSubTab: SubTab = 'carton';

/**
 * Initialize Patient tab event handlers
 */
export function initPatientTab(): void {
  renderSubTabContent(currentSubTab);
  setupSubTabHandlers();
  setupCreateNewListener();
}

/** Listen for the create-new request dispatched from inside the carton */
function setupCreateNewListener(): void {
  document.addEventListener('patient:createNew', () => {
    currentSubTab = 'new';

    const tabs = document.querySelectorAll('#patientSubTabs .nav-link');
    tabs.forEach(t => t.classList.remove('active'));
    document.getElementById('newPatientTab')?.classList.add('active');

    renderSubTabContent('new');
  }, { once: false });
}

/** Render the appropriate sub-tab content */
function renderSubTabContent(tab: SubTab): void {
  const container = document.getElementById('patientSubTabContent');
  if (!container) return;

  if (tab === 'new') {
    container.innerHTML = renderNewPatientForm();
    initNewPatientForm();
  } else {
    container.innerHTML = renderPatientCarton();
    initPatientCarton();
  }
}

/** Wire sub-tab click handlers */
function setupSubTabHandlers(): void {
  const tabs = document.querySelectorAll('#patientSubTabs .nav-link');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const subtab = (tab as HTMLElement).dataset.subtab as SubTab;
      if (subtab === currentSubTab) return;

      // Update active state
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      currentSubTab = subtab;
      renderSubTabContent(subtab);
    });
  });
}

/** Navigate to Patient Carton with a specific patient pre-selected */
export function openPatientCarton(patientId: string): void {
  currentSubTab = 'carton';

  // Update tab pills
  const tabs = document.querySelectorAll('#patientSubTabs .nav-link');
  tabs.forEach(t => t.classList.remove('active'));
  document.getElementById('patientCartonTab')?.classList.add('active');

  const container = document.getElementById('patientSubTabContent');
  if (!container) return;
  container.innerHTML = renderPatientCarton(patientId);
  initPatientCarton(patientId);
}
