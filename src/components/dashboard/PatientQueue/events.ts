import { transitionStatus } from './statusWorkflow';
import { PatientQueue } from './render';
import { setFilterState } from './render';
import { showDelayModal } from './delayModal';
import { showRescheduleModal } from './rescheduleModal';
import { showBillingModal } from './billingModal';
import { refreshPunctualityScore } from '../../../services/patientStatsService';
import { setPendingAppointment } from '../../../services/pendingAppointmentService';
import i18next from '../../../i18n';
import { showToast } from '../../../utils/toast';
import type { ToastType } from '../../../utils/toast';
import { appointmentRepository } from '../../../repositories/appointmentRepository';
import type { PatientAction, DoctorId } from '../../../types/patient';

/**
 * Re-render only the PatientQueue section (no full page re-render).
 * Call renderTranslations after to apply i18n.
 */
export function rerenderPatientQueue(): void {
  const section = document.getElementById('patientQueueSection');
  if (!section) return;
  const parent = section.parentElement;
  if (!parent) return;

  // Replace the section with fresh HTML
  const tmp = document.createElement('div');
  tmp.innerHTML = PatientQueue();
  const newSection = tmp.firstElementChild as HTMLElement;
  parent.replaceChild(newSection, section);

  // Re-attach handlers + translations
  setupPatientQueueHandlers();
  applyTranslations();
}

/** Show a quick toast message */
function toast(message: string, type: ToastType = 'info'): void {
  showToast({ message, type });
}

/** Apply i18n translations to queue section */
function applyTranslations(): void {
  const section = document.getElementById('patientQueueSection');
  if (!section) return;
  const elements = section.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = i18next.t(key);
  });
}

/**
 * Attach all event handlers for the Patient Queue section.
 * Should be called after every render / re-render.
 */
export function setupPatientQueueHandlers(): void {
  // ─── Doctor filter pills ───
  document.querySelectorAll('.doctor-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const doctor = (btn as HTMLElement).dataset.doctor as DoctorId | 'all';
      setFilterState({ selectedDoctor: doctor });
      rerenderPatientQueue();
    });
  });

  // ─── Inline doctor name click → filter ───
  document.querySelectorAll('.doctor-name-inline').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const doctor = (el as HTMLElement).dataset.doctor as DoctorId;
      if (doctor) {
        setFilterState({ selectedDoctor: doctor });
        rerenderPatientQueue();
      }
    });
  });

  // ─── Patient name click → open carton (placeholder) ───
  document.querySelectorAll('.patient-name-link').forEach(el => {
    el.addEventListener('click', () => {
      const patientId = (el as HTMLElement).dataset.patientId;
      console.info(
        `[AUDIT] OPEN_CARTON | Patient: ${patientId} | Time: ${new Date().toISOString()}`
      );
      toast(i18next.t('messages.toast.patientCartonComingSoon', 'Patient carton — coming soon'));
    });
  });

  // ─── Initialize Bootstrap tooltips for patient name hover ───
  initTooltips();

  // ─── Action buttons ───
  document.querySelectorAll('.queue-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const el = e.currentTarget as HTMLElement;
      const action = el.dataset.action as PatientAction;
      const appointmentId = el.dataset.appointmentId as string;
      handleAction(action, appointmentId);
    });
  });
}

function initTooltips(): void {
  const tooltipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipEls.forEach(el => {
    try {
      if (window.bootstrap?.Tooltip) {
        new window.bootstrap.Tooltip(el);
      }
    } catch { /* bootstrap may not be ready */ }
  });
}

/**
 * Handle a queue action button click
 */
function handleAction(action: PatientAction, appointmentId: string): void {
  switch (action) {
    case 'Arrived':
    case 'CheckIn':
    case 'CheckOut':
    case 'Cancel':
      handleStatusTransition(action, appointmentId);
      break;
    case 'Delay':
      handleDelay(appointmentId);
      break;
    case 'Reschedule':
      handleReschedule(appointmentId);
      break;
    case 'Bill':
      handleBill(appointmentId);
      break;
    case 'NewAppointment':
      handleNewAppointment(appointmentId);
      break;
    case 'View':
      handleView(appointmentId);
      break;
    default:
      console.warn(`[WARN] Unknown action: ${action}`);
  }
}

// ── Simple status transitions ──

function handleStatusTransition(action: PatientAction, appointmentId: string): void {
  if (action === 'Cancel') {
    const confirmMsg = i18next.t('messages.confirm.cancelAppointment', 'Are you sure you want to cancel this appointment?');
    if (!confirm(confirmMsg)) return;
    const appt = appointmentRepository.getById(appointmentId);
    if (appt) {
      const now = new Date();
      const apptTime = new Date(appt.startTime);
      const hoursUntil = (apptTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      appointmentRepository.update(appointmentId, {
        status: 'Cancelled',
        cancelledWithin24h: hoursUntil < 24,
        cancellationReason: 'Cancelled from dashboard',
      });
      console.info(
        `[AUDIT] APPOINTMENT_CANCELLED | ID: ${appointmentId} ` +
        `| Within24h: ${hoursUntil < 24} | Time: ${new Date().toISOString()}`
      );
      // Refresh punctuality — cancelling within 24h may mark patient as unreliable
      refreshPunctualityScore(appt.patientId);
    }
  } else {
    transitionStatus(appointmentId, action);
  }
  rerenderPatientQueue();
}

// ── Delay modal ──

function handleDelay(appointmentId: string): void {
  showDelayModal(appointmentId, () => {
    rerenderPatientQueue();
  });
}

// ── Reschedule modal ──

function handleReschedule(appointmentId: string): void {
  showRescheduleModal(appointmentId, () => {
    rerenderPatientQueue();
  });
}

// ── Billing modal ──

function handleBill(appointmentId: string): void {
  showBillingModal(appointmentId, () => {
    rerenderPatientQueue();
  });
}

// ── New Appointment ──

function handleNewAppointment(appointmentId: string): void {
  const appt = appointmentRepository.getById(appointmentId);
  if (!appt) return;

  console.info(
    `[AUDIT] NEW_APPOINTMENT | From: ${appointmentId} ` +
    `| Patient: ${appt.patientName} | Time: ${new Date().toISOString()}`
  );

  // Store pending patient context for the calendar to pick up
  setPendingAppointment({
    patientId: appt.patientId,
    patientName: appt.patientName,
    phone: appt.phone,
    doctorId: appt.doctor,
  });

  // Navigate to calendar — dispatches a custom event that main.ts listens for
  window.dispatchEvent(new CustomEvent('dentisyn:navigate', {
    detail: { view: 'calendar' }
  }));
}

// ── View ──

function handleView(appointmentId: string): void {
  console.info(
    `[AUDIT] VIEW_PATIENT | Appointment: ${appointmentId} | Time: ${new Date().toISOString()}`
  );
  toast(i18next.t('messages.toast.patientViewComingSoon', 'Patient view — coming soon'));
}
