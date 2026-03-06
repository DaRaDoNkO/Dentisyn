import { defaultSettings } from './types';
import { saveCalendarSettings } from './storage';
import { showConfirmDialog } from '../../../../utils/modalService';
import i18next from '../../../../i18n';
import { captureSnapshot, detectChanges, buildChangesHTML } from './changeTracker';
import { performSave } from './saveHandler';
import { initRejectionReasonsUI } from './rejectionReasonsUI';
import { initAppointmentReasonsUI } from './appointmentReasonsUI';

export { setRefreshCallback } from './saveHandler';
export { checkUnsavedChanges } from './unsavedChanges';

export const initCalendarSettings = () => {
  const form = document.getElementById('calendarSettingsForm') as HTMLFormElement;
  const resetBtn = document.getElementById('resetSettingsBtn') as HTMLButtonElement;
  const settingsAlert = document.getElementById('settingsAlert') as HTMLElement;

  if (!form) {
    console.error('[ERROR] calendarSettingsForm not found');
    return;
  }

  captureSnapshot();
  initRejectionReasonsUI();
  initAppointmentReasonsUI();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const changes = detectChanges();
    if (changes.length === 0) {
      if (settingsAlert) {
        settingsAlert.style.display = 'block';
        setTimeout(() => { settingsAlert.style.display = 'none'; }, 3000);
      }
      return;
    }

    const changesList = document.getElementById('saveConfirmChangesList');
    if (changesList) changesList.innerHTML = buildChangesHTML(changes);

    const modalEl = document.getElementById('saveConfirmModal');
    if (modalEl && window.bootstrap) {
      const modal = new window.bootstrap.Modal(modalEl);
      modal.show();
    }
  });

  const confirmSaveBtn = document.getElementById('confirmSaveBtn');
  confirmSaveBtn?.addEventListener('click', () => {
    performSave(settingsAlert);
    const modalEl = document.getElementById('saveConfirmModal');
    if (modalEl && window.bootstrap) {
      window.bootstrap.Modal.getInstance(modalEl)?.hide();
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      const confirmed = await showConfirmDialog({
        title: i18next.t('settings.resetConfirmTitle', 'Reset to Defaults') as string,
        body: i18next.t('settings.resetConfirmMessage', 'Are you sure you want to reset all settings to default values? This action cannot be undone.') as string,
        variant: 'danger',
        confirmLabel: i18next.t('settings.discard', 'Discard') as string,
        confirmIcon: 'bi-arrow-counterclockwise',
      });

      if (confirmed) {
        saveCalendarSettings(defaultSettings);
        window.location.reload();
        console.info('[DEBUG] Settings reset to defaults');
      }
    });
  }
};
