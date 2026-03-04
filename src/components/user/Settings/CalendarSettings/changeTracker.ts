import type { CalendarSettings, DoctorSchedule } from './types';
import type { DateFormatPattern } from '../../../../utils/dateUtils';
import { loadCalendarSettings } from './storage';
import i18next from '../../../../i18n';

const t = (key: string, opts?: Record<string, string>) =>
  i18next.t(`settings.${key}`, opts) as string;

/** Human-readable description of one setting change */
export interface SettingChange {
  label: string;
}

/** Snapshot of the original settings taken when the page loads */
let originalSnapshot: CalendarSettings | null = null;

/** Store the original settings so we can diff later */
export const captureSnapshot = (): void => {
  originalSnapshot = structuredClone(loadCalendarSettings());
};

/** Read current form values into a CalendarSettings object */
export const readFormValues = (): CalendarSettings | null => {
  const form = document.getElementById('calendarSettingsForm') as HTMLFormElement | null;
  if (!form || !originalSnapshot) return null;

  const dateFormat = (form.querySelector('#dateFormat') as HTMLSelectElement)?.value as DateFormatPattern ?? originalSnapshot.dateFormat;
  const timeFormat = ((form.querySelector('input[name="timeFormat"]:checked') as HTMLInputElement)?.value ?? originalSnapshot.timeFormat) as '24h' | '12h';
  const slotDuration = parseInt((form.querySelector('#slotDuration') as HTMLSelectElement)?.value ?? '30', 10) as 15 | 30 | 60;

  const weekStartInput = form.querySelector('#weekStartDay') as HTMLSelectElement | null;
  const weekStartDay = weekStartInput
    ? (parseInt(weekStartInput.value, 10) as 0 | 1)
    : originalSnapshot.weekStartDay;

  const hiddenCbs = form.querySelectorAll<HTMLInputElement>('input[name="hiddenDays"]:checked');
  const hiddenDays = hiddenCbs.length > 0 || form.querySelector('input[name="hiddenDays"]')
    ? Array.from(hiddenCbs).map(cb => parseInt(cb.value, 10))
    : originalSnapshot.hiddenDays;

  const doctorSchedules: DoctorSchedule[] = originalSnapshot.doctorSchedules.map(s => {
    const st = (document.getElementById(`startTime-${s.doctorId}`) as HTMLInputElement)?.value ?? s.startTime;
    const et = (document.getElementById(`endTime-${s.doctorId}`) as HTMLInputElement)?.value ?? s.endTime;
    return { ...s, startTime: st, endTime: et };
  });

  const rejInput = document.getElementById('rejectionReasonsData') as HTMLInputElement | null;
  const rejectionReasons: string[] = rejInput
    ? JSON.parse(rejInput.value || '[]')
    : originalSnapshot.rejectionReasons;

  return { timeFormat, dateFormat, slotDuration, weekStartDay, hiddenDays, doctorSchedules, rejectionReasons };
};

/** Compare current form values against the snapshot and return a list of changes */
export const detectChanges = (): SettingChange[] => {
  if (!originalSnapshot) return [];
  const current = readFormValues();
  if (!current) return [];

  const changes: SettingChange[] = [];

  if (current.timeFormat !== originalSnapshot.timeFormat) {
    changes.push({ label: t('changeTimeFormat', { old: originalSnapshot.timeFormat, new: current.timeFormat }) });
  }
  if (current.dateFormat !== originalSnapshot.dateFormat) {
    changes.push({ label: t('changeDateFormat', { old: originalSnapshot.dateFormat, new: current.dateFormat }) });
  }
  if (current.slotDuration !== originalSnapshot.slotDuration) {
    changes.push({ label: t('changeSlotDuration', { old: String(originalSnapshot.slotDuration), new: String(current.slotDuration) }) });
  }

  current.doctorSchedules.forEach((ds, i) => {
    const orig = originalSnapshot!.doctorSchedules[i];
    if (!orig) return;
    if (ds.startTime !== orig.startTime) {
      changes.push({ label: t('changeDoctorStart', { doctor: ds.doctorName, old: orig.startTime, new: ds.startTime }) });
    }
    if (ds.endTime !== orig.endTime) {
      changes.push({ label: t('changeDoctorEnd', { doctor: ds.doctorName, old: orig.endTime, new: ds.endTime }) });
    }
  });

  const origRej = JSON.stringify(originalSnapshot.rejectionReasons);
  const curRej = JSON.stringify(current.rejectionReasons);
  if (origRej !== curRej) {
    changes.push({ label: t('changeRejectionReasons') });
  }

  return changes;
};

/** Returns true when the form has unsaved edits */
export const hasUnsavedChanges = (): boolean => detectChanges().length > 0;

/** After a successful save, re-capture so the form appears "clean" */
export const resetSnapshot = (): void => {
  captureSnapshot();
};

/** Build the HTML for the changes list used in confirmation modals */
export const buildChangesHTML = (changes: SettingChange[]): string => {
  if (changes.length === 0) return '';
  return `
    <p class="mb-2 fw-semibold">${t('changesListLabel')}</p>
    <ul class="list-unstyled mb-0">
      ${changes.map(c => `<li class="mb-1"><i class="bi bi-pencil-fill text-primary me-2"></i>${c.label}</li>`).join('')}
    </ul>
  `;
};
