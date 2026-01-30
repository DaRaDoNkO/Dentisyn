export type PatientAction = 'View' | 'Billing' | 'Check-In' | 'Cancel' | 'Open Chart';

export type PatientStatus = 'Completed' | 'Waiting' | 'Confirmed';

export type PatientStatusIcon = 'check' | 'hourglass' | 'calendar';

export interface Patient {
  name: string;
  appointmentTime: string;
  status: PatientStatus;
  statusIcon: PatientStatusIcon;
  actions: PatientAction[];
  reason?: string;
}
