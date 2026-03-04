// ──────────────────────────── Status & Action Types ────────────────────────────

export type PatientStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Arrived'
  | 'Waiting'
  | 'InTreatment'
  | 'Completed'
  | 'Left'
  | 'Cancelled'
  | 'NoShow'
  | 'Rescheduled'
  | 'Rejected';

export type PatientAction =
  | 'Confirm' | 'Reject'
  | 'Arrived' | 'Delay' | 'Reschedule'
  | 'CheckIn' | 'CheckOut'
  | 'Bill' | 'NewAppointment'
  | 'Cancel' | 'View';

export type PatientStatusIcon = 'check' | 'hourglass' | 'calendar' | 'clock' | 'x-circle';

export type PunctualityScore = 'punctual' | 'delayed' | 'unreliable';

// ──────────────────────────── Doctor ────────────────────────────

export type DoctorId = string;

export interface DoctorInfo {
  id: DoctorId;
  name: string;
  specialty: string;
  startTime: string;
  endTime: string;
  color: string;
}

/** @deprecated Use DoctorId — kept for backward-compat with calendar code */
export type Doctor = 'dr-ivanov' | 'dr-ruseva';

// ──────────────────────────── Patient ────────────────────────────

export type PatientIdType = 'EGN' | 'LNCh' | 'EU' | 'SSN';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  appointmentTime: string;
  status: PatientStatus;
  statusIcon: PatientStatusIcon;
  actions: PatientAction[];
  reason?: string;
  createdAt?: string;
  /* Extended fields (Phase 1+) */
  middleName?: string;
  familyName?: string;
  email?: string;
  address?: string;
  idType?: PatientIdType;
  idNumber?: string;
  dateOfBirth?: string;
  sex?: 'male' | 'female';
  nzokNumber?: string;
  rzokOblast?: string;
  healthRegion?: string;
  unfavorableConditions?: boolean;
  exemptFromFee?: boolean;
  pensioner?: boolean;
  familyGroupId?: string;
  punctualityScore?: PunctualityScore;
  delayHistory?: DelayRecord[];
}

// ──────────────────────────── Delay Tracking ────────────────────────────

export interface DelayRecord {
  appointmentId: string;
  scheduledTime: string;
  actualArrivalTime: string;
  delayMinutes: number;
  date: string;
}

// ──────────────────────────── Appointment ────────────────────────────

export type PaymentMethod = 'cash' | 'card' | 'nzok' | 'nzok_cash' | 'nzok_card';
export type PaymentStatus = 'unpaid' | 'paid' | 'partial';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  doctor: DoctorId;
  startTime: string;
  endTime: string;
  reason: string;
  status: PatientStatus;
  createdAt: string;
  /* Extended fields */
  delayMinutes?: number;
  actualArrivalTime?: string;
  rescheduleHistory?: RescheduleRecord[];
  cancellationReason?: string;
  rejectionReason?: string;
  confirmedAt?: string;
  cancelledWithin24h?: boolean;
  rescheduledBy?: 'doctor' | 'patient';
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  nzokAmount?: number;
  patientAmount?: number;
  totalAmount?: number;
}

export interface RescheduleRecord {
  fromAppointmentId: string;
  toAppointmentId: string;
  rescheduledBy: 'doctor' | 'patient';
  timestamp: string;
  within24h: boolean;
}
