import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { doctorRepository } from '../../../repositories/doctorRepository';
import i18next from '../../../i18n';
import { formatDate, formatTime } from '../../../utils/dateUtils';
import type { Appointment, RescheduleRecord, DoctorInfo } from '../../../types/patient';
import { showToast } from '../../../utils/toast';

/** Generate available time slots for a given doctor on a date */
function generateSlots(
  doctor: DoctorInfo,
  date: string,
  durationMin: number,
  excludeId: string
): string[] {
  const existing = appointmentRepository.getAll().filter(
    a => a.doctor === doctor.id
      && a.startTime.startsWith(date)
      && a.id !== excludeId
      && a.status !== 'Cancelled'
      && a.status !== 'NoShow'
  );

  const [startH, startM] = doctor.startTime.split(':').map(Number);
  const [endH, endM] = doctor.endTime.split(':').map(Number);
  const dayStart = startH * 60 + startM;
  const dayEnd = endH * 60 + endM;

  const slots: string[] = [];
  for (let t = dayStart; t + durationMin <= dayEnd; t += 15) {
    const slotStart = new Date(`${date}T${pad(Math.floor(t / 60))}:${pad(t % 60)}:00`);
    const slotEnd = new Date(slotStart.getTime() + durationMin * 60000);

    const conflict = existing.some(a => {
      const aStart = new Date(a.startTime).getTime();
      const aEnd = new Date(a.endTime).getTime();
      return slotStart.getTime() < aEnd && slotEnd.getTime() > aStart;
    });

    if (!conflict) {
      slots.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
    }
  }
  return slots;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function renderRescheduleModal(appointment: Appointment): string {
  const doctors = doctorRepository.getAll();
  const startDt = new Date(appointment.startTime);
  const endDt = new Date(appointment.endTime);
  const durationMin = Math.round((endDt.getTime() - startDt.getTime()) / 60000);

  // Default: same doctor, today
  const selectedDoctor = doctors.find(d => d.id === appointment.doctor) ?? doctors[0];
  const today = new Date().toISOString().split('T')[0];

  const initialSlots = selectedDoctor
    ? generateSlots(selectedDoctor, today, durationMin, appointment.id)
    : [];

  const doctorPills = doctors.map(d => `
    <button type="button"
      class="btn btn-sm ${d.id === appointment.doctor ? 'btn-primary' : 'btn-outline-secondary'} reschedule-doctor-pill"
      data-doctor-id="${d.id}">
      ${d.name}
    </button>
  `).join('');

  const slotsHtml = renderSlotButtons(initialSlots);

  return `
  <div class="modal fade" id="rescheduleModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow-lg">
        <div class="modal-header border-bottom-0">
          <h5 class="modal-title fw-semibold" data-i18n="table.rescheduleModalTitle"></h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Original info -->
          <div class="mb-3 p-2 bg-light rounded-3">
            <small class="text-muted" data-i18n="table.originalAppointment"></small>
            <div class="fw-semibold">${appointment.patientName}</div>
            <div class="small text-muted">
              ${formatDate(startDt)} ${formatTime(startDt)}
              &ndash;
              ${formatTime(endDt)}
              <span class="badge bg-secondary ms-1">${durationMin} min</span>
            </div>
          </div>

          <!-- Doctor selection -->
          <div class="mb-3">
            <label class="form-label small fw-semibold" data-i18n="table.selectDoctor"></label>
            <div class="d-flex flex-wrap gap-1" id="reschedule-doctor-pills">
              ${doctorPills}
            </div>
          </div>

          <!-- Date picker -->
          <div class="mb-3">
            <label class="form-label small fw-semibold" for="reschedule-date">Date</label>
            <input type="date" class="form-control" id="reschedule-date"
              value="${today}" min="${today}">
          </div>

          <!-- Available slots -->
          <div class="mb-3">
            <label class="form-label small fw-semibold" data-i18n="table.availableSlots"></label>
            <div id="reschedule-slots" class="d-flex flex-wrap gap-1" style="max-height:180px;overflow-y:auto">
              ${slotsHtml}
            </div>
          </div>

          <!-- Reschedule by: doctor or patient -->
          <div class="d-flex gap-2 mt-4">
            <button type="button" class="btn btn-primary flex-fill" id="rescheduleByDoctorBtn" disabled>
              <i class="bi bi-person-badge me-1"></i>
              <span data-i18n="table.rescheduleByDoctor"></span>
            </button>
            <button type="button" class="btn btn-outline-primary flex-fill" id="rescheduleByPatientBtn" disabled>
              <i class="bi bi-person me-1"></i>
              <span data-i18n="table.rescheduleByPatient"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function renderSlotButtons(slots: string[]): string {
  if (slots.length === 0) {
    return `<span class="text-muted small" data-i18n="table.noAvailableSlots"></span>`;
  }
  return slots.map(s => `
    <button type="button" class="btn btn-outline-success btn-sm reschedule-slot-btn"
      data-slot="${s}">${s}</button>
  `).join('');
}

/**
 * Show the reschedule modal and wire events.
 */
export function showRescheduleModal(
  appointmentId: string,
  onDone: () => void
): void {
  const appointment = appointmentRepository.getById(appointmentId);
  if (!appointment) return;

  let container = document.getElementById('rescheduleModalContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'rescheduleModalContainer';
    document.body.appendChild(container);
  }
  container.innerHTML = renderRescheduleModal(appointment);
  applyI18n(container);

  const modalEl = document.getElementById('rescheduleModal') as HTMLElement;
  if (!modalEl || !window.bootstrap?.Modal) return;
  const bsModal = new window.bootstrap.Modal(modalEl);

  const startDt = new Date(appointment.startTime);
  const endDt = new Date(appointment.endTime);
  const durationMin = Math.round((endDt.getTime() - startDt.getTime()) / 60000);

  let selectedDoctorId = appointment.doctor;
  let selectedSlot: string | null = null;

  const updateSlots = (): void => {
    const dateInput = document.getElementById('reschedule-date') as HTMLInputElement;
    const date = dateInput?.value || new Date().toISOString().split('T')[0];
    const doctor = doctorRepository.getById(selectedDoctorId);
    if (!doctor) return;

    const slots = generateSlots(doctor, date, durationMin, appointment.id);
    const slotsDiv = document.getElementById('reschedule-slots');
    if (slotsDiv) {
      slotsDiv.innerHTML = renderSlotButtons(slots);
      applyI18n(slotsDiv);
      attachSlotListeners();
    }
    selectedSlot = null;
    toggleConfirmButtons(false);
  };

  const toggleConfirmButtons = (enabled: boolean): void => {
    const docBtn = document.getElementById('rescheduleByDoctorBtn') as HTMLButtonElement;
    const patBtn = document.getElementById('rescheduleByPatientBtn') as HTMLButtonElement;
    if (docBtn) docBtn.disabled = !enabled;
    if (patBtn) patBtn.disabled = !enabled;
  };

  const attachSlotListeners = (): void => {
    document.querySelectorAll('.reschedule-slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.reschedule-slot-btn').forEach(b => b.classList.remove('active', 'btn-success'));
        document.querySelectorAll('.reschedule-slot-btn').forEach(b => b.classList.add('btn-outline-success'));
        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success', 'active');
        selectedSlot = (btn as HTMLElement).dataset.slot ?? null;
        toggleConfirmButtons(!!selectedSlot);
      });
    });
  };

  // Doctor pill clicks
  document.querySelectorAll('.reschedule-doctor-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.reschedule-doctor-pill').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-secondary');
      });
      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('btn-primary');
      selectedDoctorId = (btn as HTMLElement).dataset.doctorId ?? appointment.doctor;
      updateSlots();
    });
  });

  // Date change
  const dateInput = document.getElementById('reschedule-date');
  dateInput?.addEventListener('change', updateSlots);

  // Initial slot listeners
  attachSlotListeners();

  // Confirm: by doctor
  const confirmDoctor = (rescheduledBy: 'doctor' | 'patient'): void => {
    if (!selectedSlot) {
      showToast({ message: i18next.t('table.selectSlotFirst'), type: 'warning' });
      return;
    }
    const dateVal = (document.getElementById('reschedule-date') as HTMLInputElement)?.value;
    const newStart = new Date(`${dateVal}T${selectedSlot}:00`);
    const newEnd = new Date(newStart.getTime() + durationMin * 60000);

    const now = new Date();
    const startTime = new Date(appointment.startTime);
    const within24h = (startTime.getTime() - now.getTime()) < 24 * 60 * 60 * 1000;

    // Create new appointment
    const newAppt = appointmentRepository.create({
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      phone: appointment.phone,
      doctor: selectedDoctorId,
      startTime: newStart.toISOString(),
      endTime: newEnd.toISOString(),
      reason: appointment.reason,
      status: 'Confirmed',
    });

    // Record reschedule
    const record: RescheduleRecord = {
      fromAppointmentId: appointment.id,
      toAppointmentId: newAppt.id,
      rescheduledBy,
      timestamp: now.toISOString(),
      within24h,
    };

    // Update original appointment
    const existingHistory = appointment.rescheduleHistory ?? [];
    appointmentRepository.update(appointment.id, {
      status: 'Rescheduled',
      rescheduledBy,
      rescheduleHistory: [...existingHistory, record],
    });

    console.info(
      `[AUDIT] APPOINTMENT_RESCHEDULED | From: ${appointment.id} → ${newAppt.id} ` +
      `| By: ${rescheduledBy} | Within24h: ${within24h} ` +
      `| Time: ${now.toISOString()}`
    );

    showToast({ message: i18next.t('table.appointmentRescheduled'), type: 'success' });
    bsModal.hide();
  };

  document.getElementById('rescheduleByDoctorBtn')?.addEventListener('click', () => confirmDoctor('doctor'));
  document.getElementById('rescheduleByPatientBtn')?.addEventListener('click', () => confirmDoctor('patient'));

  // Cleanup
  modalEl.addEventListener('hidden.bs.modal', () => {
    container?.remove();
    onDone();
  }, { once: true });

  bsModal.show();
}

function applyI18n(el: HTMLElement): void {
  el.querySelectorAll('[data-i18n]').forEach(node => {
    const key = node.getAttribute('data-i18n');
    if (key) node.textContent = i18next.t(key);
  });
}
