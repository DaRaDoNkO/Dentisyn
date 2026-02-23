import type { DoctorId } from '../types/patient';

/**
 * Global pending-appointment context.
 * Set when the user clicks "New Appointment" from the dashboard queue
 * so the calendar + modal can pre-fill the patient information.
 */
export interface PendingAppointmentContext {
  patientId: string;
  patientName: string;
  phone: string;
  doctorId: DoctorId;
}

let pendingContext: PendingAppointmentContext | null = null;

export function setPendingAppointment(
  ctx: PendingAppointmentContext | null
): void {
  pendingContext = ctx;
  if (ctx) {
    console.info(
      `[AUDIT] PENDING_APPOINTMENT_SET | Patient: ${ctx.patientName} ` +
      `| Doctor: ${ctx.doctorId} | Time: ${new Date().toISOString()}`
    );
  }
}

export function getPendingAppointment(): PendingAppointmentContext | null {
  return pendingContext;
}

export function clearPendingAppointment(): void {
  if (pendingContext) {
    console.info(
      `[AUDIT] PENDING_APPOINTMENT_CLEARED | Time: ${new Date().toISOString()}`
    );
  }
  pendingContext = null;
}
