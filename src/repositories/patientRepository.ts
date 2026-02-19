import type { Patient } from '../types/patient';

const STORAGE_KEY = 'dentisyn-patients';

export const patientRepository = {
  /**
   * Get all patients from localStorage
   */
  getAll(): Patient[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[ERROR] Failed to retrieve patients:', error);
      return [];
    }
  },

  /**
   * Get patient by ID
   */
  getById(id: string): Patient | null {
    const patients = this.getAll();
    return patients.find(p => p.id === id) || null;
  },

  /**
   * Search patients by name or phone
   */
  search(query: string): Patient[] {
    const patients = this.getAll();
    const lowerQuery = query.toLowerCase().trim();
    return patients.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.phone.includes(lowerQuery)
    );
  },

  /**
   * Create a new patient
   */
  create(patient: Omit<Patient, 'id' | 'createdAt'>): Patient {
    const patients = this.getAll();
    const newPatient: Patient = {
      ...patient,
      id: `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    patients.push(newPatient);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    console.info(
      `[AUDIT] PATIENT_CREATED | Patient: ${patient.name} | ID: ${newPatient.id} | Time: ${new Date().toISOString()}`
    );
    return newPatient;
  },

  /**
   * Update patient
   */
  update(id: string, updates: Partial<Patient>): Patient | null {
    const patients = this.getAll();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updated = { ...patients[index], ...updates };
    patients[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    console.info(
      `[AUDIT] PATIENT_UPDATED | Patient ID: ${id} | Time: ${new Date().toISOString()}`
    );
    return updated;
  },

  /**
   * Delete patient
   */
  delete(id: string): boolean {
    const patients = this.getAll();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return false;

    patients.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    console.info(
      `[AUDIT] PATIENT_DELETED | Patient ID: ${id} | Time: ${new Date().toISOString()}`
    );
    return true;
  },

  /**
   * Check if patient exists by name or phone
   */
  exists(name: string, phone: string): Patient | null {
    const patients = this.getAll();
    return patients.find(p =>
      p.name.toLowerCase() === name.toLowerCase() || p.phone === phone
    ) || null;
  },
};
