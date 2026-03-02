import i18next from '../../../i18n';

/**
 * Render the Patient tab with sub-tab navigation
 * @param activeSubTab - Which sub-tab is active: 'new' or 'carton'
 */
export function renderPatientTab(activeSubTab: 'new' | 'carton' = 'carton'): string {
  const t = (key: string, fallback: string) => i18next.t(key, fallback);

  return `
    <div id="patientTabContainer">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h4 class="mb-0 fw-bold">
          <i class="bi bi-people me-2"></i>
          <span data-i18n="patient.tabTitle">${t('patient.tabTitle', 'Patients')}</span>
        </h4>
      </div>

      <!-- Sub-tab navigation -->
      <ul class="nav nav-pills mb-4" id="patientSubTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link ${activeSubTab === 'new' ? 'active' : ''}"
            id="newPatientTab"
            data-subtab="new"
            type="button"
            role="tab"
          >
            <i class="bi bi-person-plus me-1"></i>
            <span data-i18n="patient.newPatient">${t('patient.newPatient', 'New Patient')}</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link ${activeSubTab === 'carton' ? 'active' : ''}"
            id="patientCartonTab"
            data-subtab="carton"
            type="button"
            role="tab"
          >
            <i class="bi bi-folder2-open me-1"></i>
            <span data-i18n="patient.patientCarton">${t('patient.patientCarton', 'Patient Carton')}</span>
          </button>
        </li>
      </ul>

      <!-- Sub-tab content area -->
      <div id="patientSubTabContent"></div>
    </div>
  `;
}
