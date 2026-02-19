export type PatientAction = 'View' | 'Billing' | 'Check-In' | 'Cancel' | 'Open Chart';

export type PatientStatus = 'Completed' | 'Waiting' | 'Confirmed';

export type PatientStatusIcon = 'check' | 'hourglass' | 'calendar';

export type Doctor = 'dr-ivanov' | 'dr-ruseva';

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
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  doctor: Doctor;
  startTime: string;
  endTime: string;
  reason: string;
  status: PatientStatus;
  createdAt: string;
}
