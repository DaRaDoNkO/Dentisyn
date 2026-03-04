/**
 * Centralized modal / dialog service.
 *
 * Every user-facing popup in the app should go through these helpers so the
 * UX stays consistent, theme-aware and i18n-ready.
 *
 * Variants: confirm · alert · warning · danger
 *
 * Uses the shared popupStyles theme tokens + Bootstrap Icons.
 */

import { getThemeColors, getOverlayCSS } from './popupStyles';
import type { ThemeColors } from './popupStyles';
import i18next from '../i18n';

/* ──────────── Public types ──────────── */

export type ModalVariant = 'info' | 'warning' | 'danger' | 'success';

export interface ConfirmDialogOptions {
  /** Modal title */
  title: string;
  /** Message body — may contain HTML */
  body: string;
  /** Optional extra HTML inserted below the body (e.g. a change list) */
  details?: string;
  /** Visual variant — drives colours and icon */
  variant?: ModalVariant;
  /** Text for the primary (confirm) button */
  confirmLabel?: string;
  /** Text for the secondary (cancel) button */
  cancelLabel?: string;
  /** Bootstrap-icon class for the confirm button (e.g. "bi-check-lg") */
  confirmIcon?: string;
}

export interface AlertDialogOptions {
  title: string;
  body: string;
  details?: string;
  variant?: ModalVariant;
  /** Text for the dismiss button */
  buttonLabel?: string;
}

/* ──────────── Variant palette ──────────── */

interface VariantPalette {
  accent: string;
  iconBg: string;
  icon: string;
  btnBg: string;
  btnShadow: string;
}

const palette = (variant: ModalVariant): VariantPalette => {
  switch (variant) {
    case 'danger':
      return { accent: '#dc3545', iconBg: 'rgba(220,53,69,0.10)', icon: 'bi-exclamation-triangle-fill', btnBg: '#dc3545', btnShadow: 'rgba(220,53,69,0.30)' };
    case 'warning':
      return { accent: '#f59e0b', iconBg: 'rgba(245,158,11,0.10)', icon: 'bi-exclamation-circle-fill', btnBg: '#f59e0b', btnShadow: 'rgba(245,158,11,0.30)' };
    case 'success':
      return { accent: '#198754', iconBg: 'rgba(25,135,84,0.10)', icon: 'bi-check-circle-fill', btnBg: '#198754', btnShadow: 'rgba(25,135,84,0.30)' };
    case 'info':
    default:
      return { accent: '#0d6efd', iconBg: 'rgba(13,110,253,0.10)', icon: 'bi-info-circle-fill', btnBg: '#0d6efd', btnShadow: 'rgba(13,110,253,0.30)' };
  }
};

/* ──────────── Shared DOM builders ──────────── */

const MODAL_ID = 'dentisyn-modal-service';
const OVERLAY_ID = 'dentisyn-modal-overlay';

function cleanup(): void {
  document.getElementById(MODAL_ID)?.remove();
  document.getElementById(OVERLAY_ID)?.remove();
}

function buildOverlay(onClickOutside?: () => void): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = getOverlayCSS(11000);
  if (onClickOutside) overlay.addEventListener('click', onClickOutside);
  return overlay;
}

function buildCard(colors: ThemeColors): HTMLDivElement {
  const card = document.createElement('div');
  card.id = MODAL_ID;
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'true');
  card.style.cssText = `
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%) scale(0.96);
    background: ${colors.isDark ? '#1e293b' : '#ffffff'};
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,${colors.isDark ? '0.5' : '0.18'});
    padding: 32px; z-index: 11001;
    min-width: 340px; max-width: 460px; width: 92%;
    border: 1px solid ${colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
    opacity: 0;
    transition: transform 0.2s ease, opacity 0.2s ease;
  `;
  // Animate in on next frame
  requestAnimationFrame(() => {
    card.style.opacity = '1';
    card.style.transform = 'translate(-50%, -50%) scale(1)';
  });
  return card;
}

function buildHeader(title: string, v: VariantPalette, colors: ThemeColors): HTMLDivElement {
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;gap:14px;margin-bottom:16px;';
  header.innerHTML = `
    <div style="width:52px;height:52px;min-width:52px;border-radius:14px;background:${v.iconBg};
      display:flex;align-items:center;justify-content:center;">
      <i class="bi ${v.icon}" style="font-size:24px;color:${v.accent};"></i>
    </div>
    <h5 style="margin:0;color:${colors.textColor};font-weight:700;font-size:1.1rem;line-height:1.3;">${title}</h5>
  `;
  return header;
}

function buildBody(body: string, details: string | undefined, colors: ThemeColors): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `margin-bottom:24px;color:${colors.labelColor};font-size:14px;line-height:1.55;`;
  wrapper.innerHTML = `<p style="margin:0 0 ${details ? '12px' : '0'};">${body}</p>`;
  if (details) {
    const detailEl = document.createElement('div');
    detailEl.style.cssText = `
      background:${colors.isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'};
      border:1px solid ${colors.isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'};
      border-radius:10px; padding:14px 16px; font-size:13px;
      color:${colors.textColor};
    `;
    detailEl.innerHTML = details;
    wrapper.appendChild(detailEl);
  }
  return wrapper;
}

function createBtn(label: string, opts: {
  bg: string; color: string; border?: string; shadow?: string; icon?: string;
}): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.innerHTML = (opts.icon ? `<i class="bi ${opts.icon} me-1"></i>` : '') + label;
  btn.style.cssText = `
    padding:10px 26px; border-radius:10px; font-weight:600; font-size:14px;
    cursor:pointer; transition:transform 0.15s, box-shadow 0.15s;
    border:${opts.border ? `1px solid ${opts.border}` : 'none'};
    background:${opts.bg}; color:${opts.color};
    ${opts.shadow ? `box-shadow:0 4px 12px ${opts.shadow};` : ''}
  `;
  btn.onmouseover = () => { btn.style.transform = 'scale(1.04)'; };
  btn.onmouseout = () => { btn.style.transform = 'scale(1)'; };
  return btn;
}

/* ──────────── Public API ──────────── */

/**
 * Show a themed confirmation dialog.
 * Resolves `true` when confirmed, `false` when cancelled / dismissed.
 */
export const showConfirmDialog = (opts: ConfirmDialogOptions): Promise<boolean> => {
  cleanup();
  const colors = getThemeColors();
  const v = palette(opts.variant ?? 'info');

  const t = (k: string, fb: string) => i18next.t(k, fb) as string;
  const confirmLabel = opts.confirmLabel ?? t('common.confirm', 'Confirm');
  const cancelLabel = opts.cancelLabel ?? t('common.cancel', 'Cancel');

  return new Promise((resolve) => {
    const close = (result: boolean) => { cleanup(); resolve(result); };

    const overlay = buildOverlay(() => close(false));
    const card = buildCard(colors);
    card.appendChild(buildHeader(opts.title, v, colors));
    card.appendChild(buildBody(opts.body, opts.details, colors));

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:flex-end;gap:12px;';

    const cancelBtn = createBtn(cancelLabel, {
      bg: 'transparent', color: colors.textColor, border: colors.inputBorder,
    });
    const confirmBtn = createBtn(confirmLabel, {
      bg: v.btnBg, color: '#fff', shadow: v.btnShadow, icon: opts.confirmIcon,
    });

    cancelBtn.onclick = () => close(false);
    confirmBtn.onclick = () => close(true);

    row.appendChild(cancelBtn);
    row.appendChild(confirmBtn);
    card.appendChild(row);

    document.body.appendChild(overlay);
    document.body.appendChild(card);

    // Focus the confirm button for keyboard accessibility
    confirmBtn.focus();
  });
};

/**
 * Show a themed alert dialog (single action — dismissible).
 * Resolves when the user clicks the button or the overlay.
 */
export const showAlertDialog = (opts: AlertDialogOptions): Promise<void> => {
  cleanup();
  const colors = getThemeColors();
  const v = palette(opts.variant ?? 'info');

  const t = (k: string, fb: string) => i18next.t(k, fb) as string;
  const label = opts.buttonLabel ?? t('common.ok', 'OK');

  return new Promise((resolve) => {
    const close = () => { cleanup(); resolve(); };

    const overlay = buildOverlay(close);
    const card = buildCard(colors);
    card.appendChild(buildHeader(opts.title, v, colors));
    card.appendChild(buildBody(opts.body, opts.details, colors));

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:flex-end;';

    const btn = createBtn(label, {
      bg: v.btnBg, color: '#fff', shadow: v.btnShadow,
    });
    btn.onclick = close;

    row.appendChild(btn);
    card.appendChild(row);

    document.body.appendChild(overlay);
    document.body.appendChild(card);
    btn.focus();
  });
};
