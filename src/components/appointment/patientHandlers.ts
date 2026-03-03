/**
 * Patient-related handlers for appointment modal
 * Handles typeahead search, patient selection, and ID validation
 */

import i18next from '../../i18n';
import { patientRepository } from '../../repositories/patientRepository';
import type { Patient } from '../../types/patient';
import { validateEGN, validateLNCh, detectIDType } from '../../utils/bgUtils';
import { toInputDate } from '../../utils/dateUtils';

const t = (key: string, fallback: string): string =>
  i18next.t(key, fallback) as string;

/**
 * Show a modern, animated confirmation dialog for ID type detection.
 * Replaces native browser confirm() with a styled i18n-aware overlay.
 */
function showIdDetectionDialog(opts: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}): void {
  document.getElementById('__idDetectOverlay')?.remove();

  const accentColor = opts.variant === 'warning' ? '#f59e0b' : '#3b82f6';
  const iconSvg =
    opts.variant === 'warning'
      ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
      : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  const overlay = document.createElement('div');
  overlay.id = '__idDetectOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(15,23,42,0.55)',
    zIndex: '10500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
    opacity: '0',
    transition: 'opacity .18s ease',
  });

  overlay.innerHTML = `
    <div id="__idDetectDialog" style="
      background:#ffffff;
      border-radius:16px;
      padding:1.75rem 2rem;
      max-width:440px;
      width:92%;
      box-shadow:0 24px 64px rgba(15,23,42,0.28);
      transform:scale(.96) translateY(8px);
      transition:transform .2s ease, opacity .2s ease;
      opacity:0;
    ">
      <div style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:1.4rem;">
        <div style="
          width:48px;height:48px;min-width:48px;
          border-radius:12px;
          background:${accentColor}18;
          display:flex;align-items:center;justify-content:center;
        ">${iconSvg}</div>
        <div style="flex:1">
          <p style="margin:0 0 .15rem;font-size:1rem;font-weight:700;color:#0f172a;line-height:1.3;">${opts.title}</p>
          <p style="margin:0;color:#64748b;font-size:.875rem;line-height:1.55;">${opts.body}</p>
        </div>
      </div>
      <div style="display:flex;gap:.625rem;justify-content:flex-end;">
        <button id="__idDetectCancel" style="
          padding:.5rem 1.1rem;
          border-radius:8px;
          border:1.5px solid #e2e8f0;
          background:#f8fafc;
          color:#374151;
          cursor:pointer;
          font-size:.85rem;
          font-weight:500;
          transition:background .12s;
        ">${opts.cancelLabel}</button>
        <button id="__idDetectConfirm" style="
          padding:.5rem 1.35rem;
          border-radius:8px;
          border:none;
          background:${accentColor};
          color:#fff;
          cursor:pointer;
          font-size:.85rem;
          font-weight:600;
          box-shadow:0 2px 10px ${accentColor}55;
          transition:filter .12s;
        ">${opts.confirmLabel}</button>
      </div>
    </div>
  `;

  const close = (cb: () => void) => {
    overlay.style.opacity = '0';
    const dialog = overlay.querySelector<HTMLElement>('#__idDetectDialog');
    if (dialog) {
      dialog.style.transform = 'scale(.96) translateY(8px)';
      dialog.style.opacity = '0';
    }
    setTimeout(() => { overlay.remove(); cb(); }, 180);
  };

  overlay.querySelector('#__idDetectConfirm')!.addEventListener('click', () => close(opts.onConfirm));
  overlay.querySelector('#__idDetectCancel')!.addEventListener('click', () => close(opts.onCancel));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(opts.onCancel); });

  document.body.appendChild(overlay);

  // Trigger enter animation on next frame
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    const dialog = overlay.querySelector<HTMLElement>('#__idDetectDialog');
    if (dialog) {
      dialog.style.transform = 'scale(1) translateY(0)';
      dialog.style.opacity = '1';
    }
  });
}

/**
 * Setup patient typeahead search functionality
 * @param patientNameSearch - Input element for patient search
 * @param typeaheadDropdown - Dropdown element for search results
 * @param selectedPatientInfo - Element to display selected patient info
 * @param selectedPatientName - Element to display patient name
 * @param selectedPatientDetails - Element to display patient details
 * @param newPatientForm - Form element for new patient
 * @param selectedPatientRef - Reference object to store selected patient
 */
export function setupPatientTypeahead(
  patientNameSearch: HTMLInputElement,
  typeaheadDropdown: HTMLElement,
  selectedPatientInfo: HTMLElement,
  selectedPatientName: HTMLElement,
  selectedPatientDetails: HTMLElement,
  newPatientForm: HTMLElement,
  selectedPatientRef: { current: Patient | null }
) {
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
        selectExistingPatient(
          patientId!,
          patientNameSearch,
          typeaheadDropdown,
          selectedPatientInfo,
          selectedPatientName,
          selectedPatientDetails,
          newPatientForm,
          selectedPatientRef
        );
      });
    });

    const createNewBtn = typeaheadDropdown.querySelector('.create-new-patient-item');
    if (createNewBtn) {
      createNewBtn.addEventListener('click', (e) => {
        const button = e.currentTarget as HTMLElement;
        const nameToCreate = button.dataset.createName || '';
        switchToEditMode(
          nameToCreate,
          patientNameSearch,
          typeaheadDropdown,
          selectedPatientInfo,
          newPatientForm,
          selectedPatientRef
        );
      });
    }
  };

  patientNameSearch.addEventListener('input', handleTypeahead);

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!patientNameSearch.contains(e.target as Node) && !typeaheadDropdown.contains(e.target as Node)) {
      typeaheadDropdown.style.display = 'none';
    }
  });
}

/**
 * Select an existing patient
 */
function selectExistingPatient(
  patientId: string,
  patientNameSearch: HTMLInputElement,
  typeaheadDropdown: HTMLElement,
  selectedPatientInfo: HTMLElement,
  selectedPatientName: HTMLElement,
  selectedPatientDetails: HTMLElement,
  newPatientForm: HTMLElement,
  selectedPatientRef: { current: Patient | null }
) {
  selectedPatientRef.current = patientRepository.getById(patientId);

  if (selectedPatientRef.current) {
    patientNameSearch.value = '';
    typeaheadDropdown.style.display = 'none';
    selectedPatientInfo.style.display = 'flex';
    newPatientForm.style.display = 'none';

    selectedPatientName.textContent = selectedPatientRef.current.name;
    selectedPatientDetails.textContent = `Phone: ${selectedPatientRef.current.phone}`;

    console.info('[DEBUG] Selected existing patient:', selectedPatientRef.current.id);
  }
}

/**
 * Switch to edit mode (create new patient)
 */
function switchToEditMode(
  nameToSplit: string,
  patientNameSearch: HTMLInputElement,
  typeaheadDropdown: HTMLElement,
  selectedPatientInfo: HTMLElement,
  newPatientForm: HTMLElement,
  selectedPatientRef: { current: Patient | null }
) {
  patientNameSearch.value = '';
  typeaheadDropdown.style.display = 'none';
  selectedPatientInfo.style.display = 'none';
  newPatientForm.style.display = 'block';
  selectedPatientRef.current = null;

  // Split name by space and auto-fill First/Last Name
  const firstNameInput = document.getElementById('patientFirstName') as HTMLInputElement;
  const lastNameInput = document.getElementById('patientLastName') as HTMLInputElement;

  if (firstNameInput && lastNameInput && nameToSplit) {
    const parts = nameToSplit.trim().split(/\s+/);
    firstNameInput.value = parts[0] || '';
    lastNameInput.value = parts.slice(1).join(' ') || '';
    console.info('[DEBUG] Auto-filled name from query:', { first: parts[0], last: parts.slice(1).join(' ') });
  }
}

/**
 * Setup change patient button
 */
export function setupChangePatientButton(
  changePatientBtn: HTMLButtonElement,
  selectedPatientInfo: HTMLElement,
  patientNameSearch: HTMLInputElement,
  selectedPatientRef: { current: Patient | null }
) {
  changePatientBtn.addEventListener('click', () => {
    selectedPatientInfo.style.display = 'none';
    selectedPatientRef.current = null;
    patientNameSearch.value = '';
    patientNameSearch.focus();
    console.info('[DEBUG] User clicked Change Patient');
  });
}

/**
 * Setup phone number validation
 */
export function setupPhoneValidation() {
  const phoneNumberInput = document.getElementById('patientPhoneNumber') as HTMLInputElement;

  if (phoneNumberInput) {
    phoneNumberInput.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      // Replace non-digits with empty string
      input.value = input.value.replace(/\D/g, '');
    });
  }
}

/**
 * Setup ID auto-detection and validation
 */
export function setupIDAutoDetection() {
  const patientIDNumber = document.getElementById('patientIDNumber') as HTMLInputElement;
  const patientIDType = document.getElementById('patientIDType') as HTMLSelectElement;
  const patientDOB = document.getElementById('patientDOB') as HTMLInputElement;
  const patientSex = document.getElementById('patientSex') as HTMLSelectElement;
  const idValidationFeedback = document.getElementById('idValidationFeedback') as HTMLElement;

  if (!patientIDNumber || !patientIDType || !patientDOB || !patientSex || !idValidationFeedback) {
    return;
  }

  const setFeedback = (msg: string, cls: string) => {
    idValidationFeedback.textContent = msg;
    idValidationFeedback.className = cls;
  };

  const handleIDAutoDetect = () => {
    const idValue = patientIDNumber.value.trim();

    if (!idValue) {
      setFeedback('', 'text-muted');
      return;
    }

    const previousType = patientIDType.value;
    const detectedType = detectIDType(idValue);

    console.info('[DEBUG] ID Auto-Detect:', { idValue, previousType, detectedType });

    // ── Case A: Valid EGN ──────────────────────────────────────────────────────
    if (detectedType === 'egn') {
      const egnResult = validateEGN(idValue);

      if (egnResult.valid && egnResult.dob && egnResult.sex) {
        patientIDType.value = 'EGN';

        patientDOB.value = toInputDate(egnResult.dob);
        patientSex.value = egnResult.sex;

        setFeedback(
          `✓ ${t('appointment.egnValidSuccess', 'Valid EGN — Date of birth and sex auto-filled')}`,
          'text-success'
        );
        console.info('[DEBUG] EGN validated and auto-filled');
      }
    }

    // ── Case B: Valid LNCh ─────────────────────────────────────────────────────
    else if (detectedType === 'lnch') {
      const lnchResult = validateLNCh(idValue);

      if (lnchResult.valid) {
        if (previousType === 'LNCh') {
          setFeedback(
            `✓ ${t('appointment.lnchValidSuccess', 'Valid LNCh number')}`,
            'text-success'
          );
        } else {
          showIdDetectionDialog({
            title: t('appointment.lnchDetectedTitle', 'LNCh Format Detected'),
            body: t(
              'appointment.lnchDetectedBody',
              'The entered ID matches the LNCh (Resident ID) format. Would you like to switch the type to LNCh?'
            ),
            confirmLabel: t('appointment.lnchDetectedAccept', 'Switch to LNCh'),
            cancelLabel: t('appointment.lnchDetectedCancel', 'Keep Current Type'),
            variant: 'info',
            onConfirm: () => {
              patientIDType.value = 'LNCh';
              setFeedback(
                `✓ ${t('appointment.lnchValidSuccess', 'Valid LNCh number')}`,
                'text-success'
              );
            },
            onCancel: () => {
              setFeedback(
                `⚠ ${t('appointment.lnchValidSuccess', 'Valid LNCh — kept current type')}`,
                'text-warning'
              );
            },
          });

          patientDOB.value = '';
          patientSex.value = '';
        }
      }
    }

    // ── Case C: 10-digit but invalid EGN/LNCh checksums → treat as SSN ────────
    else if (detectedType === 'foreign' && /^\d{10}$/.test(idValue)) {
      showIdDetectionDialog({
        title: t('appointment.ssnDetectedTitle', 'Not a Valid EGN or LNCh'),
        body: t(
          'appointment.ssnDetectedBody',
          'The entered number does not match the EGN or LNCh checksum rules. It will be treated as an SSN (Social Security Number).'
        ),
        confirmLabel: t('appointment.ssnDetectedAccept', 'Treat as SSN'),
        cancelLabel: t('appointment.ssnDetectedCancel', 'Keep Current Type'),
        variant: 'warning',
        onConfirm: () => {
          patientIDType.value = 'SSN';
          setFeedback('ℹ SSN', 'text-info');
          console.info('[AUDIT] ID treated as SSN | Value:', idValue);
        },
        onCancel: () => {
          setFeedback('⚠ Unrecognized format', 'text-warning');
        },
      });

      patientDOB.value = '';
      patientSex.value = '';
    }

    // ── Case D: Foreign / Passport (non-digit or length ≠ 10) → EU slot ────────
    else if (detectedType === 'foreign') {
      if (previousType !== 'EU') {
        patientIDType.value = 'EU';
      }
      setFeedback('EU / Foreign ID / Passport', 'text-muted');
      patientDOB.value = '';
      patientSex.value = '';
    }

    // ── Case E: Truly invalid (empty / wrong pattern) ──────────────────────────
    else {
      setFeedback('✗ Invalid ID format', 'text-danger');
      patientDOB.value = '';
      patientSex.value = '';
    }
  };

  patientIDNumber.addEventListener('blur', handleIDAutoDetect);
}
