import type { PatientStatus, PatientAction, Appointment } from '../../../types/patient';
import { appointmentRepository } from '../../../repositories/appointmentRepository';

/**
 * Status → allowed actions mapping
 * Implements the full check-in workflow
 */
const STATUS_ACTIONS: Record<PatientStatus, PatientAction[]> = {
  Confirmed:    ['Arrived', 'Delay', 'Reschedule'],
  Arrived:      ['CheckIn', 'Reschedule', 'Cancel'],
  Waiting:      ['CheckIn', 'Reschedule', 'Cancel'],
  InTreatment:  ['CheckOut', 'Reschedule', 'Cancel'],
  Completed:    ['Bill', 'NewAppointment', 'Cancel'],
  Left:         ['NewAppointment'],
  Cancelled:    ['Reschedule'],
  NoShow:       ['Reschedule'],
  Rescheduled:  [],
};

/**
 * Get the allowed actions for a given status
 */
export function getNextActions(status: PatientStatus): PatientAction[] {
  return STATUS_ACTIONS[status] ?? [];
}

/**
 * Status → next status when an action is performed
 */
const ACTION_TRANSITIONS: Partial<Record<PatientAction, PatientStatus>> = {
  Arrived:    'Waiting',
  CheckIn:    'InTreatment',
  CheckOut:   'Completed',
  Cancel:     'Cancelled',
};

/**
 * Transition an appointment to a new status via an action
 * Returns the updated appointment or null if invalid
 */
export function transitionStatus(
  appointmentId: string,
  action: PatientAction
): Appointment | null {
  const appointment = appointmentRepository.getById(appointmentId);
  if (!appointment) return null;

  const allowed = getNextActions(appointment.status);
  if (!allowed.includes(action)) {
    console.warn(
      `[WARN] Action "${action}" not allowed for status "${appointment.status}"`
    );
    return null;
  }

  const nextStatus = ACTION_TRANSITIONS[action];
  if (!nextStatus) return null; // Actions like Bill, Delay handled elsewhere

  const updates: Partial<Appointment> = { status: nextStatus };

  // If arriving, record the actual arrival time
  if (action === 'Arrived') {
    updates.actualArrivalTime = new Date().toISOString();
  }

  const updated = appointmentRepository.update(appointmentId, updates);
  if (updated) {
    console.info(
      `[AUDIT] STATUS_TRANSITION | Appointment: ${appointmentId} ` +
      `| ${appointment.status} → ${nextStatus} (action: ${action}) ` +
      `| Time: ${new Date().toISOString()}`
    );
  }
  return updated;
}
