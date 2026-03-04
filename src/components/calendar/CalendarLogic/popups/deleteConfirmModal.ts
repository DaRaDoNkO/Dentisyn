import { getThemeColors, getOverlayCSS } from '../../../../utils/popupStyles';
import i18next from '../../../../i18n';

const t = (key: string, fallback: string, opts?: Record<string, unknown>): string =>
  i18next.t(key, { defaultValue: fallback, ...opts }) as string;

/**
 * Show a styled delete confirmation modal (replaces browser confirm())
 */
export const showDeleteConfirmModal = (
  patientName: string,
  onConfirm: () => void,
  onCancel?: () => void
): void => {
  const existing = document.getElementById('delete-confirm-modal');
  if (existing) existing.remove();

  const colors = getThemeColors();

  const modal = document.createElement('div');
  modal.id = 'delete-confirm-modal';
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${colors.isDark ? '#1e293b' : '#ffffff'};
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,${colors.isDark ? '0.5' : '0.18'});
    padding: 32px;
    z-index: 10001;
    min-width: 340px;
    max-width: 420px;
    text-align: center;
    border: 1px solid ${colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  `;

  // Icon
  const iconDiv = document.createElement('div');
  iconDiv.style.cssText = `
    width: 64px; height: 64px; border-radius: 50%;
    background: rgba(220, 53, 69, 0.1);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
  `;
  iconDiv.innerHTML = '<i class="bi bi-trash3" style="font-size: 28px; color: #dc3545;"></i>';

  // Title
  const title = document.createElement('h5');
  title.textContent = t('calendar.deleteTitle', 'Delete Appointment?');
  title.style.cssText = `margin-bottom: 12px; color: ${colors.textColor}; font-weight: 700;`;

  // Message
  const msg = document.createElement('p');
  msg.innerHTML = t('calendar.deleteMessage',
    `This action cannot be undone. The appointment for <strong>${patientName}</strong> will be permanently removed.`,
    { patient: patientName }
  );
  msg.style.cssText = `font-size: 14px; color: ${colors.labelColor}; margin-bottom: 24px; line-height: 1.5;`;

  // Buttons
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display: flex; justify-content: center; gap: 16px;';

  const confirmBtn = document.createElement('button');
  confirmBtn.innerHTML = '<i class="bi bi-trash3 me-1"></i> ' + t('common.delete', 'Delete');
  confirmBtn.style.cssText = `
    padding: 10px 28px; border-radius: 10px; border: none;
    background: #dc3545; color: white; font-weight: 600; font-size: 14px;
    cursor: pointer; transition: transform 0.15s, background 0.15s;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  `;
  confirmBtn.onmouseover = () => { confirmBtn.style.transform = 'scale(1.04)'; };
  confirmBtn.onmouseout = () => { confirmBtn.style.transform = 'scale(1)'; };

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = t('common.cancel', 'Cancel');
  cancelBtn.style.cssText = `
    padding: 10px 28px; border-radius: 10px;
    border: 1px solid ${colors.inputBorder};
    background: transparent; color: ${colors.textColor};
    font-weight: 600; font-size: 14px; cursor: pointer;
    transition: transform 0.15s;
  `;
  cancelBtn.onmouseover = () => { cancelBtn.style.transform = 'scale(1.04)'; };
  cancelBtn.onmouseout = () => { cancelBtn.style.transform = 'scale(1)'; };

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(confirmBtn);

  modal.appendChild(iconDiv);
  modal.appendChild(title);
  modal.appendChild(msg);
  modal.appendChild(btnRow);

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'delete-confirm-overlay';
  overlay.style.cssText = getOverlayCSS(10000);

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  const cleanup = () => {
    modal.remove();
    overlay.remove();
  };

  confirmBtn.onclick = () => {
    onConfirm();
    cleanup();
  };

  cancelBtn.onclick = () => {
    onCancel?.();
    cleanup();
  };

  overlay.onclick = () => {
    onCancel?.();
    cleanup();
  };
};
