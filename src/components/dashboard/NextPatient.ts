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

export function NextPatient(): string {
  const appointments = appointmentRepository.getAll();
  const today = new Date().toISOString().split('T')[0];
  
  const upcomingAppointments = appointments
    .filter(a => a.startTime.startsWith(today) && a.status !== 'Completed')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  if (upcomingAppointments.length === 0) {
    return `
      <div class="card shadow-sm border-0 rounded-4 h-100 overflow-hidden">
        <div class="card-body">
          <div class="bg-body-secondary rounded-3 px-3 py-2 d-inline-block mb-3">
            <h6 class="text-uppercase fw-semibold text-body mb-0" data-i18n="dashboard.nextPatient"></h6>
          </div>
          <div class="text-center text-muted">
            <p class="mt-3">No upcoming appointments today</p>
          </div>
        </div>
      </div>
    `;
  }
  
  const nextAppointment = upcomingAppointments[0];
  const timeStr = formatTime(nextAppointment.startTime, false);

  return `
    <div class="card shadow-sm border-0 rounded-4 h-100 overflow-hidden">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div class="bg-body-secondary rounded-3 px-3 py-2 d-inline-block">
              <h6 class="text-uppercase fw-semibold text-body mb-0" data-i18n="dashboard.nextPatient"></h6>
            </div>
            <div class="d-flex align-items-center gap-3 mt-3">
              <span class="badge text-bg-secondary rounded-circle p-3">
                <i class="bi bi-person-fill"></i>
              </span>
              <div>
                <h4 class="mb-1">${nextAppointment.patientName}</h4>
                <span class="text-muted">
                  <i class="bi bi-clock me-2"></i>
                  ${timeStr}
                </span>
              </div>
            </div>
          </div>
        </div>
        <p class="text-muted mb-4"><span data-i18n="dashboard.reason"></span> ${nextAppointment.reason || 'No reason specified'}</p>
        <button type="button" class="btn btn-primary" data-i18n="dashboard.openChart" id="openChartBtn" data-appointment-id="${nextAppointment.id}"></button>
      </div>
    </div>
  `;
}
