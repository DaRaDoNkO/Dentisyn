/**
 * ID auto-detection and validation for appointment modal
 */

import i18next from '../../i18n';
import { validateEGN, validateLNCh, detectIDType } from '../../utils/bgUtils';
import { toInputDate } from '../../utils/dateUtils';
import { showIdDetectionDialog } from './idDetectionDialog';

const t = (key: string, fallback: string): string => i18next.t(key, fallback) as string;

export function setupIDAutoDetection(): void {
  const patientIDNumber  = document.getElementById('patientIDNumber')  as HTMLInputElement;
  const patientIDType    = document.getElementById('patientIDType')    as HTMLSelectElement;
  const patientDOB       = document.getElementById('patientDOB')       as HTMLInputElement;
  const patientSex       = document.getElementById('patientSex')       as HTMLSelectElement;
  const idValidationFeedback = document.getElementById('idValidationFeedback') as HTMLElement;

  if (!patientIDNumber || !patientIDType || !patientDOB || !patientSex || !idValidationFeedback) return;

  const setFeedback = (msg: string, cls: string) => {
    idValidationFeedback.textContent = msg;
    idValidationFeedback.className = cls;
  };

  const clearAutoFill = () => { patientDOB.value = ''; patientSex.value = ''; };

  const handleIDAutoDetect = () => {
    const idValue = patientIDNumber.value.trim();
    if (!idValue) { setFeedback('', 'text-muted'); return; }

    const previousType = patientIDType.value;
    const detectedType = detectIDType(idValue);
    console.info('[DEBUG] ID Auto-Detect:', { idValue, previousType, detectedType });

    if (detectedType === 'egn') {
      const result = validateEGN(idValue);
      if (result.valid && result.dob && result.sex) {
        patientIDType.value = 'EGN';
        patientDOB.value = toInputDate(result.dob);
        patientSex.value = result.sex;
        setFeedback(`✓ ${t('appointment.egnValidSuccess', 'Valid EGN — Date of birth and sex auto-filled')}`, 'text-success');
      }
    } else if (detectedType === 'lnch') {
      const result = validateLNCh(idValue);
      if (result.valid) {
        if (previousType === 'LNCh') {
          setFeedback(`✓ ${t('appointment.lnchValidSuccess', 'Valid LNCh number')}`, 'text-success');
        } else {
          showIdDetectionDialog({
            title: t('appointment.lnchDetectedTitle', 'LNCh Format Detected'),
            body: t('appointment.lnchDetectedBody', 'The entered ID matches the LNCh format. Switch type to LNCh?'),
            confirmLabel: t('appointment.lnchDetectedAccept', 'Switch to LNCh'),
            cancelLabel: t('appointment.lnchDetectedCancel', 'Keep Current Type'),
            variant: 'info',
            onConfirm: () => { patientIDType.value = 'LNCh'; setFeedback(`✓ ${t('appointment.lnchValidSuccess', 'Valid LNCh number')}`, 'text-success'); },
            onCancel: () => { setFeedback(`⚠ ${t('appointment.lnchValidSuccess', 'Valid LNCh — kept current type')}`, 'text-warning'); },
          });
          clearAutoFill();
        }
      }
    } else if (detectedType === 'foreign' && /^\d{10}$/.test(idValue)) {
      showIdDetectionDialog({
        title: t('appointment.ssnDetectedTitle', 'Not a Valid EGN or LNCh'),
        body: t('appointment.ssnDetectedBody', 'The number does not match EGN/LNCh checksums. Treat as SSN?'),
        confirmLabel: t('appointment.ssnDetectedAccept', 'Treat as SSN'),
        cancelLabel: t('appointment.ssnDetectedCancel', 'Keep Current Type'),
        variant: 'warning',
        onConfirm: () => { patientIDType.value = 'SSN'; setFeedback('ℹ SSN', 'text-info'); console.info('[AUDIT] ID treated as SSN | Value:', idValue); },
        onCancel: () => { setFeedback('⚠ Unrecognized format', 'text-warning'); },
      });
      clearAutoFill();
    } else if (detectedType === 'foreign') {
      if (previousType !== 'EU') patientIDType.value = 'EU';
      setFeedback('EU / Foreign ID / Passport', 'text-muted');
      clearAutoFill();
    } else {
      setFeedback('✗ Invalid ID format', 'text-danger');
      clearAutoFill();
    }
  };

  patientIDNumber.addEventListener('blur', handleIDAutoDetect);
}
