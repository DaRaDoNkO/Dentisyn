/**
 * Animated confirmation dialog for ID type auto-detection.
 * Replaces native browser confirm() with a styled i18n-aware overlay.
 */

interface IdDetectionDialogOptions {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function showIdDetectionDialog(opts: IdDetectionDialogOptions): void {
  document.getElementById('__idDetectOverlay')?.remove();

  const accent = opts.variant === 'warning' ? '#f59e0b' : '#3b82f6';
  const iconSvg = opts.variant === 'warning'
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  const overlay = document.createElement('div');
  overlay.id = '__idDetectOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(15,23,42,0.55)',
    zIndex: '10500', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
    opacity: '0', transition: 'opacity .18s ease',
  });

  overlay.innerHTML = `
    <div id="__idDetectDialog" style="background:#fff;border-radius:16px;padding:1.75rem 2rem;max-width:440px;width:92%;
      box-shadow:0 24px 64px rgba(15,23,42,0.28);transform:scale(.96) translateY(8px);
      transition:transform .2s ease,opacity .2s ease;opacity:0;">
      <div style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:1.4rem;">
        <div style="width:48px;height:48px;min-width:48px;border-radius:12px;background:${accent}18;
          display:flex;align-items:center;justify-content:center;">${iconSvg}</div>
        <div style="flex:1">
          <p style="margin:0 0 .15rem;font-size:1rem;font-weight:700;color:#0f172a;">${opts.title}</p>
          <p style="margin:0;color:#64748b;font-size:.875rem;line-height:1.55;">${opts.body}</p>
        </div>
      </div>
      <div style="display:flex;gap:.625rem;justify-content:flex-end;">
        <button id="__idDetectCancel" style="padding:.5rem 1.1rem;border-radius:8px;border:1.5px solid #e2e8f0;
          background:#f8fafc;color:#374151;cursor:pointer;font-size:.85rem;font-weight:500;">${opts.cancelLabel}</button>
        <button id="__idDetectConfirm" style="padding:.5rem 1.35rem;border-radius:8px;border:none;
          background:${accent};color:#fff;cursor:pointer;font-size:.85rem;font-weight:600;
          box-shadow:0 2px 10px ${accent}55;">${opts.confirmLabel}</button>
      </div>
    </div>`;

  const close = (cb: () => void) => {
    overlay.style.opacity = '0';
    const dialog = overlay.querySelector<HTMLElement>('#__idDetectDialog');
    if (dialog) { dialog.style.transform = 'scale(.96) translateY(8px)'; dialog.style.opacity = '0'; }
    setTimeout(() => { overlay.remove(); cb(); }, 180);
  };

  overlay.querySelector('#__idDetectConfirm')!.addEventListener('click', () => close(opts.onConfirm));
  overlay.querySelector('#__idDetectCancel')!.addEventListener('click',  () => close(opts.onCancel));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(opts.onCancel); });

  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    const d = overlay.querySelector<HTMLElement>('#__idDetectDialog');
    if (d) { d.style.transform = 'scale(1) translateY(0)'; d.style.opacity = '1'; }
  });
}
