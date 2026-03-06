import type { Doctor } from '../../../../types/patient';
import type { DateFormatPattern } from '../../../../utils/dateUtils';
import { getTestDoctors } from '../../../../utils/localhostData';
import i18next from '../../../../i18n';

export interface CalendarSettings {
  timeFormat: '24h' | '12h';
  dateFormat: DateFormatPattern;
  slotDuration: 15 | 30 | 60;
  weekStartDay: 0 | 1; // 0 = Sunday, 1 = Monday
  hiddenDays: number[]; // e.g. [0, 6] for Sunday & Saturday
  doctorSchedules: DoctorSchedule[];
  rejectionReasons: string[];
  appointmentReasons: string[];
  isReasonRequired: boolean;
  isReasonVisible: boolean;
  isNotesRequired: boolean;
}

export interface DoctorSchedule {
  doctorId: Doctor;
  doctorName: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
}

export const SETTINGS_KEY = 'dentisyn-calendar-settings';

// Load default doctor schedules from localhost test data
const loadDefaultDoctorSchedules = (): DoctorSchedule[] => {
  const testDoctors = getTestDoctors();
  return testDoctors.map(doctor => ({
    doctorId: doctor.id as Doctor,
    doctorName: doctor.name,
    startTime: doctor.startTime,
    endTime: doctor.endTime,
  }));
};

// Default settings
export const defaultSettings: CalendarSettings = {
  timeFormat: '24h',
  dateFormat: 'dd.MM.yyyy',
  slotDuration: 30,
  weekStartDay: 1, // Monday default
  hiddenDays: [0, 6], // Hide Saturday & Sunday by default
  doctorSchedules: loadDefaultDoctorSchedules(),
  rejectionReasons: [],
  appointmentReasons: [],
  isReasonRequired: false,
  isReasonVisible: true,
  isNotesRequired: false,
};

/** i18n keys for the default rejection reasons */
const DEFAULT_REJECTION_KEYS = [
  'calendar.rejectionReasonPatientCancel',
  'calendar.rejectionReasonScheduleConflict',
  'calendar.rejectionReasonInsurance',
  'calendar.rejectionReasonEmergency',
  'calendar.rejectionReasonDoctorUnavailable',
];

/** Get default rejection reasons translated from i18n */
export const getDefaultRejectionReasons = (): string[] =>
  DEFAULT_REJECTION_KEYS.map(key => i18next.t(key) as string);

const DEFAULT_APPOINTMENT_REASONS_KEYS = [
  'appointment.reasonRoutineCheckup',
  'appointment.reasonCleaning',
  'appointment.reasonRootCanal',
  'appointment.reasonExtraction',
  'appointment.reasonConsultation'
];

export const getDefaultAppointmentReasons = (): string[] =>
  DEFAULT_APPOINTMENT_REASONS_KEYS.map(key => i18next.t(key) as string);
