/**
 * View switcher buttons initialization
 */

import type { Calendar } from '@fullcalendar/core';
import { VIEW_NAMES } from '../config/constants';

export const setupViewSwitcher = (calendar: Calendar): void => {
  VIEW_NAMES.forEach(viewName => {
    const btn = document.getElementById(`view-${viewName}`);
    if (btn) {
      btn.addEventListener('click', () => {
        calendar.changeView(viewName);
        VIEW_NAMES.forEach(v => {
          const el = document.getElementById(`view-${v}`);
          if (el) el.classList.remove('active');
        });
        btn.classList.add('active');
      });
    }
  });
};
