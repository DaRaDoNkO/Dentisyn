import { hasUnsavedChanges, detectChanges, buildChangesHTML } from './changeTracker';
import { performSave } from './saveHandler';

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

    let resolved = false;

    const cleanup = () => {
      saveBtn?.removeEventListener('click', onSave);
      discardBtn?.removeEventListener('click', onDiscard);
      stayBtn?.removeEventListener('click', onStay);
      modalEl.removeEventListener('hidden.bs.modal', onHidden);
    };

    const onSave = () => {
      resolved = true;
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
