import { appointmentRepository } from '../../../../repositories/appointmentRepository';
import { doctorRepository } from '../../../../repositories/doctorRepository';
import { patientRepository } from '../../../../repositories/patientRepository';
import { formatDate, formatTime } from '../../../../utils/dateUtils';
import { getThemeColors, getOverlayCSS } from '../../../../utils/popupStyles';
import i18next from '../../../../i18n';

const t = (key: string, fallback: string): string =>
  i18next.t(key, { defaultValue: fallback }) as string;

const getStatusColor = (status: string, isDark: boolean): string => {
  switch (status) {
    case 'Confirmed': return isDark ? '#22c55e' : '#16a34a';
    case 'Arrived': return isDark ? '#3b82f6' : '#2563eb';
    case 'Completed': return isDark ? '#a855f7' : '#7e22ce';
    case 'Cancelled': return isDark ? '#f43f5e' : '#dc2626';
    case 'Pending': return isDark ? '#eab308' : '#ca8a04';
    case 'Rejected': return isDark ? '#f97316' : '#ea580c';
    default: return isDark ? '#94a3b8' : '#64748b';
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'Confirmed': return 'bi-check-circle';
    case 'Arrived': return 'bi-person-check';
    case 'Completed': return 'bi-clipboard-check';
    case 'Cancelled': return 'bi-x-circle';
    case 'Pending': return 'bi-hourglass-split';
    case 'Rejected': return 'bi-slash-circle';
    default: return 'bi-calendar';
  }
};

/**
 * Show the patient appointment history panel (slide-in from right)
 */
export const showPatientHistoryPanel = (patientId: string): void => {
  const existing = document.getElementById('patient-history-panel');
  if (existing) {
    existing.remove();
    document.getElementById('patient-history-overlay')?.remove();
  }

  const patient = patientRepository.getById(patientId);
  if (!patient) return;

  const colors = getThemeColors();

  const allAppointments = appointmentRepository.getByPatientId(patientId)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()); // descending

  // Panel container
  const panel = document.createElement('div');
  panel.id = 'patient-history-panel';
  panel.style.cssText = `
    position: fixed; top: 0; right: 0; bottom: 0;
    width: 450px; max-width: 95vw;
    background: ${colors.isDark ? '#1e293b' : '#ffffff'};
    box-shadow: -8px 0 30px rgba(0,0,0,${colors.isDark ? '0.5' : '0.15'});
    z-index: 10005;
    display: flex; flex-direction: column;
    border-left: 1px solid ${colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 24px 20px 20px; 
    border-bottom: 1px solid ${colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
    display: flex; align-items: flex-start; justify-content: space-between;
    background: ${colors.isDark ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #ffffff, #f8fafc)'};
  `;
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;">
      <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg, var(--bs-primary), #8b5cf6);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(99,102,241,0.25);">
        <i class="bi bi-clock-history" style="color:#ffffff;font-size:24px;"></i>
      </div>
      <div>
        <h5 style="margin:0 0 4px 0;font-weight:700;color:${colors.textColor};letter-spacing:-0.01em;">
          ${t('calendar.appointmentHistory', 'Appointment History')}
        </h5>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <a href="#" id="historyPanelPatientName" style="color:var(--bs-primary);font-size:15px;font-weight:bold;text-decoration:none;cursor:pointer;">${patient.name}</a>
          ${patient.phone ? `<small style="color:${colors.labelColor};font-size:13px;"><i class="bi bi-telephone" style="margin-right:6px;"></i>${patient.phone}</small>` : ''}
        </div>
      </div>
    </div>
    <button id="closeHistoryPanel" style="background:rgba(148,163,184,0.1);border:none;width:32px;height:32px;border-radius:8px;font-size:20px;color:${colors.labelColor};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;">&times;</button>
  `;

  // List
  const list = document.createElement('div');
  list.style.cssText = 'flex: 1; overflow-y: auto; padding: 20px; display:flex; flex-direction:column; gap:16px; background:' + (colors.isDark ? '#0f172a' : '#f8fafc');

  if (allAppointments.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:60px 20px;background:${colors.isDark ? '#1e293b' : '#ffffff'};border-radius:16px;border:1px dashed ${colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};">
        <div style="width:64px;height:64px;border-radius:50%;background:${colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          <i class="bi bi-calendar-x" style="font-size:32px;color:${colors.labelColor};"></i>
        </div>
        <h6 style="color:${colors.textColor};margin:0 0 8px 0;font-weight:600;">${t('table.noAppointments', 'No appointments')}</h6>
        <p style="color:${colors.labelColor};font-size:14px;margin:0;">${t('calendar.patientNoHistory', 'This patient has no previous appointments.')}</p>
      </div>
    `;
  } else {
    // Add timeline styling
    const timeline = document.createElement('div');
    timeline.style.cssText = `position:relative; padding-left:14px;`;
    
    // Timeline line
    const line = document.createElement('div');
    line.style.cssText = `position:absolute;left:0;top:8px;bottom:8px;width:2px;background:${colors.isDark ? '#334155' : '#e2e8f0'};border-radius:2px;`;
    timeline.appendChild(line);

    allAppointments.forEach((appt, index) => {
      const isPast = new Date(appt.startTime) < new Date();
      const statusColor = getStatusColor(appt.status, colors.isDark);
      const statusIcon = getStatusIcon(appt.status);
      const docName = doctorRepository.getDisplayName(appt.doctor);

      const cardWrapper = document.createElement('div');
      cardWrapper.style.cssText = `position:relative; padding-left:24px; margin-bottom:${index === allAppointments.length - 1 ? '0' : '24px'};`;

      // Timeline dot
      const dot = document.createElement('div');
      dot.style.cssText = `
        position:absolute; left:-6px; top:24px; width:14px; height:14px; 
        border-radius:50%; background:${colors.isDark ? '#1e293b' : '#f8fafc'};
        border:3px solid ${statusColor}; z-index:2;
      `;
      cardWrapper.appendChild(dot);

      const card = document.createElement('div');
      card.style.cssText = `
        padding: 16px; 
        border-radius: 16px; 
        border: 1px solid ${colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'};
        background: ${colors.isDark ? '#1e293b' : '#ffffff'};
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: default;
        ${isPast ? `opacity: ${colors.isDark ? '0.85' : '0.9'};` : ''}
      `;
      
      card.onmouseover = () => { 
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = `0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)`;
        card.style.border = `1px solid ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`;
      };
      card.onmouseout = () => { 
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = `0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)`;
        card.style.border = `1px solid ${colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`;
      };

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="background:${statusColor}1A; color:${statusColor}; padding:6px 10px; border-radius:8px; font-size:12px; font-weight:600; display:flex; align-items:center; gap:6px;">
              <i class="bi ${statusIcon}"></i>
              ${t(`calendar.status${appt.status}`, appt.status)}
            </div>
            ${!isPast && appt.status !== 'Cancelled' ? `<span style="background:var(--bs-primary);color:white;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">${t('calendar.upcomingLabel', 'Upcoming')}</span>` : ''}
          </div>
          <div style="color:${colors.labelColor}; font-size:13px; font-weight:500;">
            ${formatDate(appt.startTime)}
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; align-items:center; gap:12px; color:${colors.textColor};">
            <div style="width:32px;height:32px;border-radius:8px;background:${colors.isDark ? '#334155' : '#f1f5f9'};display:flex;align-items:center;justify-content:center;color:var(--bs-primary);">
              <i class="bi bi-clock"></i>
            </div>
            <div style="font-weight:600;font-size:15px;">
              ${formatTime(appt.startTime)} <span style="color:${colors.labelColor};font-weight:400;margin:0 4px;">—</span> ${formatTime(appt.endTime)}
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:12px; color:${colors.textColor};">
             <div style="width:32px;height:32px;border-radius:8px;background:${colors.isDark ? '#334155' : '#f1f5f9'};display:flex;align-items:center;justify-content:center;color:${colors.labelColor};">
              <i class="bi bi-person-badge"></i>
            </div>
            <div style="font-size:14px;color:${colors.labelColor};">
              ${docName}
            </div>
          </div>

          ${appt.reason ? `
            <div style="margin-top:4px; padding:12px; background:${colors.isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc'}; border-radius:8px; border-left:3px solid ${colors.isDark ? '#475569' : '#cbd5e1'}; font-size:13px; color:${colors.textColor}; line-height:1.5;">
              <i class="bi bi-chat-left-text" style="color:${colors.labelColor};margin-right:6px;"></i> ${appt.reason}
            </div>
          ` : ''}
        </div>
      `;

      cardWrapper.appendChild(card);
      timeline.appendChild(cardWrapper);
    });

    list.appendChild(timeline);
  }

  panel.appendChild(header);
  panel.appendChild(list);

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'patient-history-overlay';
  overlay.style.cssText = getOverlayCSS(10004);

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  // Button hover effect
  const closeBtn = document.getElementById('closeHistoryPanel');
  if(closeBtn) {
    closeBtn.onmouseover = () => { closeBtn.style.background = 'rgba(220,53,69,0.1)'; closeBtn.style.color = '#dc3545'; };
    closeBtn.onmouseout = () => { closeBtn.style.background = 'rgba(148,163,184,0.1)'; closeBtn.style.color = colors.labelColor; };
  }

  // Animate in
  requestAnimationFrame(() => {
    panel.style.transform = 'translateX(0)';
  });

  const cleanup = () => {
    panel.style.transform = 'translateX(100%)';
    overlay.style.opacity = '0';
    setTimeout(() => {
      panel.remove();
      overlay.remove();
    }, 400);
  };

  // Close handlers
  document.getElementById('closeHistoryPanel')?.addEventListener('click', cleanup);
  overlay.addEventListener('click', cleanup);

  // Name link handler
  document.getElementById('historyPanelPatientName')?.addEventListener('click', (e) => {
    e.preventDefault();
    cleanup();
    window.dispatchEvent(new CustomEvent('dentisyn:navigate', { detail: { view: 'patients' } }));
    setTimeout(() => {
      import('../../../patient/PatientTab/events').then(({ openPatientCarton }) => {
        openPatientCarton(patientId);
      });
    }, 50);
  });
};
