import { defaultSettings } from './types';
import { saveCalendarSettings } from './storage';
import { showConfirmDialog } from '../../../../utils/modalService';
import i18next from '../../../../i18n';
import {
  captureSnapshot,
  detectChanges,
  hasUnsavedChanges,
  resetSnapshot,
  buildChangesHTML,
  readFormValues,
} from './changeTracker';

// Import the refresh function to apply settings immediately
let refreshCalendarSettings: (() => void) | null = null;

// Allow setting the refresh callback from outside
export const setRefreshCallback = (callback: () => void) => {
  refreshCalendarSettings = callback;
};

/**
 * Initialize Calendar Settings page event handlers
 */
export const initCalendarSettings = () => {
  const form = document.getElementById('calendarSettingsForm') as HTMLFormElement;
  const resetBtn = document.getElementById('resetSettingsBtn') as HTMLButtonElement;
  const settingsAlert = document.getElementById('settingsAlert') as HTMLElement;

  if (!form) {
    console.error('[ERROR] calendarSettingsForm not found');
    return;
  }

  // Capture initial settings snapshot for change detection
  captureSnapshot();

  // ── Rejection Reasons chip management ──
  initRejectionReasonsUI();

  // Handle form submission — show confirmation modal with change list
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const changes = detectChanges();
    if (changes.length === 0) {
      // Nothing changed, just show a brief note
      if (settingsAlert) {
        settingsAlert.style.display = 'block';
        setTimeout(() => { settingsAlert.style.display = 'none'; }, 3000);
      }
      return;
    }

    // Populate save confirmation modal with change details
    const changesList = document.getElementById('saveConfirmChangesList');
    if (changesList) changesList.innerHTML = buildChangesHTML(changes);

    const modalEl = document.getElementById('saveConfirmModal');
    if (modalEl && window.bootstrap) {
      const modal = new window.bootstrap.Modal(modalEl);
      modal.show();
    }
  });

  // Actual save when user confirms in the save-confirmation modal
  const confirmSaveBtn = document.getElementById('confirmSaveBtn');
  confirmSaveBtn?.addEventListener('click', () => {
    performSave(settingsAlert);

    const modalEl = document.getElementById('saveConfirmModal');
    if (modalEl && window.bootstrap) {
      window.bootstrap.Modal.getInstance(modalEl)?.hide();
    }
  });

  // Handle reset to defaults
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
        
        // Reload the page to show default values
        window.location.reload();
        
        console.info('[DEBUG] Settings reset to defaults');
      }
    });
  }
};

/**
 * Perform the actual save of settings to localStorage
 */
function performSave(settingsAlert: HTMLElement | null): void {
  console.info('[DEBUG] Saving calendar settings...');

  const settings = readFormValues();
  if (!settings) return;

  // Save to localStorage
  saveCalendarSettings(settings);

  // Reset the snapshot so form appears "clean"
  resetSnapshot();

  // Apply settings immediately to calendar if available
  if (refreshCalendarSettings) {
    try {
      refreshCalendarSettings();
      console.info('[DEBUG] Calendar settings applied immediately');
    } catch (error) {
      console.error('[ERROR] Failed to refresh calendar settings:', error);
    }
  }

  // Show success alert
  if (settingsAlert) {
    settingsAlert.style.display = 'block';
    setTimeout(() => { settingsAlert.style.display = 'none'; }, 5000);
  }

  console.info(`[AUDIT] SETTINGS_SAVED | Time: ${new Date().toISOString()}`);
}

/**
 * Check for unsaved changes and show a confirmation modal.
 * Returns a Promise that resolves to:
 * - 'save'    → user chose "Save & Leave"
 * - 'discard' → user chose "Discard & Leave"
 * - 'stay'    → user chose "Stay" or dismissed the modal
 */
export const checkUnsavedChanges = (): Promise<'save' | 'discard' | 'stay'> => {
  if (!hasUnsavedChanges()) return Promise.resolve('discard');

  return new Promise((resolve) => {
    const changes = detectChanges();
    const changesList = document.getElementById('unsavedChangesList');
    if (changesList) changesList.innerHTML = buildChangesHTML(changes);

    const modalEl = document.getElementById('unsavedChangesModal');
    if (!modalEl || !window.bootstrap) {
      resolve('discard');
      return;
    }

    const modal = new window.bootstrap.Modal(modalEl);

    const cleanup = () => {
      saveBtn?.removeEventListener('click', onSave);
      discardBtn?.removeEventListener('click', onDiscard);
      stayBtn?.removeEventListener('click', onStay);
      modalEl.removeEventListener('hidden.bs.modal', onHidden);
    };

    let resolved = false;

    const onSave = () => {
      resolved = true;
      // Perform the actual save
      const alert = document.getElementById('settingsAlert') as HTMLElement;
      performSave(alert);
      modal.hide();
      cleanup();
      resolve('save');
    };
    const onDiscard = () => {
      resolved = true;
      modal.hide();
      cleanup();
      resolve('discard');
    };
    const onStay = () => {
      resolved = true;
      modal.hide();
      cleanup();
      resolve('stay');
    };
    const onHidden = () => {
      cleanup();
      if (!resolved) resolve('stay');
    };

    const saveBtn = document.getElementById('unsavedSaveBtn');
    const discardBtn = document.getElementById('unsavedDiscardBtn');
    const stayBtn = document.getElementById('unsavedStayBtn');

    saveBtn?.addEventListener('click', onSave);
    discardBtn?.addEventListener('click', onDiscard);
    stayBtn?.addEventListener('click', onStay);
    modalEl.addEventListener('hidden.bs.modal', onHidden);

    modal.show();
  });
};

/**
 * Wire up rejection reason chip add/remove interactions
 */
function initRejectionReasonsUI(): void {
  const container = document.getElementById('rejectionReasonsChips');
  const addBtn = document.getElementById('addRejectionReasonBtn');
  const input = document.getElementById('newRejectionReasonInput') as HTMLInputElement;
  const dataInput = document.getElementById('rejectionReasonsData') as HTMLInputElement;

  if (!container || !addBtn || !input || !dataInput) return;

  const getReasons = (): string[] => JSON.parse(dataInput.value || '[]');
  const setReasons = (reasons: string[]) => {
    dataInput.value = JSON.stringify(reasons);
  };

  const renderChips = (reasons: string[]) => {
    container.innerHTML = reasons.map((reason, i) => `
      <span class="badge bg-light text-dark border d-inline-flex align-items-center gap-1 px-3 py-2 rejection-chip"
        style="font-size:0.85rem;cursor:pointer;" data-index="${i}">
        ${reason}
        <i class="bi bi-x-circle ms-1 text-danger"></i>
      </span>
    `).join('');
    wireChipRemove();
  };

  const wireChipRemove = () => {
    container.querySelectorAll('.rejection-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const idx = parseInt((chip as HTMLElement).dataset.index || '0', 10);
        const reasons = getReasons();
        reasons.splice(idx, 1);
        setReasons(reasons);
        renderChips(reasons);
      });
    });
  };

  // Wire initial chips
  wireChipRemove();

  // Add new reason
  const addReason = () => {
    const val = input.value.trim();
    if (!val) return;
    const reasons = getReasons();
    if (reasons.includes(val)) return; // no duplicates
    reasons.push(val);
    setReasons(reasons);
    renderChips(reasons);
    input.value = '';
  };

  addBtn.addEventListener('click', addReason);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addReason();
    }
  });
}
