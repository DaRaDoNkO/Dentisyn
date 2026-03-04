/**
 * Duplicate Appointment Service
 * 
 * Manages the state of a "clipboard" appointment that the user can paste
 * onto a new time slot. While active, a floating banner follows the cursor
 * and the user can navigate weeks without losing the clipboard.
 * 
 * Cancel: Escape key or right-click.
 */

import i18next from '../../../i18n';
import { showToast } from '../../../utils/toast';

const t = (key: string, fb: string): string =>
  i18next.t(key, { defaultValue: fb }) as string;

export interface DuplicatePayload {
  patientId: string;
  patientName: string;
  phone: string;
  doctor: string;
  reason: string;
  /** Original duration in milliseconds — used to auto-set end time */
  durationMs: number;
}

// ─── Internal state ────────────────────────────────────────────
let clipboard: DuplicatePayload | null = null;
let bannerEl: HTMLElement | null = null;

// Bound references so we can remove listeners later
let onKeyDown: ((e: KeyboardEvent) => void) | null = null;
let onContextMenu: ((e: MouseEvent) => void) | null = null;

// ─── Public API ────────────────────────────────────────────────

/** Returns the current clipboard payload (or null) */
export const getDuplicateClipboard = (): DuplicatePayload | null => clipboard;

/** True when the user is in "duplicate placement" mode */
export const isDuplicating = (): boolean => clipboard !== null;

/**
 * Start duplication mode: store the payload, show floating banner,
 * listen for Escape / right-click to cancel.
 */
export const startDuplicate = (payload: DuplicatePayload): void => {
  clipboard = payload;
  createBanner(payload.patientName);
  attachListeners();

  console.info(
    `[AUDIT] DUPLICATE_START | Patient: ${payload.patientName} | Time: ${new Date().toISOString()}`
  );
};

/** Cancel duplication and clean up */
export const cancelDuplicate = (silent = false): void => {
  if (!clipboard) return;

  const name = clipboard.patientName;
  clipboard = null;
  removeBanner();
  detachListeners();

  if (!silent) {
    showToast({
      type: 'info',
      message: t('messages.toast.duplicateCancelled', 'Duplication cancelled'),
      duration: 2000
    });
  }

  console.info(
    `[AUDIT] DUPLICATE_CANCEL | Patient: ${name} | Time: ${new Date().toISOString()}`
  );
};

/**
 * Consume the clipboard (after a successful paste).
 * Returns the payload and clears state.
 */
export const consumeDuplicate = (): DuplicatePayload | null => {
  const data = clipboard;
  clipboard = null;
  removeBanner();
  detachListeners();
  return data;
};

// ─── Floating banner ───────────────────────────────────────────

const createBanner = (patientName: string): void => {
  removeBanner(); // safety

  const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';

  bannerEl = document.createElement('div');
  bannerEl.id = 'duplicate-banner';
  bannerEl.innerHTML = `
    <i class="bi bi-clipboard-plus" style="font-size: 16px;"></i>
    <span><strong>${patientName}</strong></span>
    <span style="opacity:0.7; font-size: 12px;">
      — ${t('calendar.duplicateClickToPlace', 'Click a time slot to place')}
    </span>
    <span style="opacity:0.5; font-size: 11px; margin-left: 4px;">(Esc ${t('calendar.duplicateToCancel', 'to cancel')})</span>
  `;
  bannerEl.style.cssText = `
    position: fixed;
    top: 72px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: 10px;
    z-index: 9998;
    pointer-events: none;
    font-size: 14px;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    background: ${isDark ? 'linear-gradient(135deg, #312e81, #4338ca)' : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)'};
    color: ${isDark ? '#e0e7ff' : '#312e81'};
    border: 1px solid ${isDark ? 'rgba(129,140,248,0.3)' : 'rgba(99,102,241,0.25)'};
    animation: duplicateBannerIn 0.25s ease-out;
  `;

  // Inject keyframe animation if not present
  if (!document.getElementById('duplicate-banner-style')) {
    const style = document.createElement('style');
    style.id = 'duplicate-banner-style';
    style.textContent = `
      @keyframes duplicateBannerIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      body.duplicate-mode .fc-timegrid-slot,
      body.duplicate-mode .fc-daygrid-day-frame {
        cursor: copy !important;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(bannerEl);
  document.body.classList.add('duplicate-mode');
};

const removeBanner = (): void => {
  bannerEl?.remove();
  bannerEl = null;
  document.body.classList.remove('duplicate-mode');
};

// ─── Keyboard / context-menu listeners ─────────────────────────

const attachListeners = (): void => {
  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelDuplicate();
    }
  };

  onContextMenu = (e: MouseEvent) => {
    if (isDuplicating()) {
      e.preventDefault();
      cancelDuplicate();
    }
  };

  // CSS cursor handles visual feedback via body.duplicate-mode class

  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('contextmenu', onContextMenu, true);
};

const detachListeners = (): void => {
  if (onKeyDown) document.removeEventListener('keydown', onKeyDown, true);
  if (onContextMenu) document.removeEventListener('contextmenu', onContextMenu, true);
  onKeyDown = null;
  onContextMenu = null;
};
