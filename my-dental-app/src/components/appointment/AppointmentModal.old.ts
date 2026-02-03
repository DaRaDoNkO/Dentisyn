import { patientRepository } from '../../repositories/patientRepository';
import { appointmentRepository } from '../../repositories/appointmentRepository';
import type { Patient, Doctor } from '../../types/patient';
import { validateEGN, validateLNCh, detectIDType } from '../../utils/bgUtils';
import { loadCalendarSettings } from '../user/Settings/CalendarSettings/index';

let selectedPatient: Patient | null = null;

// Country codes for phone input
const COUNTRY_CODES = [
  { code: '+359', country: 'Bulgaria' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+39', country: 'Italy' },
  { code: '+34', country: 'Spain' },
  { code: '+30', country: 'Greece' },
  { code: '+40', country: 'Romania' },
  { code: '+90', country: 'Turkey' },
];

/**
 * Generate time options for dropdown in 15-minute intervals
 * @param startHour - Starting hour (0-23)
 * @param endHour - Ending hour (0-23)
 * @param interval - Interval in minutes (default: 15)
 * @param is24h - Use 24-hour format (default: true)
 * @returns HTML option elements as string
 */
function generateTimeOptions(
  startHour: number = 0,
  endHour: number = 23,
  interval: number = 15,
  is24h: boolean = true
): string {
  const options: string[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      if (hour === endHour && minute > 0) break; // Stop at endHour:00

      const timeValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      let displayText: string;

      if (is24h) {
        displayText = timeValue;
      } else {
        // Convert to 12-hour format
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        displayText = `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
      }

      options.push(`<option value="${timeValue}">${displayText}</option>`);
    }
  }

  return options.join('\n');
}

/**
 * Filter available doctors based on selected time slot
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Array of available doctor objects with id and name
 */
function getAvailableDoctors(startTime: string, endTime: string): Array<{ id: Doctor, name: string }> {
  const settings = loadCalendarSettings();
  const availableDoctors: Array<{ id: Doctor, name: string }> = [];

  settings.doctorSchedules.forEach(schedule => {
    const isStartValid = startTime >= schedule.startTime;
    const isEndValid = endTime <= schedule.endTime;

    if (isStartValid && isEndValid) {
      availableDoctors.push({
        id: schedule.doctorId,
        name: schedule.doctorName
      });
    }
  });

  return availableDoctors;
}

export const renderAppointmentModal = (clickedDateISO: string): string => {
  const clickedDate = new Date(clickedDateISO);
  const defaultEndTime = new Date(clickedDate.getTime() + 30 * 60000); // 30 min duration

  // Load user's time format preference
  const settings = loadCalendarSettings();
  const is24h = settings.timeFormat === '24h';

  // Generate time options (8 AM to 8 PM)
  const timeOptions = generateTimeOptions(8, 20, 15, is24h);

  // Get default selected times
  const startTimeValue = `${String(clickedDate.getHours()).padStart(2, '0')}:${String(clickedDate.getMinutes()).padStart(2, '0')}`;
  const endTimeValue = `${String(defaultEndTime.getHours()).padStart(2, '0')}:${String(defaultEndTime.getMinutes()).padStart(2, '0')}`;

  return `
    <div class="modal fade" id="appointmentModal" tabindex="-1" aria-labelledby="appointmentModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="appointmentModalLabel" data-i18n="appointment.newAppointment">New Appointment</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="appointmentForm">
              <!-- Smart Patient Search (Typeahead) -->
              <div class="mb-3">
                <label for="patientNameSearch" class="form-label fw-bold" data-i18n="appointment.patientName">
                  Patient Name
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="patientNameSearch"
                  placeholder="Type to search or create new patient..."
                  autocomplete="off"
                >
                <small class="text-muted d-block mt-1" data-i18n="appointment.typeaheadHint">
                  Start typing to search existing patients
                </small>
                
                <!-- Typeahead Dropdown -->
                <div id="patientTypeaheadDropdown" class="dropdown-menu w-100" style="display: none; max-height: 300px; overflow-y: auto;">
                  <!-- Results populated dynamically -->
                </div>
              </div>

              <!-- Selected Patient Display -->
              <div id="selectedPatientInfo" class="alert alert-info d-flex justify-content-between align-items-center" style="display: none;">
                <div>
                  <strong id="selectedPatientName"></strong><br>
                  <small id="selectedPatientDetails" class="text-muted"></small>
                </div>
                <button type="button" class="btn btn-sm btn-outline-secondary" id="changePatientBtn">
                  <i class="bi bi-pencil"></i> Change
                </button>
              </div>

              <!-- New/Edit Patient Form (hidden initially) -->
              <div id="newPatientForm" style="display: none;">
                <div class="border-top pt-3 mb-3">
                  <h6 class="text-primary mb-3">
                    <i class="bi bi-person-plus me-2"></i>
                    <span id="patientFormTitle" data-i18n="appointment.newPatientDetails">New Patient Details</span>
                  </h6>
                  
                  <div class="row">
                    <!-- First Name -->
                    <div class="col-md-6 mb-3">
                      <label for="patientFirstName" class="form-label">First Name</label>
                      <input type="text" class="form-control" id="patientFirstName" required>
                    </div>
                    <!-- Last Name -->
                    <div class="col-md-6 mb-3">
                      <label for="patientLastName" class="form-label">Last Name</label>
                      <input type="text" class="form-control" id="patientLastName" required>
                    </div>
                  </div>
                  
                  <!-- Smart Phone Input (Split: Country Code + Number) -->
                  <div class="mb-3">
                    <label class="form-label">Phone Number</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        id="patientCountryCode"
                        list="countryCodeList"
                        placeholder="+359"
                        value="+359"
                        style="max-width: 100px;"
                      >
                      <input
                        type="tel"
                        class="form-control"
                        id="patientPhoneNumber"
                        placeholder="888123456"
                        required
                      >
                    </div>
                    <datalist id="countryCodeList">
                      ${COUNTRY_CODES.map(
    (c) => `<option value="${c.code}">${c.country}</option>`
  ).join('')}
                    </datalist>
                    <small class="text-muted">Numbers only (no spaces or dashes)</small>
                  </div>
                  
                  <!-- ID Type and Number -->
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <label for="patientIDType" class="form-label">ID Type</label>
                      <select class="form-select" id="patientIDType">
                        <option value="egn" selected>BG (EGN)</option>
                        <option value="lnch">LNCh (Resident)</option>
                        <option value="foreign">Foreign</option>
                      </select>
                      <small class="text-muted">Auto-detects</small>
                    </div>
                    <div class="col-md-8 mb-3">
                      <label for="patientIDNumber" class="form-label">ID Number</label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="patientIDNumber" 
                        placeholder="Enter EGN, LNCh, or Passport"
                        maxlength="20"
                      >
                      <small id="idValidationFeedback" class="text-muted"></small>
                    </div>
                  </div>
                  
                  <!-- Date of Birth and Sex (auto-filled for EGN) -->
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="patientDOB" class="form-label">Date of Birth</label>
                      <input type="date" class="form-control" id="patientDOB">
                      <small class="text-muted">Auto-filled for EGN</small>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="patientSex" class="form-label">Sex</label>
                      <select class="form-select" id="patientSex">
                        <option value="">Select...</option>
                        <option value="m">Male</option>
                        <option value="f">Female</option>
                      </select>
                      <small class="text-muted">Auto-filled for EGN</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Date & Time (MOVED UP) -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="appointmentDate" class="form-label fw-bold">Date</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="appointmentDate" 
                    value="${clickedDate.toISOString().split('T')[0]}"
                    required
                  >
                </div>
                <div class="col-md-3 mb-3">
                  <label for="appointmentStartTime" class="form-label fw-bold">Start Time</label>
                  <select class="form-select" id="appointmentStartTime" required>
                    ${timeOptions.split('\n').map(opt => {
    const match = opt.match(/value="([^"]+)"/);
    const value = match ? match[1] : '';
    return opt.replace('<option', `<option${value === startTimeValue ? ' selected' : ''}`);
  }).join('\n')}
                  </select>
                </div>
                <div class="col-md-3 mb-3">
                  <label for="appointmentEndTime" class="form-label fw-bold">End Time</label>
                  <select class="form-select" id="appointmentEndTime" required>
                    ${timeOptions.split('\n').map(opt => {
    const match = opt.match(/value="([^"]+)"/);
    const value = match ? match[1] : '';
    return opt.replace('<option', `<option${value === endTimeValue ? ' selected' : ''}`);
  }).join('\n')}
                  </select>
                </div>
              </div>

              <!-- Doctor Selection (MOVED AFTER TIME) -->
              <div class="mb-3">
                <label for="doctorSelect" class="form-label fw-bold" data-i18n="appointment.assignDoctor">Assign Doctor</label>
                <select class="form-select" id="doctorSelect" required>
                  <option value="" disabled selected>Select time first...</option>
                </select>
                <small class="text-muted" id="doctorAvailabilityHint">Available doctors will appear based on selected time</small>
              </div>

              <!-- Reason/Notes (OPTIONAL) -->
              <div class="mb-3">
                <label for="appointmentReason" class="form-label">
                  Reason / Notes 
                  <span class="badge bg-secondary ms-2">Optional</span>
                </label>
                <textarea 
                  class="form-control" 
                  id="appointmentReason" 
                  rows="3" 
                  placeholder="e.g., Regular checkup, Cleaning, Root canal..."
                ></textarea>
                <small class="text-muted">Leave blank if not specified</small>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-1"></i> Cancel
            </button>
            <button type="button" class="btn btn-primary" id="saveAppointmentBtn">
              <i class="bi bi-check-circle me-1"></i> Save Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Initialize appointment modal event handlers with smart features
 */
export const initAppointmentModal = (onSaveCallback?: () => void) => {
  const modal = document.getElementById('appointmentModal') as HTMLElement | null;
  if (!modal) {
    console.error('[ERROR] appointmentModal element not found');
    return;
  }

  const patientNameSearch = document.getElementById('patientNameSearch') as HTMLInputElement;
  const typeaheadDropdown = document.getElementById('patientTypeaheadDropdown') as HTMLElement;
  const selectedPatientInfo = document.getElementById('selectedPatientInfo') as HTMLElement;
  const selectedPatientName = document.getElementById('selectedPatientName') as HTMLElement;
  const selectedPatientDetails = document.getElementById('selectedPatientDetails') as HTMLElement;
  const changePatientBtn = document.getElementById('changePatientBtn') as HTMLButtonElement;
  const newPatientForm = document.getElementById('newPatientForm') as HTMLElement;
  const saveAppointmentBtn = document.getElementById('saveAppointmentBtn') as HTMLButtonElement;

  // Get time and doctor selection elements
  const startTimeSelect = document.getElementById('appointmentStartTime') as HTMLSelectElement;
  const endTimeSelect = document.getElementById('appointmentEndTime') as HTMLSelectElement;
  const doctorSelect = document.getElementById('doctorSelect') as HTMLSelectElement;
  const doctorHint = document.getElementById('doctorAvailabilityHint') as HTMLElement;

  console.info('[DEBUG] AppointmentModal initialized with smart features');

  // --- UPDATE AVAILABLE DOCTORS BASED ON TIME ---
  const updateAvailableDoctors = () => {
    const startTime = startTimeSelect?.value;
    const endTime = endTimeSelect?.value;

    if (!startTime || !endTime) {
      doctorSelect.innerHTML = '<option value="" disabled selected>Select time first...</option>';
      if (doctorHint) doctorHint.textContent = 'Please select start and end time first';
      return;
    }

    const availableDoctors = getAvailableDoctors(startTime, endTime);

    if (availableDoctors.length === 0) {
      doctorSelect.innerHTML = '<option value="" disabled selected>No doctors available at this time</option>';
      if (doctorHint) {
        doctorHint.textContent = 'No doctors work during the selected time. Please choose a different time slot.';
        doctorHint.className = 'text-danger';
      }
      console.warn(`[WARN] No doctors available for time slot: ${startTime} - ${endTime}`);
    } else {
      doctorSelect.innerHTML = '<option value="" disabled selected>Select a doctor...</option>';
      availableDoctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = doctor.name;
        doctorSelect.appendChild(option);
      });

      if (doctorHint) {
        doctorHint.textContent = `${availableDoctors.length} doctor(s) available for this time slot`;
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

  // --- SMART PATIENT SEARCH (TYPEAHEAD) ---
  const handleTypeahead = (e: Event) => {
    const query = (e.target as HTMLInputElement).value.trim();

    if (query.length < 2) {
      typeaheadDropdown.style.display = 'none';
      return;
    }

    const results = patientRepository.search(query);

    let dropdownHTML = '';

    // Show existing patients
    if (results.length > 0) {
      dropdownHTML += results
        .map(
          (patient) => `
        <button 
          type="button" 
          class="dropdown-item patient-result-item" 
          data-patient-id="${patient.id}"
        >
          <strong>${patient.name}</strong><br>
          <small class="text-muted">${patient.phone}</small>
        </button>
      `
        )
        .join('');
    }

    // Always show "Create new" option
    dropdownHTML += `
      <button 
        type="button" 
        class="dropdown-item text-primary border-top create-new-patient-item"
        data-create-name="${query}"
      >
        <i class="bi bi-plus-circle me-2"></i>
        <strong>➕ Create new: "${query}"</strong>
      </button>
    `;

    typeaheadDropdown.innerHTML = dropdownHTML;
    typeaheadDropdown.style.display = 'block';

    // Attach click handlers
    const patientResults = typeaheadDropdown.querySelectorAll('.patient-result-item');
    patientResults.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const button = e.currentTarget as HTMLElement;
        const patientId = button.dataset.patientId;
        selectExistingPatient(patientId!);
      });
    });

    const createNewBtn = typeaheadDropdown.querySelector('.create-new-patient-item');
    if (createNewBtn) {
      createNewBtn.addEventListener('click', (e) => {
        const button = e.currentTarget as HTMLElement;
        const nameToCreate = button.dataset.createName || '';
        switchToEditMode(nameToCreate);
      });
    }
  };

  if (patientNameSearch) {
    patientNameSearch.addEventListener('input', handleTypeahead);

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!patientNameSearch.contains(e.target as Node) && !typeaheadDropdown.contains(e.target as Node)) {
        typeaheadDropdown.style.display = 'none';
      }
    });
  }

  // Select existing patient
  const selectExistingPatient = (patientId: string) => {
    selectedPatient = patientRepository.getById(patientId);

    if (selectedPatient) {
      patientNameSearch.value = '';
      typeaheadDropdown.style.display = 'none';
      selectedPatientInfo.style.display = 'flex';
      newPatientForm.style.display = 'none';

      selectedPatientName.textContent = selectedPatient.name;
      selectedPatientDetails.textContent = `Phone: ${selectedPatient.phone}`;

      console.info('[DEBUG] Selected existing patient:', selectedPatient.id);
    }
  };

  // Switch to edit mode (create new patient)
  const switchToEditMode = (nameToSplit: string) => {
    patientNameSearch.value = '';
    typeaheadDropdown.style.display = 'none';
    selectedPatientInfo.style.display = 'none';
    newPatientForm.style.display = 'block';
    selectedPatient = null;

    // Split name by space and auto-fill First/Last Name
    const firstNameInput = document.getElementById('patientFirstName') as HTMLInputElement;
    const lastNameInput = document.getElementById('patientLastName') as HTMLInputElement;

    if (firstNameInput && lastNameInput && nameToSplit) {
      const parts = nameToSplit.trim().split(/\s+/);
      firstNameInput.value = parts[0] || '';
      lastNameInput.value = parts.slice(1).join(' ') || '';
      console.info('[DEBUG] Auto-filled name from query:', { first: parts[0], last: parts.slice(1).join(' ') });
    }
  };

  // Change patient button
  if (changePatientBtn) {
    changePatientBtn.addEventListener('click', () => {
      selectedPatientInfo.style.display = 'none';
      selectedPatient = null;
      patientNameSearch.value = '';
      patientNameSearch.focus();
      console.info('[DEBUG] User clicked Change Patient');
    });
  }

  // --- SMART PHONE INPUT (VALIDATION) ---
  const phoneNumberInput = document.getElementById('patientPhoneNumber') as HTMLInputElement;

  if (phoneNumberInput) {
    phoneNumberInput.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      // Replace non-digits with empty string
      input.value = input.value.replace(/\D/g, '');
    });
  }

  // --- ID AUTO-DETECTION LOGIC (FROM BULGARIAN ID UTILS) ---
  const patientIDNumber = document.getElementById('patientIDNumber') as HTMLInputElement;
  const patientIDType = document.getElementById('patientIDType') as HTMLSelectElement;
  const patientDOB = document.getElementById('patientDOB') as HTMLInputElement;
  const patientSex = document.getElementById('patientSex') as HTMLSelectElement;
  const idValidationFeedback = document.getElementById('idValidationFeedback') as HTMLElement;

  const handleIDAutoDetect = () => {
    if (!patientIDNumber || !patientIDType || !patientDOB || !patientSex || !idValidationFeedback) {
      return;
    }

    const idValue = patientIDNumber.value.trim();

    if (!idValue) {
      idValidationFeedback.textContent = '';
      idValidationFeedback.className = 'text-muted';
      return;
    }

    const previousType = patientIDType.value;
    const detectedType = detectIDType(idValue);

    console.info('[DEBUG] ID Auto-Detect:', { idValue, previousType, detectedType });

    // Case A: Valid EGN
    if (detectedType === 'egn') {
      const egnResult = validateEGN(idValue);

      if (egnResult.valid && egnResult.dob && egnResult.sex) {
        patientIDType.value = 'egn';

        const year = egnResult.dob.getFullYear();
        const month = String(egnResult.dob.getMonth() + 1).padStart(2, '0');
        const day = String(egnResult.dob.getDate()).padStart(2, '0');
        patientDOB.value = `${year}-${month}-${day}`;

        patientSex.value = egnResult.sex;

        idValidationFeedback.textContent = '✓ Valid EGN - DOB and sex auto-filled';
        idValidationFeedback.className = 'text-success';

        console.info('[DEBUG] EGN validated and auto-filled');
      }
    }
    // Case B: Valid LNCh
    else if (detectedType === 'lnch') {
      const lnchResult = validateLNCh(idValue);

      if (lnchResult.valid) {
        if (previousType === 'lnch') {
          idValidationFeedback.textContent = '✓ Valid LNCh number';
          idValidationFeedback.className = 'text-success';
        } else {
          const shouldSwitch = confirm('Detected LNCh format (Resident ID).\n\nSwitch patient type to LNCh?');

          if (shouldSwitch) {
            patientIDType.value = 'lnch';
            idValidationFeedback.textContent = '✓ Valid LNCh - Switched to LNCh type';
            idValidationFeedback.className = 'text-success';
          } else {
            idValidationFeedback.textContent = '⚠ Valid LNCh but kept current type';
            idValidationFeedback.className = 'text-warning';
          }

          patientDOB.value = '';
          patientSex.value = '';
        }
      }
    }
    // Case C: Foreign/Invalid
    else if (detectedType === 'foreign') {
      if (previousType === 'foreign') {
        idValidationFeedback.textContent = 'Foreign ID / Passport';
        idValidationFeedback.className = 'text-muted';
      } else {
        const shouldSwitch = confirm('ID does not match EGN/LNCh format.\n\nMark patient as Foreign?');

        if (shouldSwitch) {
          patientIDType.value = 'foreign';
          idValidationFeedback.textContent = 'Marked as Foreign ID';
          idValidationFeedback.className = 'text-info';
        } else {
          idValidationFeedback.textContent = '⚠ Invalid EGN/LNCh format';
          idValidationFeedback.className = 'text-warning';
        }

        patientDOB.value = '';
        patientSex.value = '';
      }
    }
    else {
      idValidationFeedback.textContent = '✗ Invalid ID format';
      idValidationFeedback.className = 'text-danger';
      patientDOB.value = '';
      patientSex.value = '';
    }
  };

  if (patientIDNumber) {
    patientIDNumber.addEventListener('blur', handleIDAutoDetect);
  }

  // --- SAVE APPOINTMENT HANDLER ---
  const handleSaveAppointment = () => {
    console.info('[DEBUG] Save appointment button clicked');

    let patient: Patient | null = null;

    // Check if creating new patient or using existing
    if (newPatientForm && newPatientForm.style.display !== 'none') {
      // Creating new patient
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

      const existingPatient = patientRepository.exists(fullName, fullPhone);
      if (existingPatient) {
        alert('A patient with this name or phone number already exists!');
        return;
      }

      patient = patientRepository.create({
        name: fullName,
        phone: fullPhone,
        appointmentTime: new Date().toISOString(),
        status: 'Confirmed',
        statusIcon: 'calendar',
        actions: ['View', 'Cancel'],
      });

      console.info('[DEBUG] Created new patient:', patient.id);
    } else if (selectedPatient) {
      patient = selectedPatient;
      console.info('[DEBUG] Using existing patient:', patient.id);
    } else {
      alert('Please search for an existing patient or create a new one!');
      return;
    }

    // Get form values
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

    // Validate doctor is available at selected time
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

    // Create appointment
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
    selectedPatient = null;
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

  if (saveAppointmentBtn) {
    saveAppointmentBtn.addEventListener('click', handleSaveAppointment);
  }

  // --- CLEANUP ON MODAL HIDE ---
  modal.addEventListener('hidden.bs.modal', () => {
    console.info('[DEBUG] Modal hidden - cleanup');

    const modalContainer = document.getElementById('appointmentModalContainer');
    if (modalContainer) {
      modalContainer.innerHTML = '';
    }

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }, { once: true });
};
