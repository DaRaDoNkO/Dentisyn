import type { PatientStatus, PatientAction, DoctorId } from '../../../types/patient';

/** Maps a status to the actions available in that state */
export interface StatusAction {
  status: PatientStatus;
  actions: PatientAction[];
}

/** State for the doctor filter in the queue */
export interface QueueFilterState {
  selectedDoctor: DoctorId | 'all';
}

/** Shape of a row in the patient queue table */
export interface QueueRow {
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: DoctorId;
  doctorName: string;
  startTime: string;
  endTime: string;
  status: PatientStatus;
  reason: string;
  delayMinutes?: number;
}
