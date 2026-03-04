import type { Appointment, PatientStatus, PatientAction } from '../../../types/patient';
import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { doctorRepository } from '../../../repositories/doctorRepository';
import { getNextActions } from './statusWorkflow';
import { formatTime } from '../../../utils/dateUtils';
import type { QueueFilterState } from './types';

// ── Module-level filter state ──
let filterState: QueueFilterState = { selectedDoctor: 'all' };

export function getFilterState(): QueueFilterState { return filterState; }
export function setFilterState(s: QueueFilterState): void { filterState = s; }

// ── Time formatting (using centralized util) ──

function fmt(iso: string): string {
  return formatTime(iso) || iso;
}

// ── Status badge ──

function badge(status: PatientStatus): string {
  const map: Record<PatientStatus, { bg: string; icon: string; key: string }> = {
    Pending:     { bg: 'warning', icon: 'bi-clock',                  key: 'status.pending' },
    Completed:   { bg: 'success', icon: 'bi-check-circle-fill',      key: 'status.completed' },
    Left:        { bg: 'secondary', icon: 'bi-box-arrow-right',      key: 'status.left' },
    Waiting:     { bg: 'warning', icon: 'bi-hourglass-split',        key: 'status.waiting' },
    Confirmed:   { bg: 'info',    icon: 'bi-calendar-event',         key: 'status.confirmed' },
    Arrived:     { bg: 'primary', icon: 'bi-box-arrow-in-right',     key: 'status.arrived' },
    InTreatment: { bg: 'purple',  icon: 'bi-heart-pulse',            key: 'status.inTreatment' },
    Cancelled:   { bg: 'danger',  icon: 'bi-x-circle-fill',          key: 'status.cancelled' },
    NoShow:      { bg: 'dark',    icon: 'bi-person-x',               key: 'status.noShow' },
    Rescheduled: { bg: 'secondary', icon: 'bi-arrow-repeat',         key: 'status.rescheduled' },
    Rejected:    { bg: 'danger',  icon: 'bi-x-circle',               key: 'status.rejected' },
  };
  const m = map[status] ?? map.Confirmed;
  const bgClass = m.bg === 'purple'
    ? 'bg-purple-subtle text-purple-emphasis'
    : `bg-${m.bg}-subtle text-${m.bg}-emphasis`;
  return `<span class="badge ${bgClass} d-inline-flex align-items-center gap-2 rounded-pill queue-status">
    <i class="bi ${m.icon}"></i>
    <span data-i18n="${m.key}"></span>
  </span>`;
}

// ── Action buttons ──

const BTN_CFG: Record<PatientAction, { cls: string; icon: string; i18n: string }> = {
  Confirm:        { cls: 'btn-success',           icon: 'bi-check-circle',       i18n: 'table.confirm' },
  Reject:         { cls: 'btn-outline-danger',    icon: 'bi-x-circle',           i18n: 'table.reject' },
  Arrived:        { cls: 'btn-success',           icon: 'bi-box-arrow-in-right', i18n: 'table.arrived' },
  Delay:          { cls: 'btn-outline-warning',   icon: 'bi-clock-history',      i18n: 'table.delay' },
  Reschedule:     { cls: 'btn-outline-info',      icon: 'bi-arrow-repeat',       i18n: 'table.reschedule' },
  CheckIn:        { cls: 'btn-primary',           icon: 'bi-check-lg',           i18n: 'table.checkIn' },
  CheckOut:       { cls: 'btn-outline-success',   icon: 'bi-door-open',          i18n: 'table.checkOut' },
  Bill:           { cls: 'btn-outline-secondary',  icon: 'bi-receipt',            i18n: 'table.bill' },
  NewAppointment: { cls: 'btn-outline-primary',   icon: 'bi-calendar-plus',      i18n: 'table.newAppointment' },
  Cancel:         { cls: 'btn-outline-danger',    icon: 'bi-x-circle',           i18n: 'table.cancel' },
  View:           { cls: 'btn-outline-primary',   icon: 'bi-eye',                i18n: 'table.view' },
};

function actionButtons(appt: Appointment): string {
  const actions = getNextActions(appt.status);
  if (actions.length === 0) return '';
  return `<div class="d-flex gap-1 flex-wrap">${actions.map(a => {
    const c = BTN_CFG[a];
    return `<button type="button" class="btn btn-sm ${c.cls} queue-action-btn"
      data-action="${a}" data-appointment-id="${appt.id}">
      <i class="bi ${c.icon}"></i> <span data-i18n="${c.i18n}"></span>
    </button>`;
  }).join('')}</div>`;
}

// ── Delay indicator ──

function delayTag(appt: Appointment): string {
  if (!appt.delayMinutes || appt.delayMinutes <= 0) return '';
  return ` <span class="text-danger small fw-normal">(${appt.delayMinutes}<span data-i18n="table.minutes"></span>)</span>`;
}

// ── Doctor filter pills ──

function doctorFilterPills(): string {
  const doctors = doctorRepository.getAll();
  const sel = filterState.selectedDoctor;
  const allActive = sel === 'all' ? 'active' : '';
  let pills = `<button class="btn btn-sm btn-outline-secondary rounded-pill doctor-filter-pill ${allActive}"
    data-doctor="all"><span data-i18n="table.allDoctors"></span></button>`;
  for (const doc of doctors) {
    const active = sel === doc.id ? 'active' : '';
    pills += `<button class="btn btn-sm btn-outline-secondary rounded-pill doctor-filter-pill ${active}"
      data-doctor="${doc.id}" style="--bs-btn-active-bg:${doc.color};--bs-btn-active-border-color:${doc.color}">${doc.name}</button>`;
  }
  return `<div class="d-flex gap-2 flex-wrap mb-2 px-3 pt-3">${pills}</div>`;
}

// ── Main render ──

export function PatientQueue(): string {
  const appointments = appointmentRepository.getAll();
  const today = new Date().toISOString().split('T')[0];

  let todayAppts = appointments
    .filter(a => a.startTime.startsWith(today))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  if (filterState.selectedDoctor !== 'all') {
    todayAppts = todayAppts.filter(a => a.doctor === filterState.selectedDoctor);
  }

  const rows = todayAppts.map(appt => {
    const docName = doctorRepository.getDisplayName(appt.doctor);
    const pendingDot = appt.status === 'Pending'
      ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#dc3545;margin-right:6px;vertical-align:middle;" title="Unconfirmed"></span>'
      : '';
    return `
    <tr class="queue-row" data-appointment-id="${appt.id}" data-doctor="${appt.doctor}">
      <td>
        ${pendingDot}<span class="patient-name-link" role="button" data-patient-id="${appt.patientId}"
          data-bs-toggle="tooltip" data-bs-placement="top" title="${appt.reason || ''}"
          style="cursor:pointer;text-decoration:underline dotted">
          ${appt.patientName}
        </span>
        <small class="text-muted ms-2 doctor-name-inline" role="button"
          data-doctor="${appt.doctor}">${docName}</small>
      </td>
      <td>${fmt(appt.startTime)}${delayTag(appt)}</td>
      <td>${fmt(appt.endTime)}</td>
      <td>${badge(appt.status)}</td>
      <td>${actionButtons(appt)}</td>
    </tr>`;
  }).join('');

  const emptyRow = `<tr><td colspan="5" class="text-center text-muted py-4">
    <span data-i18n="table.noAppointmentsToday"></span></td></tr>`;

  return `
  <section id="patientQueueSection" class="card shadow-sm border-0 rounded-4 overflow-hidden">
    <div class="card-header bg-body-secondary border-0 py-3">
      <h6 class="mb-0 text-uppercase fw-semibold text-body" data-i18n="dashboard.patientQueue"></h6>
    </div>
    ${doctorFilterPills()}
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-body-tertiary border-bottom border-light-subtle text-uppercase small text-body-secondary">
            <tr>
              <th scope="col" data-i18n="table.name"></th>
              <th scope="col" data-i18n="table.time"></th>
              <th scope="col" data-i18n="table.end"></th>
              <th scope="col" data-i18n="table.status"></th>
              <th scope="col" data-i18n="table.actions"></th>
            </tr>
          </thead>
          <tbody>${rows || emptyRow}</tbody>
        </table>
      </div>
    </div>
  </section>`;
}
