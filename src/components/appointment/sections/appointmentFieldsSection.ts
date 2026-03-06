import i18next from '../../../i18n';
import { toInputDate } from '../../../utils/dateUtils';
import { loadCalendarSettings } from '../../user/Settings/CalendarSettings/storage';

const t = (key: string, fb: string): string => i18next.t(key, fb) as string;

interface AppointmentFieldsOptions {
  clickedDate: Date;
  timeOptions: string;
  startTimeValue: string;
  endTimeValue: string;
}

/** Renders date, time, doctor, and reason fields HTML */
export function renderAppointmentFieldsSection(opts: AppointmentFieldsOptions): string {
  const { clickedDate, timeOptions, startTimeValue, endTimeValue } = opts;
  const settings = loadCalendarSettings();

  const selectOpts = (selected: string) =>
    timeOptions.split('\n').map(opt => {
      const match = opt.match(/value="([^"]+)"/);
      const value = match ? match[1] : '';
      return opt.replace('<option', `<option${value === selected ? ' selected' : ''}`);
    }).join('\n');

  return `
    <div class="row">
      <div class="col-md-6 mb-3">
        <label for="appointmentDate" class="form-label fw-bold"><span data-i18n="appointment.date">${t('appointment.date', 'Date')}</span><span class="text-danger ms-1">*</span></label>
        <input type="date" class="form-control" id="appointmentDate" value="${toInputDate(clickedDate)}" required>
      </div>
      <div class="col-md-3 mb-3">
        <label for="appointmentStartTime" class="form-label fw-bold"><span data-i18n="appointment.startTime">${t('appointment.startTime', 'Start Time')}</span><span class="text-danger ms-1">*</span></label>
        <select class="form-select" id="appointmentStartTime" required>${selectOpts(startTimeValue)}</select>
      </div>
      <div class="col-md-3 mb-3">
        <label for="appointmentEndTime" class="form-label fw-bold"><span data-i18n="appointment.endTime">${t('appointment.endTime', 'End Time')}</span><span class="text-danger ms-1">*</span></label>
        <select class="form-select" id="appointmentEndTime" required>${selectOpts(endTimeValue)}</select>
      </div>
    </div>
    <div class="mb-3">
      <label for="doctorSelect" class="form-label fw-bold"><span data-i18n="appointment.assignDoctor">${t('appointment.assignDoctor', 'Assign Doctor')}</span><span class="text-danger ms-1">*</span></label>
      <select class="form-select" id="doctorSelect" required>
        <option value="" disabled selected data-i18n="appointment.selectTimeFirst">${t('appointment.selectTimeFirst', 'Select time first...')}</option>
      </select>
      <small class="text-muted" id="doctorAvailabilityHint" data-i18n="appointment.doctorHint">${t('appointment.doctorHint', 'Available doctors will appear based on selected time')}</small>
    </div>
    
    ${settings.isReasonVisible ? `
    <div class="mb-3">
      <label for="appointmentReason" class="form-label fw-bold">
        <span data-i18n="appointment.reasonNotes">${t('appointment.reasonNotes', 'Reason')}</span>
        ${settings.isReasonRequired ? '<span class="text-danger ms-1">*</span>' : `<span class="badge bg-secondary ms-2" data-i18n="appointment.optional">${t('appointment.optional', 'Optional')}</span>`}
      </label>
      <input type="text" class="form-control" id="appointmentReason" list="reasonsList" 
        placeholder="${t('appointment.reasonPlaceholder', 'e.g., Regular checkup, Cleaning, Root canal...')}" 
        ${settings.isReasonRequired ? 'required' : ''}>
      <datalist id="reasonsList">
        ${settings.appointmentReasons.map(r => `<option value="${r}">`).join('')}
      </datalist>
      ${!settings.isReasonRequired ? `<small class="text-muted" data-i18n="appointment.leaveBlank">${t('appointment.leaveBlank', 'Leave blank if not specified')}</small>` : ''}
    </div>
    ` : ''}

    <div class="mb-3">
      <label for="appointmentNotes" class="form-label fw-bold">
        <span data-i18n="appointment.notes">${t('appointment.notes', 'Notes')}</span>
        ${settings.isNotesRequired ? '<span class="text-danger ms-1">*</span>' : `<span class="badge bg-secondary ms-2" data-i18n="appointment.optional">${t('appointment.optional', 'Optional')}</span>`}
      </label>
      <textarea class="form-control" id="appointmentNotes" rows="3"
        placeholder="${t('appointment.notesPlaceholder', 'Additional notes for the appointment...')}"
        ${settings.isNotesRequired ? 'required' : ''}></textarea>
    </div>
  `;
}
