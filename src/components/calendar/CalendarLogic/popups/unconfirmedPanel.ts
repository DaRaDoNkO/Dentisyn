import { appointmentRepository } from '../../../../repositories/appointmentRepository';
import { doctorRepository } from '../../../../repositories/doctorRepository';
import { formatDate, formatTime } from '../../../../utils/dateUtils';
import { getThemeColors, getOverlayCSS } from '../../../../utils/popupStyles';
import { refreshCalendar } from '../refresh';
import { showToast } from '../../../../utils/toast';
import i18next from '../../../../i18n';

const t = (key: string, fallback: string): string =>
  i18next.t(key, { defaultValue: fallback }) as string;

/**
 * Show the unconfirmed appointments panel (slide-in from right)
 */
export const showUnconfirmedPanel = (): void => {
  const existing = document.getElementById('unconfirmed-panel');
  if (existing) {
    existing.remove();
    document.getElementById('unconfirmed-panel-overlay')?.remove();
    return;
  } // toggle behavior

  const colors = getThemeColors();

  // Use start of today so all of today's pending appointments are included
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Get all Pending appointments from today onward
  const pending = appointmentRepository.getAll()
    .filter(a => a.status === 'Pending' && new Date(a.startTime) >= startOfToday)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Panel container
  const panel = document.createElement('div');
  panel.id = 'unconfirmed-panel';
  panel.style.cssText = `
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 400px; max-width: 90vw;
    background: ${colors.isDark ? '#1e293b' : '#ffffff'};
    box-shadow: -4px 0 20px rgba(0,0,0,${colors.isDark ? '0.4' : '0.12'});
    z-index: 10001;
    display: flex; flex-direction: column;
    border-left: 1px solid ${colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 20px 20px 16px; border-bottom: 1px solid ${colors.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
    display: flex; align-items: center; justify-content: space-between;
  `;
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:36px;height:36px;border-radius:10px;background:rgba(220,53,69,0.1);display:flex;align-items:center;justify-content:center;">
        <i class="bi bi-exclamation-circle" style="color:#dc3545;font-size:18px;"></i>
      </div>
      <div>
        <h6 style="margin:0;font-weight:700;color:${colors.textColor};">
          ${t('calendar.unconfirmedTitle', 'Unconfirmed Appointments')}
        </h6>
        <small style="color:${colors.labelColor};">${pending.length} ${pending.length === 1 ? 'appointment' : 'appointments'}</small>
      </div>
    </div>
    <button id="closeUnconfirmedPanel" style="background:none;border:none;font-size:22px;color:${colors.labelColor};cursor:pointer;">&times;</button>
  `;

  // List
  const list = document.createElement('div');
  list.style.cssText = 'flex: 1; overflow-y: auto; padding: 12px 16px;';

  if (pending.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <i class="bi bi-check-circle" style="font-size:48px;color:#22c55e;"></i>
        <p style="margin-top:12px;color:${colors.labelColor};font-size:14px;">
          ${t('calendar.unconfirmedEmpty', 'All appointments are confirmed!')}
        </p>
      </div>
    `;
  } else {
    pending.forEach(appt => {
      const card = document.createElement('div');
      card.style.cssText = `
        padding: 14px; margin-bottom: 10px;
        border-radius: 12px; border: 1px solid ${colors.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
        background: ${colors.isDark ? '#334155' : '#f8fafc'};
        transition: background 0.15s;
      `;
      card.onmouseover = () => { card.style.background = colors.isDark ? '#475569' : '#f1f5f9'; };
      card.onmouseout = () => { card.style.background = colors.isDark ? '#334155' : '#f8fafc'; };

      const docName = doctorRepository.getDisplayName(appt.doctor);

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
          <div>
            <div style="font-weight:600;color:${colors.textColor};font-size:14px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#dc3545;margin-right:6px;vertical-align:middle;"></span>
              ${appt.patientName}
            </div>
            <small style="color:${colors.labelColor};">${docName}</small>
          </div>
          <button class="confirm-from-panel btn btn-sm btn-success" data-id="${appt.id}"
            style="font-size:12px;padding:4px 12px;border-radius:8px;white-space:nowrap;">
            <i class="bi bi-check-circle me-1"></i>${t('calendar.confirmAppointment', 'Confirm')}
          </button>
        </div>
        <div style="display:flex;gap:16px;font-size:12px;color:${colors.labelColor};">
          <span><i class="bi bi-calendar3 me-1"></i>${formatDate(appt.startTime)}</span>
          <span><i class="bi bi-clock me-1"></i>${formatTime(appt.startTime)} - ${formatTime(appt.endTime)}</span>
        </div>
        ${appt.reason ? `<div style="margin-top:6px;font-size:12px;color:${colors.labelColor};"><i class="bi bi-chat-text me-1"></i>${appt.reason}</div>` : ''}
      `;

      list.appendChild(card);
    });
  }

  panel.appendChild(header);
  panel.appendChild(list);

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'unconfirmed-panel-overlay';
  overlay.style.cssText = getOverlayCSS(10000);

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  // Animate in
  requestAnimationFrame(() => {
    panel.style.transform = 'translateX(0)';
  });

  const cleanup = () => {
    panel.style.transform = 'translateX(100%)';
    setTimeout(() => {
      panel.remove();
      overlay.remove();
    }, 300);
  };

  // Close handlers
  document.getElementById('closeUnconfirmedPanel')?.addEventListener('click', cleanup);
  overlay.addEventListener('click', cleanup);

  // Confirm buttons inside the panel
  panel.querySelectorAll('.confirm-from-panel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      if (!id) return;

      appointmentRepository.update(id, {
        status: 'Confirmed',
        confirmedAt: new Date().toISOString(),
      });

      showToast({
        type: 'success',
        message: t('calendar.appointmentConfirmed', 'Appointment confirmed!'),
        duration: 2500
      });

      console.info(`[AUDIT] APPOINTMENT_CONFIRMED | ID: ${id} | Time: ${new Date().toISOString()}`);

      // Remove the card from the list
      const card = (btn as HTMLElement).closest('div[style*="padding: 14px"]');
      if (card) {
        card.remove();
        // Update count
        const remaining = panel.querySelectorAll('.confirm-from-panel').length;
        const countEl = header.querySelector('small');
        if (countEl) countEl.textContent = `${remaining} ${remaining === 1 ? 'appointment' : 'appointments'}`;
        if (remaining === 0) {
          list.innerHTML = `
            <div style="text-align:center;padding:40px 20px;">
              <i class="bi bi-check-circle" style="font-size:48px;color:#22c55e;"></i>
              <p style="margin-top:12px;color:${colors.labelColor};font-size:14px;">
                ${t('calendar.unconfirmedEmpty', 'All appointments are confirmed!')}
              </p>
            </div>
          `;
        }
      }

      refreshCalendar();
    });
  });
};
