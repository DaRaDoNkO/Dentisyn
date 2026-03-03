/**
 * Appointment form handlers
 * Handles doctor availability updates and appointment saving
 */

import i18next from '../../i18n';
import type { Patient, Doctor } from '../../types/patient';
import { patientRepository } from '../../repositories/patientRepository';
import { appointmentRepository } from '../../repositories/appointmentRepository';
import { getAvailableDoctors } from './doctorUtils';
import { loadCalendarSettings } from '../user/Settings/CalendarSettings/index';

const t = (key: string, fb: string, opts?: Record<string, unknown>): string =>
  i18next.t(key, { defaultValue: fb, ...opts }) as string;

/**
 * Setup doctor availability updates based on time selection
 */
export function setupDoctorAvailability(
  startTimeSelect: HTMLSelectElement,
  endTimeSelect: HTMLSelectElement,
  doctorSelect: HTMLSelectElement,
  doctorHint: HTMLElement
) {
  const updateAvailableDoctors = () => {
    const startTime = startTimeSelect?.value;
    const endTime = endTimeSelect?.value;

    if (!startTime || !endTime) {
      doctorSelect.innerHTML = `<option value="" disabled selected>${t('appointment.selectTimeFirst', 'Select time first...')}</option>`;
      if (doctorHint) doctorHint.textContent = t('appointment.selectTimeBoth', 'Please select start and end time first');
      return;
    }

    const availableDoctors = getAvailableDoctors(startTime, endTime);

    if (availableDoctors.length === 0) {
      doctorSelect.innerHTML = `<option value="" disabled selected>${t('appointment.noDoctorsAvailable', 'No doctors available at this time')}</option>`;
      if (doctorHint) {
        doctorHint.textContent = t('appointment.noDoctorsHint', 'No doctors work during the selected time. Please choose a different time slot.');
        doctorHint.className = 'text-danger';
      }
      console.warn(`[WARN] No doctors available for time slot: ${startTime} - ${endTime}`);
    } else {
      doctorSelect.innerHTML = `<option value="" disabled selected>${t('appointment.selectDoctor', 'Select a doctor...')}</option>`;
      availableDoctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = doctor.name;
        doctorSelect.appendChild(option);
      });

      if (doctorHint) {
        doctorHint.textContent = t('appointment.doctorsAvailable', '{{count}} doctor(s) available for this time slot', { count: availableDoctors.length });
        doctorHint.className = 'text-success';
      }
      console.info(`[DEBUG] Updated doctor list: ${availableDoctors.length} available`);
    }
  };

  // Attach change listeners to time selects
  startTimeSelect?.addEventListener('change', updateAvailableDoctors);
  endTimeSelect?.addEventListener('change', updateAvailableDoctors);

  // Initial update
  updateAvailableDoctors();
}

/**
 * Setup save appointment button handler
 */
export function setupSaveAppointment(
  saveAppointmentBtn: HTMLButtonElement,
  modal: HTMLElement,
  selectedPatientRef: { current: Patient | null },
  newPatientForm: HTMLElement,
  selectedPatientInfo: HTMLElement,
  typeaheadDropdown: HTMLElement,
  onSaveCallback?: () => void
) {
  const handleSaveAppointment = () => {
    console.info('[DEBUG] Save appointment button clicked');

    // ── Step 1: Collect & validate patient data (do NOT create yet) ──────────
    let newPatientData: { fullName: string; fullPhone: string } | null = null;
    let existingPatient: Patient | null = null;

    if (newPatientForm && newPatientForm.style.display !== 'none') {
      const firstNameInput = document.getElementById('patientFirstName') as HTMLInputElement;
      const lastNameInput = document.getElementById('patientLastName') as HTMLInputElement;
      const countryCodeInput = document.getElementById('patientCountryCode') as HTMLInputElement;
      const phoneNumberInput = document.getElementById('patientPhoneNumber') as HTMLInputElement;

      if (!firstNameInput || !lastNameInput || !countryCodeInput || !phoneNumberInput) {
        alert('Patient form fields not found');
        return;
      }

      const firstName = firstNameInput.value.trim();
      const lastName = lastNameInput.value.trim();
      const countryCode = countryCodeInput.value.trim();
      const phoneNumber = phoneNumberInput.value.trim();

      if (!firstName || !lastName || !phoneNumber) {
        alert('Please enter patient first name, last name, and phone number');
        return;
      }

      const fullName = `${firstName} ${lastName}`;
      const fullPhone = `${countryCode}${phoneNumber}`;

      const duplicate = patientRepository.exists(fullName, fullPhone);
      if (duplicate) {
        alert('A patient with this name or phone number already exists!');
        return;
      }

      // Store for later — patient is NOT created yet
      newPatientData = { fullName, fullPhone };
    } else if (selectedPatientRef.current) {
      existingPatient = selectedPatientRef.current;
      console.info('[DEBUG] Using existing patient:', existingPatient.id);
    } else {
      alert('Please search for an existing patient or create a new one!');
      return;
    }

    // ── Step 2: Collect & validate appointment fields ─────────────────────────
    const doctorEl = document.getElementById('doctorSelect') as HTMLSelectElement;
    const dateEl = document.getElementById('appointmentDate') as HTMLInputElement;
    const startTimeEl = document.getElementById('appointmentStartTime') as HTMLSelectElement;
    const endTimeEl = document.getElementById('appointmentEndTime') as HTMLSelectElement;
    const reasonEl = document.getElementById('appointmentReason') as HTMLTextAreaElement;

    if (!doctorEl || !dateEl || !startTimeEl || !endTimeEl || !reasonEl) {
      alert('Some form fields are missing. Please refresh the page.');
      return;
    }

    const doctor = doctorEl.value as Doctor;
    const date = dateEl.value;
    const startTime = startTimeEl.value;
    const endTime = endTimeEl.value;
    const reason = reasonEl.value.trim() || 'No reason specified'; // Optional field

    if (!doctor || !date || !startTime || !endTime) {
      alert('Please fill in all required fields (Doctor, Date, Times)');
      return;
    }

    // ── Step 3: Validate doctor availability ──────────────────────────────────
    const availableDoctors = getAvailableDoctors(startTime, endTime);
    const isDoctorAvailable = availableDoctors.some(d => d.id === doctor);

    if (!isDoctorAvailable) {
      const settings = loadCalendarSettings();
      const doctorSchedule = settings.doctorSchedules.find(s => s.doctorId === doctor);
      const doctorName = doctorSchedule?.doctorName || doctor;
      const workingHours = doctorSchedule
        ? `${doctorSchedule.startTime} - ${doctorSchedule.endTime}`
        : 'unknown';

      alert(
        `Cannot create appointment: ${doctorName} is not available at this time.\n\n` +
        `Working hours: ${workingHours}\n` +
        `Selected time: ${startTime} - ${endTime}\n\n` +
        `Please select a different time or doctor.`
      );
      return;
    }

    // ── Step 4: All validations passed — now create patient if new ─────────────
    let patient: Patient;
    if (newPatientData) {
      patient = patientRepository.create({
        name: newPatientData.fullName,
        phone: newPatientData.fullPhone,
        appointmentTime: new Date().toISOString(),
        status: 'Confirmed',
        statusIcon: 'calendar',
        actions: ['View', 'Cancel'],
      });
      console.info('[DEBUG] Created new patient:', patient.id);
    } else {
      patient = existingPatient!;
    }

    // ── Step 5: Create appointment ─────────────────────────────────────────────
    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    const appointment = appointmentRepository.create({
      patientId: patient.id,
      patientName: patient.name,
      phone: patient.phone,
      doctor,
      startTime: startDateTime,
      endTime: endDateTime,
      reason,
      status: 'Confirmed',
    });

    console.info(
      `[AUDIT] APPOINTMENT_SAVED | ID: ${appointment.id} | Patient: ${patient.name} | Doctor: ${doctor} | Time: ${new Date().toISOString()}`
    );

    // Reset state
    selectedPatientRef.current = null;
    if (newPatientForm) newPatientForm.style.display = 'none';
    if (selectedPatientInfo) selectedPatientInfo.style.display = 'none';
    if (typeaheadDropdown) typeaheadDropdown.style.display = 'none';

    // Close modal
    const bsModal = (window as any).bootstrap?.Modal?.getInstance(modal);
    if (bsModal) {
      bsModal.hide();
    }

    // Callback to refresh calendar
    if (onSaveCallback) {
      onSaveCallback();
    }
  };

  saveAppointmentBtn.addEventListener('click', handleSaveAppointment);
}
