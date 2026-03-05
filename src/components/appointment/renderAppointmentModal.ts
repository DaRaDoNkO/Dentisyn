/**
 * Appointment modal HTML template renderer
 */

import { generateTimeOptions } from './timeUtils';
import { loadCalendarSettings } from '../user/Settings/CalendarSettings/index';
import { renderPatientSearchSection } from './sections/patientSearchSection';
import { renderNewPatientFormSection } from './sections/newPatientFormSection';
import { renderAppointmentFieldsSection } from './sections/appointmentFieldsSection';

export const renderAppointmentModal = (clickedDateISO: string): string => {
  const clickedDate = new Date(clickedDateISO);
  const defaultEndTime = new Date(clickedDate.getTime() + 30 * 60000);

  const settings = loadCalendarSettings();
  const is24h = settings.timeFormat === '24h';
  const timeOptions = generateTimeOptions(8, 20, 15, is24h);

  const startTimeValue = `${String(clickedDate.getHours()).padStart(2, '0')}:${String(clickedDate.getMinutes()).padStart(2, '0')}`;
  const endTimeValue = `${String(defaultEndTime.getHours()).padStart(2, '0')}:${String(defaultEndTime.getMinutes()).padStart(2, '0')}`;

  return `
    <div class="modal fade" id="appointmentModal" tabindex="-1" aria-labelledby="appointmentModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="appointmentModalLabel" data-i18n="appointment.newAppointment">New Appointment</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="appointmentForm">
              ${renderPatientSearchSection()}
              ${renderNewPatientFormSection()}
              ${renderAppointmentFieldsSection({ clickedDate, timeOptions, startTimeValue, endTimeValue })}
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-1"></i> <span data-i18n="appointment.cancel"></span>
            </button>
            <button type="button" class="btn btn-primary" id="saveAppointmentBtn">
              <i class="bi bi-check-circle me-1"></i> <span data-i18n="appointment.save"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};
