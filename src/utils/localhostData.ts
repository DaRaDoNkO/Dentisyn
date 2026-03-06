/**
 * Localhost Data Loader
 * This utility loads test data from the localhost folder
 * for temporary storage until a real database is implemented
 */

import doctorsData from '../../localhost/doctors.json';
import patientsData from '../../localhost/patients.json';
import appointmentsData from '../../localhost/appointments.json';
import { doctorRepository } from '../repositories/doctorRepository';
import type { DoctorInfo } from '../types/patient';

export interface DoctorData {
  id: string;
  name: string;
  specialty: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface PatientData {
  id: string;
  name: string;
  phone: string;
  egn?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface AppointmentData {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  doctor: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: string;
  createdAt: string;
}

/**
 * Get all doctors from localhost test data
 */
export function getTestDoctors(): DoctorData[] {
  return doctorsData as DoctorData[];
}

/**
 * Get all patients from localhost test data
 */
export function getTestPatients(): PatientData[] {
  return patientsData as PatientData[];
}

/**
 * Get all appointments from localhost test data
 */
export function getTestAppointments(): AppointmentData[] {
  return appointmentsData as AppointmentData[];
}

/**
 * Get doctor by ID
 */
export function getTestDoctorById(id: string): DoctorData | null {
  const doctors = getTestDoctors();
  return doctors.find(d => d.id === id) || null;
}

/**
 * Get patient by ID
 */
export function getTestPatientById(id: string): PatientData | null {
  const patients = getTestPatients();
  return patients.find(p => p.id === id) || null;
}

/**
 * Initialize localStorage with test data if empty
 * This should be called when the application starts
 */
export function initializeTestData(): void {
  const PATIENTS_KEY = 'dentisyn-patients';
  const APPOINTMENTS_KEY = 'dentisyn-appointments';

  // Seed doctors first
  doctorRepository.seed(doctorsData as DoctorInfo[]);

  // Check if localStorage already has data
  const existingPatients = localStorage.getItem(PATIENTS_KEY);
  const existingAppointments = localStorage.getItem(APPOINTMENTS_KEY);

  // Initialize patients if empty
  if (!existingPatients || JSON.parse(existingPatients).length === 0) {
    const testPatients = getTestPatients().map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      appointmentTime: '', // Will be set by appointments
      status: 'Confirmed' as const,
      statusIcon: 'calendar' as const,
      actions: ['View', 'Billing', 'Check-In', 'Cancel', 'Open Chart'] as const,
      createdAt: p.createdAt,
    }));
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(testPatients));
    console.info('[INIT] Loaded test patients from localhost folder');
  }

  // Initialize appointments if empty — rewrite dates to today so dashboard always works
  if (!existingAppointments || JSON.parse(existingAppointments).length === 0) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const testAppointments = getTestAppointments().map(a => ({
      ...a,
      startTime: a.startTime.replace(/^\d{4}-\d{2}-\d{2}/, today),
      endTime: a.endTime.replace(/^\d{4}-\d{2}-\d{2}/, today),
    }));
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(testAppointments));
    console.info('[INIT] Loaded test appointments from localhost folder (dates adjusted to today)');
  } else {
    // If appointments exist, check if there are pending test appointments from past dates and move them to today
    // This solves the issue of test data "disappearing" on subsequent days
    const today = new Date().toISOString().split('T')[0];
    let appts = JSON.parse(existingAppointments) as AppointmentData[];
    let changed = false;
    
    appts = appts.map(a => {
      // Only process the test appointments (they have appt-00X format or similar, or just any pending in past)
      if (a.status === 'Pending' && !a.startTime.startsWith(today) && a.startTime < today) {
        changed = true;
        const timeStartMatch = a.startTime.match(/T\d{2}:\d{2}:\d{2}/) || ['T10:00:00'];
        const timeEndMatch = a.endTime.match(/T\d{2}:\d{2}:\d{2}/) || ['T10:30:00'];
        return {
          ...a,
          startTime: `${today}${timeStartMatch[0]}`,
          endTime: `${today}${timeEndMatch[0]}`
        };
      }
      return a;
    });

    if (changed) {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appts));
      console.info('[INIT] Re-adjusted past pending appointments forward to today for testing convenience');
    }
  }
}
