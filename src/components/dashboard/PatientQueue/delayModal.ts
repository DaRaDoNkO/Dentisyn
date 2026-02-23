import { appointmentRepository } from '../../../repositories/appointmentRepository';
import { patientRepository } from '../../../repositories/patientRepository';
import { calculatePunctuality } from '../../../services/patientStatsService';
import i18next from '../../../i18n';
import type { Appointment, DelayRecord } from '../../../types/patient';
import { showToast } from '../../../utils/toast';

/**
 * Render the HTML for the delay modal popup
 */
function renderDelayModal(): string {
  return `
  <div class="modal fade" id="delayModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content rounded-4 shadow-lg">
        <div class="modal-header border-0 pb-0">
          <h6 class="modal-title fw-semibold" data-i18n="table.delayModalTitle"></h6>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body pt-2">
          <p class="text-muted small mb-3" data-i18n="table.enterDelayMinutes"></p>
          <div class="mb-3">
            <div class="input-group">
              <input type="number" class="form-control form-control-lg text-center"
                id="delayMinutesInput" min="1" max="180" value="15" autofocus>
              <span class="input-group-text" data-i18n="table.minutes"></span>
            </div>
          </div>
          <div class="d-flex justify-content-center gap-3 mt-4">
            <!-- Green confirm tick -->
            <button type="button" class="btn btn-success rounded-circle d-flex align-items-center justify-content-center"
              id="delayConfirmBtn" style="width:48px;height:48px" title="Confirm">
              <i class="bi bi-check-lg fs-4"></i>
            </button>
            <!-- Red close X -->
            <button type="button" class="btn btn-danger rounded-circle d-flex align-items-center justify-content-center"
              data-bs-dismiss="modal" style="width:48px;height:48px" title="Close">
              <i class="bi bi-x-lg fs-4"></i>
            </button>
            <!-- Arrived button (text, same as queue) -->
            <button type="button" class="btn btn-success" id="delayArrivedBtn">
              <i class="bi bi-box-arrow-in-right me-1"></i>
              <span data-i18n="table.arrivedNow"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * Show the delay modal and wire its event handlers.
 * Returns a Promise that resolves when the modal closes.
 */
export function showDelayModal(
  appointmentId: string,
  onDone: () => void
): void {
  const appointment = appointmentRepository.getById(appointmentId);
  if (!appointment) return;

  // Inject modal HTML into body
  let container = document.getElementById('delayModalContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'delayModalContainer';
    document.body.appendChild(container);
  }
  container.innerHTML = renderDelayModal();

  // Apply translations
  applyI18n(container);

  const modalEl = document.getElementById('delayModal') as HTMLElement;
  if (!modalEl || !window.bootstrap?.Modal) return;

  const bsModal = new window.bootstrap.Modal(modalEl);

  // ── Confirm delay (green tick) ──
  const confirmBtn = document.getElementById('delayConfirmBtn');
  confirmBtn?.addEventListener('click', () => {
    const input = document.getElementById('delayMinutesInput') as HTMLInputElement;
    const mins = parseInt(input.value, 10);
    if (isNaN(mins) || mins <= 0) return;

    appointmentRepository.update(appointmentId, { delayMinutes: mins });
    console.info(
      `[AUDIT] DELAY_RECORDED | Appointment: ${appointmentId} ` +
      `| Minutes: ${mins} | Time: ${new Date().toISOString()}`
    );
    bsModal.hide();
  });

  // ── Arrived button — auto-calculate delay ──
  const arrivedBtn = document.getElementById('delayArrivedBtn');
  arrivedBtn?.addEventListener('click', () => {
    const now = new Date();
    const scheduled = new Date(appointment.startTime);
    const delayMins = Math.max(0, Math.round(
      (now.getTime() - scheduled.getTime()) / 60000
    ));

    // Record delay on appointment
    appointmentRepository.update(appointmentId, {
      status: 'Waiting',
      actualArrivalTime: now.toISOString(),
      delayMinutes: delayMins > 0 ? delayMins : undefined,
    });

    // Persist delay record in patient history
    recordDelayInPatient(appointment, now, delayMins);

    console.info(
      `[AUDIT] ARRIVED_WITH_DELAY | Appointment: ${appointmentId} ` +
      `| AutoDelay: ${delayMins}min | Time: ${now.toISOString()}`
    );

    if (delayMins > 0) {
      showToast({
        message: `Delay auto-calculated: ${delayMins} min`,
        type: 'info',
      });
    }

    bsModal.hide();
  });

  // ── Cleanup on close ──
  modalEl.addEventListener('hidden.bs.modal', () => {
    container?.remove();
    onDone();
  }, { once: true });

  bsModal.show();
}

// ── Helpers ──

function recordDelayInPatient(
  appointment: Appointment,
  arrivalTime: Date,
  delayMins: number
): void {
  if (delayMins <= 0) return;

  const patient = patientRepository.getById(appointment.patientId);
  if (!patient) return;

  const record: DelayRecord = {
    appointmentId: appointment.id,
    scheduledTime: appointment.startTime,
    actualArrivalTime: arrivalTime.toISOString(),
    delayMinutes: delayMins,
    date: arrivalTime.toISOString().split('T')[0],
  };

  const history = patient.delayHistory ?? [];
  history.push(record);

  // Update punctuality score
  const punctualityScore = calculatePunctuality(history, patient.id);

  patientRepository.update(patient.id, {
    delayHistory: history,
    punctualityScore,
  });
}

function applyI18n(container: HTMLElement): void {
  container.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = i18next.t(key);
  });
}
