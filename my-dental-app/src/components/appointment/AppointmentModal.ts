import { patientRepository } from '../../repositories/patientRepository';
import { appointmentRepository } from '../../repositories/appointmentRepository';
import type { Patient, Doctor } from '../../types/patient';

let selectedPatient: Patient | null = null;

/**
 * Render the appointment creation modal HTML
 */
export const renderAppointmentModal = (clickedDateISO: string): string => {
  const clickedDate = new Date(clickedDateISO);
  const defaultEndTime = new Date(clickedDate.getTime() + 30 * 60000); // 30 min duration

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
              <!-- Patient Search/Selection -->
              <div class="mb-3">
                <label for="patientSearch" class="form-label" data-i18n="appointment.patientSearch">Search Patient</label>
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control"
                    id="patientSearch"
                    placeholder="Enter name or phone..."
                    autocomplete="off"
                  >
                  <button class="btn btn-outline-secondary" type="button" id="createNewPatientBtn" data-i18n="appointment.newPatient">New Patient</button>
                </div>
                <small class="text-muted d-block mt-2" data-i18n="appointment.patientSearchHint">Type to search existing patients or click "New Patient"</small>
                
                <!-- Patient Search Results -->
                <div id="patientSearchResults" class="list-group mt-2" style="display: none;"></div>
              </div>

              <!-- Selected Patient Display -->
              <div id="selectedPatientInfo" class="alert alert-info" style="display: none;">
                <strong id="selectedPatientName"></strong><br>
                <small id="selectedPatientPhone"></small>
              </div>

              <!-- Patient Details (for new patient) -->
              <div id="newPatientForm" style="display: none;">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="newPatientName" class="form-label" data-i18n="appointment.fullName">Full Name</label>
                    <input type="text" class="form-control" id="newPatientName">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="newPatientPhone" class="form-label" data-i18n="appointment.phoneNumber">Phone Number</label>
                    <input type="tel" class="form-control" id="newPatientPhone">
                  </div>
                </div>
              </div>

              <!-- Doctor Selection -->
              <div class="mb-3">
                <label for="doctorSelect" class="form-label" data-i18n="appointment.assignDoctor">Assign Doctor</label>
                <select class="form-select" id="doctorSelect" required>
                  <option value="" disabled selected data-i18n="appointment.selectDoctor">Select a doctor...</option>
                  <option value="dr-ivanov">Dr. Ivanov</option>
                  <option value="dr-ruseva">Dr. Ruseva</option>
                </select>
              </div>

              <!-- Date & Time -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="appointmentDate" class="form-label" data-i18n="appointment.date">Date</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="appointmentDate" 
                    value="${clickedDate.toISOString().split('T')[0]}"
                    required
                  >
                </div>
                <div class="col-md-3 mb-3">
                  <label for="appointmentStartTime" class="form-label" data-i18n="appointment.startTime">Start Time</label>
                  <input 
                    type="time" 
                    class="form-control" 
                    id="appointmentStartTime" 
                    value="${String(clickedDate.getHours()).padStart(2, '0')}:${String(clickedDate.getMinutes()).padStart(2, '0')}"
                    required
                  >
                </div>
                <div class="col-md-3 mb-3">
                  <label for="appointmentEndTime" class="form-label" data-i18n="appointment.endTime">End Time</label>
                  <input 
                    type="time" 
                    class="form-control" 
                    id="appointmentEndTime" 
                    value="${String(defaultEndTime.getHours()).padStart(2, '0')}:${String(defaultEndTime.getMinutes()).padStart(2, '0')}"
                    required
                  >
                </div>
              </div>

              <!-- Reason/Notes -->
              <div class="mb-3">
                <label for="appointmentReason" class="form-label" data-i18n="appointment.reasonNotes">Reason / Notes</label>
                <textarea 
                  class="form-control" 
                  id="appointmentReason" 
                  rows="3" 
                  placeholder="e.g., Regular checkup, Cleaning, Root canal..."
                  required
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-i18n="appointment.cancel">Cancel</button>
            <button type="button" class="btn btn-primary" id="saveAppointmentBtn" data-i18n="appointment.save">Save Appointment</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Initialize appointment modal event handlers
 */
export const initAppointmentModal = (onSaveCallback?: () => void) => {
  const modal = document.getElementById('appointmentModal') as HTMLElement | null;
  if (!modal) {
    console.error('[ERROR] appointmentModal element not found in initAppointmentModal');
    return;
  }

  const patientSearch = document.getElementById('patientSearch') as HTMLInputElement;
  const patientSearchResults = document.getElementById('patientSearchResults') as HTMLElement;
  const selectedPatientInfo = document.getElementById('selectedPatientInfo') as HTMLElement;
  const selectedPatientName = document.getElementById('selectedPatientName') as HTMLElement;
  const selectedPatientPhone = document.getElementById('selectedPatientPhone') as HTMLElement;
  const newPatientForm = document.getElementById('newPatientForm') as HTMLElement;
  const newPatientBtn = document.getElementById('createNewPatientBtn') as HTMLButtonElement;
  const saveAppointmentBtn = document.getElementById('saveAppointmentBtn') as HTMLButtonElement;
  
  console.info('[DEBUG] AppointmentModal initialized, elements found:', {
    modal: !!modal,
    patientSearch: !!patientSearch,
    newPatientBtn: !!newPatientBtn,
    saveAppointmentBtn: !!saveAppointmentBtn
  });

  // Patient Search Handler
  const handleSearchInput = (e: Event) => {
    const query = (e.target as HTMLInputElement).value.trim();

    if (query.length < 2) {
      patientSearchResults.style.display = 'none';
      return;
    }

    const results = patientRepository.search(query);

    if (results.length === 0) {
      patientSearchResults.innerHTML = `<div class="list-group-item text-muted">No patients found</div>`;
    } else {
      patientSearchResults.innerHTML = results
        .map(
          (patient) => `
        <button 
          type="button" 
          class="list-group-item list-group-item-action patient-result" 
          data-patient-id="${patient.id}"
          data-patient-name="${patient.name}"
          data-patient-phone="${patient.phone}"
        >
          <strong>${patient.name}</strong><br>
          <small class="text-muted">${patient.phone}</small>
        </button>
      `
        )
        .join('');

      // Attach click handlers to results
      const resultButtons = patientSearchResults.querySelectorAll('.patient-result');
      resultButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const button = e.currentTarget as HTMLElement;
          const patientId = button.dataset.patientId;
          const patientName = button.dataset.patientName || '';
          const patientPhone = button.dataset.patientPhone || '';

          selectedPatient = patientRepository.getById(patientId!) || null;

          if (selectedPatient) {
            patientSearch.value = '';
            patientSearchResults.style.display = 'none';
            selectedPatientInfo.style.display = 'block';
            newPatientForm.style.display = 'none';

            selectedPatientName.textContent = patientName;
            selectedPatientPhone.textContent = `Phone: ${patientPhone}`;
          }
        });
      });
    }

    patientSearchResults.style.display = 'block';
  };

  if (patientSearch) {
    patientSearch.addEventListener('input', handleSearchInput);
  }

  // New Patient Button Handler
  const handleNewPatient = () => {
    if (patientSearch) patientSearch.value = '';
    if (patientSearchResults) patientSearchResults.style.display = 'none';
    if (selectedPatientInfo) selectedPatientInfo.style.display = 'none';
    if (newPatientForm) newPatientForm.style.display = 'block';
    selectedPatient = null;
  };
  
  if (newPatientBtn) {
    newPatientBtn.addEventListener('click', handleNewPatient);
  }

  // Save Appointment Handler
  const handleSaveAppointment = () => {
    console.info('[DEBUG] Save appointment button clicked');
    
    const form = document.getElementById('appointmentForm') as HTMLFormElement;
    
    if (!form) {
      console.error('[ERROR] appointmentForm not found');
      alert('Form not found. Please refresh the page and try again.');
      return;
    }

    // Get or create patient
    let patient: Patient | null = null;

    if (newPatientForm && newPatientForm.style.display !== 'none') {
      // Creating new patient
      const nameEl = document.getElementById('newPatientName') as HTMLInputElement;
      const phoneEl = document.getElementById('newPatientPhone') as HTMLInputElement;
      
      if (!nameEl || !phoneEl) {
        alert('Patient form fields not found');
        return;
      }
      
      const name = nameEl.value.trim();
      const phone = phoneEl.value.trim();
      
      if (!name || !phone) {
        alert('Please enter patient name and phone number');
        return;
      }

      const existingPatient = patientRepository.exists(name, phone);
      if (existingPatient) {
        alert('A patient with this name or phone number already exists!');
        return;
      }

      patient = patientRepository.create({
        name,
        phone,
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
      alert('Please select an existing patient or create a new one!');
      return;
    }

    // Get form values
    const doctorEl = document.getElementById('doctorSelect') as HTMLSelectElement;
    const dateEl = document.getElementById('appointmentDate') as HTMLInputElement;
    const startTimeEl = document.getElementById('appointmentStartTime') as HTMLInputElement;
    const endTimeEl = document.getElementById('appointmentEndTime') as HTMLInputElement;
    const reasonEl = document.getElementById('appointmentReason') as HTMLTextAreaElement;
    
    if (!doctorEl || !dateEl || !startTimeEl || !endTimeEl || !reasonEl) {
      alert('Some form fields are missing. Please refresh the page.');
      return;
    }
    
    const doctor = doctorEl.value as Doctor;
    const date = dateEl.value;
    const startTime = startTimeEl.value;
    const endTime = endTimeEl.value;
    const reason = reasonEl.value.trim();
    
    if (!doctor || !date || !startTime || !endTime || !reason) {
      alert('Please fill in all required fields');
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

    // Reset form and state
    form.reset();
    selectedPatient = null;
    if (newPatientForm) newPatientForm.style.display = 'none';
    if (selectedPatientInfo) selectedPatientInfo.style.display = 'none';
    if (patientSearchResults) patientSearchResults.style.display = 'none';

    // Close the modal
    const bsModal = (window as any).bootstrap?.Modal?.getInstance(modal);
    if (bsModal) {
      console.info('[DEBUG] Closing modal');
      bsModal.hide();
    } else {
      console.error('[ERROR] Could not get Bootstrap modal instance');
      alert('Modal close failed. Refresh the page.');
    }
    
    // Call the callback to refresh calendar
    if (onSaveCallback) {
      console.info('[DEBUG] Calling calendar refresh callback');
      onSaveCallback();
    }
  };

  if (saveAppointmentBtn) {
    console.info('[DEBUG] Attaching save handler to button');
    saveAppointmentBtn.addEventListener('click', handleSaveAppointment);
  } else {
    console.error('[ERROR] saveAppointmentBtn not found - cannot attach event handler');
  }

  // Cleanup function to remove event listeners when modal is hidden
  modal.addEventListener('hidden.bs.modal', () => {
    console.info('[DEBUG] Modal hidden - starting cleanup');
    
    if (patientSearch && handleSearchInput) {
      patientSearch.removeEventListener('input', handleSearchInput);
    }
    if (newPatientBtn && handleNewPatient) {
      newPatientBtn.removeEventListener('click', handleNewPatient);
    }
    if (saveAppointmentBtn && handleSaveAppointment) {
      saveAppointmentBtn.removeEventListener('click', handleSaveAppointment);
    }
    
    // Clean up modal from DOM
    const modalContainer = document.getElementById('appointmentModalContainer');
    if (modalContainer) {
      modalContainer.innerHTML = '';
      console.info('[DEBUG] Modal container cleared');
    }
    
    // Remove any lingering backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      backdrop.remove();
      console.info('[DEBUG] Removed backdrop');
    });
    
    // Ensure body classes are cleared
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    console.info('[DEBUG] Modal cleanup complete');
  }, { once: true });
};
