import { linkPatientToFamily } from '../utils/familyDetection';

export const setupFamilyLinkHandlers = (): void => {
  document.querySelectorAll('.family-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const patientId = (btn as HTMLElement).dataset.patientId ?? '';
      linkPatientToFamily(patientId);
      btn.classList.remove('btn-outline-primary');
      btn.classList.add('btn-success', 'disabled');
      btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Linked';
    });
  });
};
