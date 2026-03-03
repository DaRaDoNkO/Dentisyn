import i18next from '../../../i18n';
import { patientRepository } from '../../../repositories/patientRepository';
import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { getPunctualityIcon } from '../../../services/patientStatsService';
import { formatDate, formatTime } from '../../../utils/dateUtils';
import type { Patient, Appointment } from '../../../types/patient';

const t = (key: string, fb: string) => i18next.t(key, fb);

/**
 * Render the Patient Carton shell
 * @param preselectedId - Optional patient ID to open directly
 */
export function renderPatientCarton(preselectedId?: string): string {
  if (preselectedId) {
    const patient = patientRepository.getById(preselectedId);
    if (patient) return renderCartonContent(patient);
  }

  return renderSearchState();
}

/** Render the search/select state before a patient is chosen */
function renderSearchState(): string {
  return `
    <div id="cartonContainer">
      <div class="card shadow-sm border-0 rounded-4">
        <div class="card-body p-4 text-center">
          <i class="bi bi-search text-muted" style="font-size:3rem"></i>
          <h5 class="mt-3" data-i18n="patient.searchPatient">
            ${t('patient.searchPatient', 'Search for a patient')}
          </h5>
          <p class="text-muted" data-i18n="patient.selectPatient">
            ${t('patient.selectPatient', 'Select a patient to view their carton')}
          </p>
          <div class="mx-auto" style="max-width:400px">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control" id="cartonSearchInput"
                placeholder="${t('patient.searchPatient', 'Search for a patient')}"
                autocomplete="off">
            </div>
            <div id="cartonSearchResults" class="list-group mt-1"
              style="max-height:250px;overflow-y:auto"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Render full carton content for a patient */
export function renderCartonContent(patient: Patient): string {
  const appointments = appointmentRepository.getAll()
    .filter(a => a.patientId === patient.id)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return `
    <div id="cartonContainer">
      ${renderDemographicsHeader(patient)}

      <!-- Carton sub-tabs -->
      <ul class="nav nav-tabs mt-3" id="cartonTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" data-carton-tab="treatment" type="button" role="tab">
            <i class="bi bi-clipboard2-pulse me-1"></i>
            <span data-i18n="patient.treatmentTab">${t('patient.treatmentTab', 'Treatment')}</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" data-carton-tab="periodontic" type="button" role="tab">
            <i class="bi bi-activity me-1"></i>
            <span data-i18n="patient.periodonticTab">${t('patient.periodonticTab', 'Periodontic Status')}</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" data-carton-tab="history" type="button" role="tab">
            <i class="bi bi-clock-history me-1"></i>
            <span data-i18n="patient.appointmentHistory">${t('patient.appointmentHistory', 'Appointment History')}</span>
          </button>
        </li>
      </ul>

      <div id="cartonTabContent" class="mt-3">
        ${renderTreatmentPlaceholder()}
      </div>

      <!-- Hidden data for JS -->
      <div id="cartonPatientId" class="d-none" data-patient-id="${patient.id}"></div>
      <div id="cartonAppointmentsData" class="d-none"
        data-appointments='${JSON.stringify(appointments)}'></div>
    </div>
  `;
}

function renderDemographicsHeader(p: Patient): string {
  const punctuality = getPunctualityIcon(p.id);
  const idLabel = p.idType ? t(`patient.${p.idType.toLowerCase()}`, p.idType) : '';
  const dobFormatted = p.dateOfBirth
    ? formatDate(p.dateOfBirth)
    : '';
  const sexLabel = p.sex ? t(`patient.${p.sex}`, p.sex) : '';
  const registered = p.createdAt
    ? formatDate(p.createdAt)
    : '';

  return `
    <div class="card shadow-sm border-0 rounded-4">
      <div class="card-body p-4">
        <div class="d-flex align-items-start justify-content-between">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
              style="width:56px;height:56px">
              <i class="bi bi-person-fill text-primary fs-3"></i>
            </div>
            <div>
              <h5 class="mb-1 fw-bold">
                ${p.name} ${punctuality}
              </h5>
              <div class="text-muted small">
                ${p.phone ? `<i class="bi bi-telephone me-1"></i>${p.phone}` : ''}
                ${p.email ? `<span class="ms-3"><i class="bi bi-envelope me-1"></i>${p.email}</span>` : ''}
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline-secondary" id="cartonBackToSearch">
            <i class="bi bi-arrow-left me-1"></i>
            <span data-i18n="table.search">${t('table.search', 'Search')}</span>
          </button>
        </div>

        <div class="row mt-3 g-3">
          <!-- ID Info -->
          <div class="col-md-3">
            <div class="border rounded-3 p-2 h-100">
              <small class="text-muted d-block" data-i18n="patient.idInfo">
                ${t('patient.idInfo', 'ID Information')}
              </small>
              <strong>${idLabel}</strong>
              ${p.idNumber ? `<span class="ms-1">${p.idNumber}</span>` : '—'}
            </div>
          </div>
          <!-- DOB & Sex -->
          <div class="col-md-3">
            <div class="border rounded-3 p-2 h-100">
              <small class="text-muted d-block" data-i18n="patient.dateOfBirth">
                ${t('patient.dateOfBirth', 'Date of Birth')}
              </small>
              <strong>${dobFormatted || '—'}</strong>
              ${sexLabel ? `<span class="badge bg-secondary ms-2">${sexLabel}</span>` : ''}
            </div>
          </div>
          <!-- NZOK -->
          <div class="col-md-3">
            <div class="border rounded-3 p-2 h-100">
              <small class="text-muted d-block" data-i18n="patient.nzokInfo">
                ${t('patient.nzokInfo', 'NZOK Information')}
              </small>
              <strong>${p.nzokNumber || '—'}</strong>
              ${p.rzokOblast ? `<small class="ms-1 text-muted">(${p.rzokOblast})</small>` : ''}
            </div>
          </div>
          <!-- Flags -->
          <div class="col-md-3">
            <div class="border rounded-3 p-2 h-100">
              <small class="text-muted d-block" data-i18n="patient.patientFlags">
                ${t('patient.patientFlags', 'Patient Flags')}
              </small>
              ${renderFlagBadges(p)}
            </div>
          </div>
        </div>

        ${registered ? `
          <div class="mt-2">
            <small class="text-muted">
              <i class="bi bi-calendar-check me-1"></i>
              <span data-i18n="patient.registeredOn">${t('patient.registeredOn', 'Registered on')}</span>
              ${registered}
            </small>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderFlagBadges(p: Patient): string {
  const badges: string[] = [];
  if (p.unfavorableConditions) {
    badges.push(`<span class="badge bg-warning text-dark me-1">
      <i class="bi bi-exclamation-triangle me-1"></i>${t('patient.unfavorableConditions', 'Unfavorable')}</span>`);
  }
  if (p.exemptFromFee) {
    badges.push(`<span class="badge bg-success me-1">
      <i class="bi bi-check-circle me-1"></i>${t('patient.exemptFromFee', 'Exempt')}</span>`);
  }
  if (p.pensioner) {
    badges.push(`<span class="badge bg-info me-1">
      <i class="bi bi-person me-1"></i>${t('patient.pensioner', 'Pensioner')}</span>`);
  }
  return badges.length > 0 ? badges.join('') : '<span class="text-muted">—</span>';
}

function renderTreatmentPlaceholder(): string {
  return `
    <div class="card border-0 bg-body-tertiary rounded-3">
      <div class="card-body text-center py-5">
        <i class="bi bi-clipboard2-pulse text-muted" style="font-size:2.5rem"></i>
        <p class="mt-3 text-muted" data-i18n="patient.treatmentPlaceholder">
          ${t('patient.treatmentPlaceholder', 'Dental chart and treatment history will be available in a future update.')}
        </p>
      </div>
    </div>
  `;
}

export function renderPeriodonticPlaceholder(): string {
  return `
    <div class="card border-0 bg-body-tertiary rounded-3">
      <div class="card-body text-center py-5">
        <i class="bi bi-activity text-muted" style="font-size:2.5rem"></i>
        <p class="mt-3 text-muted" data-i18n="patient.periodonticPlaceholder">
          ${t('patient.periodonticPlaceholder', 'Periodontal chart will be available in a future update.')}
        </p>
      </div>
    </div>
  `;
}

export function renderAppointmentHistory(appointments: Appointment[]): string {
  if (appointments.length === 0) {
    return `
      <div class="text-center py-4 text-muted">
        <i class="bi bi-calendar-x" style="font-size:2rem"></i>
        <p class="mt-2" data-i18n="table.noAppointments">
          ${t('table.noAppointments', 'No appointments')}
        </p>
      </div>
    `;
  }

  const rows = appointments.map(a => {
    const date = formatDate(a.startTime);
    const time = formatTime(a.startTime);
    const statusKey = `status.${a.status.charAt(0).toLowerCase() + a.status.slice(1)}`;
    const statusLabel = i18next.t(statusKey, a.status);

    return `
      <tr>
        <td>${date}</td>
        <td>${time}</td>
        <td>${a.doctor}</td>
        <td>${a.reason || '—'}</td>
        <td><span class="badge bg-secondary">${statusLabel}</span></td>
      </tr>
    `;
  }).join('');

  return `
    <div class="table-responsive">
      <table class="table table-sm table-hover">
        <thead>
          <tr>
            <th data-i18n="appointment.date">${t('appointment.date', 'Date')}</th>
            <th data-i18n="table.time">${t('table.time', 'Time')}</th>
            <th data-i18n="table.doctor">${t('table.doctor', 'Doctor')}</th>
            <th data-i18n="appointment.reasonNotes">${t('appointment.reasonNotes', 'Reason')}</th>
            <th data-i18n="table.status">${t('table.status', 'Status')}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
