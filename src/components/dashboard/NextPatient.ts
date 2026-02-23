import { appointmentRepository } from '../../repositories/appointmentRepository';
import { doctorRepository } from '../../repositories/doctorRepository';
import type { Appointment, DoctorId } from '../../types/patient';

// ── Module-level state ──
let viewDoctor: DoctorId | 'all' = 'all';
let sliderOffset = 0;
const VISIBLE_COUNT = 3;

export function setNextPatientDoctor(id: DoctorId | 'all'): void {
  viewDoctor = id;
  sliderOffset = 0;
}

export function shiftNextPatient(delta: number): void {
  sliderOffset = Math.max(0, sliderOffset + delta);
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return isoString;
  }
}

function getFilteredAppointments(): Appointment[] {
  const appointments = appointmentRepository.getAll();
  const today = new Date().toISOString().split('T')[0];

  return appointments
    .filter(a =>
      a.startTime.startsWith(today)
      && a.status !== 'Completed'
      && a.status !== 'Cancelled'
      && a.status !== 'Rescheduled'
      && (viewDoctor === 'all' || a.doctor === viewDoctor)
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

function renderDoctorPills(): string {
  const doctors = doctorRepository.getAll();
  const allActive = viewDoctor === 'all' ? 'btn-primary' : 'btn-outline-secondary';

  const pills = doctors.map(d => {
    const active = viewDoctor === d.id ? 'btn-primary' : 'btn-outline-secondary';
    return `<button class="btn btn-sm ${active} next-patient-doc-pill" data-doctor="${d.id}"
      style="${viewDoctor === d.id ? `background:${d.color};border-color:${d.color}` : ''}">${d.name}</button>`;
  }).join('');

  return `
    <div class="d-flex flex-wrap gap-1 mb-2">
      <button class="btn btn-sm ${allActive} next-patient-doc-pill" data-doctor="all"
        data-i18n="table.allDoctorsView"></button>
      ${pills}
    </div>`;
}

function renderCard(appt: Appointment, isFirst: boolean): string {
  const time = formatTime(appt.startTime);
  const endTime = formatTime(appt.endTime);
  const docName = doctorRepository.getDisplayName(appt.doctor);
  const doctor = doctorRepository.getById(appt.doctor);
  const docColor = doctor?.color ?? '#6c757d';

  return `
    <div class="col" style="min-width:200px">
      <div class="card h-100 border-0 ${isFirst ? 'bg-primary-subtle' : 'bg-body-tertiary'} rounded-3 p-3">
        <div class="d-flex align-items-center gap-3 mb-2">
          <span class="badge text-bg-secondary rounded-circle p-2">
            <i class="bi bi-person-fill"></i>
          </span>
          <div class="flex-grow-1">
            <h6 class="mb-0 patient-name-link" role="button"
                data-patient-id="${appt.patientId}" style="cursor:pointer">
              ${appt.patientName}
            </h6>
            <small class="text-muted">
              <i class="bi bi-clock me-1"></i>${time} – ${endTime}
            </small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2 mb-2">
          <span class="badge rounded-pill" style="background:${docColor};color:#fff">
            <i class="bi bi-person-badge me-1"></i>${docName}
          </span>
        </div>
        ${appt.reason ? renderNoteWithOverflow(appt.reason, appt.id) : ''}
      </div>
    </div>`;
}

/** Max characters before truncation */
const NOTE_TRUNCATE_LEN = 80;

function renderNoteWithOverflow(reason: string, appointmentId: string): string {
  if (reason.length <= NOTE_TRUNCATE_LEN) {
    return `<p class="text-muted small mb-0"><i class="bi bi-chat-left-text me-1"></i>${reason}</p>`;
  }
  const truncated = reason.slice(0, NOTE_TRUNCATE_LEN) + '…';
  return `
    <div class="next-patient-note" data-note-id="${appointmentId}">
      <p class="text-muted small mb-0 note-truncated">
        <i class="bi bi-chat-left-text me-1"></i>${truncated}
        <button type="button" class="btn btn-link btn-sm p-0 ms-1 note-expand-btn"
          data-note-id="${appointmentId}" data-i18n="table.viewMore"></button>
      </p>
      <div class="note-full d-none" style="max-height:120px;overflow-y:auto">
        <p class="text-muted small mb-0">
          <i class="bi bi-chat-left-text me-1"></i>${reason}
        </p>
        <button type="button" class="btn btn-link btn-sm p-0 ms-1 note-collapse-btn"
          data-note-id="${appointmentId}" data-i18n="table.viewLess"></button>
      </div>
    </div>`;
}

export function NextPatient(): string {
  const upcoming = getFilteredAppointments();

  // Clamp slider offset
  if (sliderOffset >= upcoming.length) sliderOffset = Math.max(0, upcoming.length - 1);

  const emptyState = `
    <div class="card shadow-sm border-0 rounded-4 h-100 overflow-hidden" id="nextPatientSection">
      <div class="card-body">
        <div class="bg-body-secondary rounded-3 px-3 py-2 d-inline-block mb-3">
          <h6 class="text-uppercase fw-semibold text-body mb-0" data-i18n="dashboard.nextPatient"></h6>
        </div>
        ${renderDoctorPills()}
        <div class="text-center text-muted">
          <p class="mt-3" data-i18n="table.noUpcomingToday"></p>
        </div>
      </div>
    </div>`;

  if (upcoming.length === 0) return emptyState;

  const visible = upcoming.slice(sliderOffset, sliderOffset + VISIBLE_COUNT);
  const canPrev = sliderOffset > 0;
  const canNext = sliderOffset + VISIBLE_COUNT < upcoming.length;
  const remaining = upcoming.length - sliderOffset - VISIBLE_COUNT;

  const cards = visible.map((a, i) => renderCard(a, i === 0 && sliderOffset === 0)).join('');

  const arrowLeft = canPrev
    ? `<button class="btn btn-sm btn-outline-secondary rounded-circle" id="nextPatientPrev" title="Previous">
        <i class="bi bi-chevron-left"></i>
       </button>`
    : '';

  const arrowRight = canNext
    ? `<button class="btn btn-sm btn-outline-secondary rounded-circle" id="nextPatientNext" title="Next">
        <i class="bi bi-chevron-right"></i>
       </button>`
    : '';

  const moreHint = remaining > 0
    ? `<small class="text-muted ms-2">+${remaining} <span data-i18n="table.more"></span></small>`
    : '';

  return `
    <div class="card shadow-sm border-0 rounded-4 h-100 overflow-hidden" id="nextPatientSection">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="bg-body-secondary rounded-3 px-3 py-2 d-inline-block">
            <h6 class="text-uppercase fw-semibold text-body mb-0" data-i18n="dashboard.nextPatient"></h6>
          </div>
          <div class="d-flex align-items-center gap-1">
            ${arrowLeft}${arrowRight}${moreHint}
          </div>
        </div>
        ${renderDoctorPills()}
        <div class="row row-cols-1 row-cols-md-${Math.min(visible.length, 3)} g-3">
          ${cards}
        </div>
      </div>
    </div>`;
}
