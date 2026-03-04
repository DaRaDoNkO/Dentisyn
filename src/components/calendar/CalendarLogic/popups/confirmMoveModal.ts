import { getThemeColors, getOverlayCSS } from '../../../../utils/popupStyles';
import i18next from '../../../../i18n';

const t = (key: string, fallback: string, opts?: Record<string, unknown>): string =>
  i18next.t(key, { defaultValue: fallback, ...opts }) as string;

/**
 * Show a confirmation modal for moving an appointment
 */
export const showMoveConfirmationModal = (onConfirm: () => void, onReject: () => void, titleText?: string) => {
  // Remove any existing confirmation modals
  const existingModal = document.getElementById('move-confirmation-modal');
  if (existingModal) existingModal.remove();

  const colors = getThemeColors();

  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'move-confirmation-modal';
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${colors.isDark ? '#1e293b' : '#ffffff'};
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,${colors.isDark ? '0.5' : '0.18'});
    padding: 28px;
    z-index: 10001;
    min-width: 220px;
    text-align: center;
    border: 1px solid ${colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  `;

  // Create buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 10px;
  `;

  // Approve Button (Green)
  const approveBtn = document.createElement('button');
  approveBtn.innerHTML = '<i class="bi bi-check-lg"></i>';
  approveBtn.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: #198754;
    color: white;
    font-size: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background 0.2s;
    box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
  `;
  approveBtn.onmouseover = () => { approveBtn.style.transform = 'scale(1.1)'; };
  approveBtn.onmouseout = () => { approveBtn.style.transform = 'scale(1)'; };

  // Reject Button (Red)
  const rejectBtn = document.createElement('button');
  rejectBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
  rejectBtn.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: #dc3545;
    color: white;
    font-size: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background 0.2s;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  `;
  rejectBtn.onmouseover = () => { rejectBtn.style.transform = 'scale(1.1)'; };
  rejectBtn.onmouseout = () => { rejectBtn.style.transform = 'scale(1)'; };

  // Add click handlers
  approveBtn.onclick = () => {
    onConfirm();
    cleanup();
  };

  rejectBtn.onclick = () => {
    onReject();
    cleanup();
  };

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'move-confirmation-overlay';
  overlay.style.cssText = getOverlayCSS(10000);

  // Assemble
  buttonsContainer.appendChild(approveBtn);
  buttonsContainer.appendChild(rejectBtn);

  const title = document.createElement('h5');
  title.innerText = titleText || t('calendar.confirmMove', 'Confirm Move?');
  title.style.marginBottom = '20px';
  title.style.color = colors.isDark ? '#e2e8f0' : '#333';

  modal.appendChild(title);
  modal.appendChild(buttonsContainer);

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Cleanup function
  const cleanup = () => {
    modal.remove();
    overlay.remove();
  };

  // Close on overlay click (treat as reject)
  overlay.onclick = () => {
    onReject();
    cleanup();
  };
};
