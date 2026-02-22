import { appointmentRepository } from '../../repositories/appointmentRepository';

function formatTime(isoString: string, is24h: boolean = true): string {
  try {
    const date = new Date(isoString);
    if (is24h) {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  } catch {
    return isoString;
  }
}

function getStatusBadge(status: string): string {
  switch (status) {
    case 'Completed':
      return `<span class="badge bg-success-subtle text-success-emphasis d-inline-flex align-items-center gap-2 rounded-pill queue-status">
        <i class="bi bi-check-circle-fill"></i>
        <span data-i18n="status.completed"></span>
      </span>`;
    case 'Waiting':
      return `<span class="badge bg-warning-subtle text-warning-emphasis d-inline-flex align-items-center gap-2 rounded-pill queue-status">
        <i class="bi bi-hourglass-split"></i>
        <span data-i18n="status.waiting"></span>
      </span>`;
    case 'Confirmed':
    default:
      return `<span class="badge bg-info-subtle text-info-emphasis d-inline-flex align-items-center gap-2 rounded-pill queue-status">
        <i class="bi bi-calendar-event"></i>
        <span data-i18n="status.confirmed"></span>
      </span>`;
  }
}

function getActionButtons(appointment: any): string {
  if (appointment.status === 'Completed') {
    return `
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-sm btn-outline-primary view-patient" data-appointment-id="${appointment.id}">
          <i class="bi bi-eye"></i> <span data-i18n="table.view"></span>
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary billing-patient" data-appointment-id="${appointment.id}">
          <i class="bi bi-receipt"></i> <span data-i18n="table.billing"></span>
        </button>
      </div>
    `;
  } else if (appointment.status === 'Waiting') {
    return `
      <button type="button" class="btn btn-sm btn-primary check-in-patient" data-appointment-id="${appointment.id}">
        <i class="bi bi-check-lg"></i> <span data-i18n="table.checkIn"></span>
      </button>
    `;
  } else {
    return `
      <button type="button" class="btn btn-sm btn-outline-danger cancel-appointment" data-appointment-id="${appointment.id}">
        <i class="bi bi-x-circle"></i> <span data-i18n="table.cancel"></span>
      </button>
    `;
  }
}

export function PatientQueue(): string {
  const appointments = appointmentRepository.getAll();
  const today = new Date().toISOString().split('T')[0];
  
  const todayAppointments = appointments
    .filter(a => a.startTime.startsWith(today))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const rows = todayAppointments.map(appt => `
    <tr>
      <td>${appt.patientName}</td>
      <td>${formatTime(appt.startTime, false)}</td>
      <td>
        ${getStatusBadge(appt.status)}
      </td>
      <td>
        ${getActionButtons(appt)}
      </td>
    </tr>
  `).join('');

  return `
    <section class="card shadow-sm border-0 rounded-4 overflow-hidden">
      <div class="card-header bg-body-secondary border-0 py-3">
        <h6 class="mb-0 text-uppercase fw-semibold text-body" data-i18n="dashboard.patientQueue"></h6>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-body-tertiary border-bottom border-light-subtle text-uppercase small text-body-secondary">
              <tr>
                <th scope="col" data-i18n="table.name"></th>
                <th scope="col" data-i18n="table.time"></th>
                <th scope="col" data-i18n="table.status"></th>
                <th scope="col" data-i18n="table.actions"></th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="4" class="text-center text-muted py-4">No appointments today</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}
