import i18next from '../../../i18n';

const t = (key: string, fb: string): string => i18next.t(key, fb) as string;

/** Renders patient search typeahead + selected patient info HTML */
export function renderPatientSearchSection(): string {
  return `
    <div class="mb-3">
      <label for="patientNameSearch" class="form-label fw-bold"><span data-i18n="appointment.patientName">${t('appointment.patientName', 'Patient Name')}</span><span class="text-danger ms-1">*</span></label>
      <input
        type="text" class="form-control" id="patientNameSearch"
        placeholder="${t('appointment.typeaheadSearchPlaceholder', 'Type to search or create a new patient...')}"
        autocomplete="off"
      >
      <small class="text-muted d-block mt-1" data-i18n="appointment.typeaheadHint">
        ${t('appointment.typeaheadHint', 'Start typing to search existing patients')}
      </small>
      <div id="patientTypeaheadDropdown" class="dropdown-menu w-100" style="display:none;max-height:300px;overflow-y:auto;"></div>
    </div>
    <div id="selectedPatientInfo" class="alert alert-info d-flex justify-content-between align-items-center" style="display:none;">
      <div>
        <strong id="selectedPatientName"></strong><br>
        <small id="selectedPatientDetails" class="text-muted"></small>
      </div>
      <button type="button" class="btn btn-sm btn-outline-secondary" id="changePatientBtn">
        <i class="bi bi-pencil"></i>
        <span data-i18n="appointment.changePatient">${t('appointment.changePatient', 'Change')}</span>
      </button>
    </div>
  `;
}
