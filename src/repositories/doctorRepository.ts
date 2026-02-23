import type { DoctorInfo, DoctorId } from '../types/patient';

const STORAGE_KEY = 'dentisyn-doctors';

export const doctorRepository = {
  /**
   * Get all doctors from localStorage
   */
  getAll(): DoctorInfo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[ERROR] Failed to retrieve doctors:', error);
      return [];
    }
  },

  /**
   * Get doctor by ID
   */
  getById(id: DoctorId): DoctorInfo | null {
    const doctors = this.getAll();
    return doctors.find(d => d.id === id) || null;
  },

  /**
   * Get doctor display name (short initials)
   */
  getInitials(id: DoctorId): string {
    const doctor = this.getById(id);
    if (!doctor) return id;
    return doctor.name
      .split(' ')
      .map(w => w[0])
      .join('.')
      .toUpperCase();
  },

  /**
   * Get doctor display name
   */
  getDisplayName(id: DoctorId): string {
    const doctor = this.getById(id);
    return doctor ? doctor.name : id;
  },

  /**
   * Create a new doctor
   */
  create(doctor: Omit<DoctorInfo, 'id'>): DoctorInfo {
    const doctors = this.getAll();
    const newDoctor: DoctorInfo = {
      ...doctor,
      id: `dr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    doctors.push(newDoctor);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doctors));
    console.info(
      `[AUDIT] DOCTOR_CREATED | Name: ${doctor.name} | Time: ${new Date().toISOString()}`
    );
    return newDoctor;
  },

  /**
   * Seed localStorage with doctors if empty
   */
  seed(doctors: DoctorInfo[]): void {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing || JSON.parse(existing).length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doctors));
      console.info('[INIT] Loaded doctors into localStorage');
    }
  },
};
