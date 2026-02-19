import type { Appointment } from '../types/patient';

const STORAGE_KEY = 'dentisyn-appointments';

export const appointmentRepository = {
  /**
   * Get all appointments from localStorage
   */
  getAll(): Appointment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[ERROR] Failed to retrieve appointments:', error);
      return [];
    }
  },

  /**
   * Get appointment by ID
   */
  getById(id: string): Appointment | null {
    const appointments = this.getAll();
    return appointments.find(a => a.id === id) || null;
  },

  /**
   * Get appointments by patient ID
   */
  getByPatientId(patientId: string): Appointment[] {
    const appointments = this.getAll();
    return appointments.filter(a => a.patientId === patientId);
  },

  /**
   * Get appointments by doctor
   */
  getByDoctor(doctor: string): Appointment[] {
    const appointments = this.getAll();
    return appointments.filter(a => a.doctor === doctor);
  },

  /**
   * Create a new appointment
   */
  create(appointment: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
    const appointments = this.getAll();
    const newAppointment: Appointment = {
      ...appointment,
      id: `appointment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    appointments.push(newAppointment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    console.info(
      `[AUDIT] APPOINTMENT_CREATED | Patient: ${appointment.patientName} | Doctor: ${appointment.doctor} | Time: ${new Date().toISOString()}`
    );
    return newAppointment;
  },

  /**
   * Update appointment
   */
  update(id: string, updates: Partial<Appointment>): Appointment | null {
    const appointments = this.getAll();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return null;

    const updated = { ...appointments[index], ...updates };
    appointments[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    console.info(
      `[AUDIT] APPOINTMENT_UPDATED | Appointment ID: ${id} | Time: ${new Date().toISOString()}`
    );
    return updated;
  },

  /**
   * Delete appointment
   */
  delete(id: string): boolean {
    const appointments = this.getAll();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return false;

    appointments.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    console.info(
      `[AUDIT] APPOINTMENT_DELETED | Appointment ID: ${id} | Time: ${new Date().toISOString()}`
    );
    return true;
  },

  /**
   * Get appointments for a specific date range
   */
  getByDateRange(startDate: string, endDate: string): Appointment[] {
    const appointments = this.getAll();
    return appointments.filter(a => {
      const apptStart = new Date(a.startTime);
      const apptEnd = new Date(a.endTime);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);
      return apptStart >= rangeStart && apptEnd <= rangeEnd;
    });
  },
};
