import { getThemeColors, getOverlayCSS, getInputCSS } from '../../../../utils/popupStyles';
import { loadCalendarSettings } from '../../../user/Settings/CalendarSettings/index';
import { getDefaultRejectionReasons } from '../../../user/Settings/CalendarSettings/types';
import i18next from '../../../../i18n';

const t = (key: string, fallback: string, opts?: Record<string, unknown>): string =>
  i18next.t(key, { defaultValue: fallback, ...opts }) as string;

/**
 * Show rejection reason selection modal with modern chip/card UX
 */
export const showRejectModal = (
  patientName: string,
  onConfirm: (reason: string) => void,
  onCancel?: () => void
): void => {
  const existing = document.getElementById('reject-modal');
  if (existing) existing.remove();

  const colors = getThemeColors();
  const settings = loadCalendarSettings();

  // Use configured reasons or i18n defaults
  const defaultReasons = getDefaultRejectionReasons();
  const settingsAny = settings as unknown as Record<string, unknown>;
  const reasons: string[] = Array.isArray(settingsAny.rejectionReasons) && (settingsAny.rejectionReasons as string[]).length > 0
    ? (settingsAny.rejectionReasons as string[])
    : defaultReasons;

  let selectedReason = '';

  const modal = document.createElement('div');
  modal.id = 'reject-modal';
  modal.style.cssText = `
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: ${colors.isDark ? '#1e293b' : '#ffffff'};
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,${colors.isDark ? '0.5' : '0.18'});
    padding: 28px;
    z-index: 10001;
    min-width: 400px; max-width: 500px;
    border: 1px solid ${colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  `;

  // Icon + Title
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; align-items: center; gap: 12px; margin-bottom: 16px;';
  header.innerHTML = `
    <div style="width:44px;height:44px;border-radius:50%;background:rgba(220,53,69,0.1);display:flex;align-items:center;justify-content:center;">
      <i class="bi bi-x-circle" style="font-size:22px;color:#dc3545;"></i>
    </div>
    <div>
      <h5 style="margin:0;color:${colors.textColor};font-weight:700;font-size:1.1rem;">
        ${t('calendar.rejectTitle', 'Reject Appointment')}
      </h5>
      <small style="color:${colors.labelColor};font-size:12px;">${patientName}</small>
    </div>
  `;

  // Subtitle
  const subtitle = document.createElement('p');
  subtitle.textContent = t('calendar.rejectSelectReason', 'Select a reason for rejection:');
  subtitle.style.cssText = `font-size:13px;color:${colors.labelColor};margin:0 0 12px;font-weight:600;`;

  // Reason chips container
  const chipsContainer = document.createElement('div');
  chipsContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;';

  const chipBg = colors.isDark ? '#334155' : '#f1f5f9';
  const chipBgActive = colors.isDark ? '#475569' : '#e0e7ff';
  const chipBorder = colors.isDark ? '#475569' : '#cbd5e1';
  const chipBorderActive = '#6366f1';

  reasons.forEach(reason => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.textContent = reason;
    chip.dataset.reason = reason;
    chip.style.cssText = `
      padding: 8px 16px; border-radius: 20px; font-size: 13px;
      border: 1.5px solid ${chipBorder};
      background: ${chipBg}; color: ${colors.textColor};
      cursor: pointer; transition: all 0.2s;
      font-weight: 500; white-space: nowrap;
    `;

    chip.onmouseover = () => {
      if (selectedReason !== reason) {
        chip.style.borderColor = chipBorderActive;
        chip.style.background = chipBgActive;
      }
    };
    chip.onmouseout = () => {
      if (selectedReason !== reason) {
        chip.style.borderColor = chipBorder;
        chip.style.background = chipBg;
      }
    };
    chip.onclick = () => {
      // Deselect all
      chipsContainer.querySelectorAll('button').forEach(b => {
        (b as HTMLElement).style.borderColor = chipBorder;
        (b as HTMLElement).style.background = chipBg;
        (b as HTMLElement).style.color = colors.textColor;
      });
      // Select this
      selectedReason = reason;
      chip.style.borderColor = chipBorderActive;
      chip.style.background = chipBorderActive;
      chip.style.color = '#ffffff';
      // Clear custom input if chip selected
      customInput.value = '';
      updateConfirmState();
    };

    chipsContainer.appendChild(chip);
  });

  // Custom note section
  const customLabel = document.createElement('p');
  customLabel.textContent = t('calendar.rejectCustomNote', 'Or add a personal note:');
  customLabel.style.cssText = `font-size:12px;color:${colors.labelColor};margin:0 0 8px;font-weight:600;`;

  const customInput = document.createElement('textarea') as HTMLTextAreaElement;
  customInput.placeholder = t('calendar.rejectCustomPlaceholder', 'Enter your reason...');
  customInput.rows = 2;
  customInput.style.cssText = getInputCSS(colors) + '; resize: vertical; min-height: 48px;';
  customInput.addEventListener('input', () => {
    if (customInput.value.trim()) {
      selectedReason = '';
      // Deselect all chips
      chipsContainer.querySelectorAll('button').forEach(b => {
        (b as HTMLElement).style.borderColor = chipBorder;
        (b as HTMLElement).style.background = chipBg;
        (b as HTMLElement).style.color = colors.textColor;
      });
    }
    updateConfirmState();
  });

  // Buttons row
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = t('common.cancel', 'Cancel');
  cancelBtn.style.cssText = `
    padding: 8px 22px; border-radius: 10px;
    border: 1px solid ${colors.inputBorder};
    background: transparent; color: ${colors.textColor};
    font-weight: 600; font-size: 13px; cursor: pointer;
  `;

  const confirmBtn = document.createElement('button');
  confirmBtn.innerHTML = '<i class="bi bi-x-circle me-1"></i>' + t('calendar.rejectConfirmBtn', 'Confirm Rejection');
  confirmBtn.style.cssText = `
    padding: 8px 22px; border-radius: 10px; border: none;
    background: #dc3545; color: white; font-weight: 600; font-size: 13px;
    cursor: pointer; opacity: 0.5; pointer-events: none;
    transition: opacity 0.2s, transform 0.15s;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.25);
  `;

  const updateConfirmState = () => {
    const hasReason = selectedReason || customInput.value.trim();
    confirmBtn.style.opacity = hasReason ? '1' : '0.5';
    confirmBtn.style.pointerEvents = hasReason ? 'auto' : 'none';
  };

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(confirmBtn);

  // Assemble
  modal.appendChild(header);
  modal.appendChild(subtitle);
  modal.appendChild(chipsContainer);
  modal.appendChild(customLabel);
  modal.appendChild(customInput);
  modal.appendChild(btnRow);

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'reject-modal-overlay';
  overlay.style.cssText = getOverlayCSS(10000);

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  const cleanup = () => {
    modal.remove();
    overlay.remove();
  };

  confirmBtn.onclick = () => {
    const reason = selectedReason || customInput.value.trim();
    if (reason) {
      onConfirm(reason);
      cleanup();
    }
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
