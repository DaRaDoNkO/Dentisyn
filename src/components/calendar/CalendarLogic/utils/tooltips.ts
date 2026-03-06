/**
 * Tooltip rendering and positioning logic
 */

import { formatTime } from '../../../../utils/dateUtils';
import type { EventHoveringArg } from '@fullcalendar/core';
import i18next from '../../../../i18n';
import { TOOLTIP_DELAY_MS } from '../config/constants';

const t = (key: string, fb: string) => i18next.t(key, fb);

let tooltipElement: HTMLElement | null = null;
let tooltipTimeout: ReturnType<typeof setTimeout> | null = null;

export const initializeTooltip = (): HTMLElement => {
  let tooltip = document.getElementById('calendar-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'calendar-tooltip';
    document.body.appendChild(tooltip);
  }
  tooltipElement = tooltip;
  return tooltip;
};

export const showTooltip = (info: EventHoveringArg): void => {
  if (!tooltipElement) return;

  // Clear any existing timeout
  if (tooltipTimeout) clearTimeout(tooltipTimeout);

  // Set timeout for delayed show
  tooltipTimeout = setTimeout(() => {
    if (!tooltipElement) return;

    const event = info.event;
    const doctor = event.extendedProps.doctor === 'dr-ivanov'
      ? t('calendar.drIvanov', 'Dr. Ivanov')
      : t('calendar.drRuseva', 'Dr. Ruseva');
    const reason = event.extendedProps.reason || event.title;
    const notes = event.extendedProps.notes;
    const time = `${formatTime(event.start ?? new Date())} - ${formatTime(event.end ?? new Date())}`;

    tooltipElement.innerHTML = `
      <h6>${event.extendedProps.patientName || t('calendar.patient', 'Patient')}</h6>
      <p><strong>${t('calendar.tooltipReason', 'Reason')}:</strong> ${reason}</p>
      ${notes ? `<p><strong>${t('calendar.tooltipNotes', 'Notes')}:</strong> ${notes}</p>` : ''}
      <p><strong>${t('calendar.tooltipDoctor', 'Doctor')}:</strong> ${doctor}</p>
      <p class="mt-1 text-primary"><i class="bi bi-clock"></i> ${time}</p>
    `;

    // Position tooltip
    const rect = info.el.getBoundingClientRect();
    let top = rect.top;
    let left = rect.right + 10;

    if (left + 300 > window.innerWidth) {
      left = rect.left - 310;
    }

    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
    tooltipElement.classList.add('visible');
  }, TOOLTIP_DELAY_MS);
};

export const hideTooltip = (): void => {
  if (tooltipTimeout) clearTimeout(tooltipTimeout);
  if (tooltipElement) tooltipElement.classList.remove('visible');
};
