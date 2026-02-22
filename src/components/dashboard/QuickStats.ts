import { appointmentRepository } from '../../repositories/appointmentRepository';

export function QuickStats(): string {
  const appointments = appointmentRepository.getAll();
  const today = new Date().toISOString().split('T')[0];
  
  const todayCount = appointments.filter(a => 
    a.startTime.startsWith(today)
  ).length;
  
  const urgentCount = appointments.filter(a => 
    a.startTime.startsWith(today) && a.status === 'Waiting'
  ).length;
  
  const completedCount = appointments.filter(a => 
    a.status === 'Completed'
  ).length;

  return `
    <div class="card shadow-sm border-0 rounded-4 h-100 overflow-hidden">
      <div class="card-body">
        <div class="bg-body-secondary rounded-3 px-3 py-2 mb-4">
          <h6 class="text-uppercase fw-semibold text-body mb-0" data-i18n="dashboard.quickStats"></h6>
        </div>
        <div class="row row-cols-1 row-cols-md-3 text-center g-3">
          <div class="col">
            <div class="d-flex flex-column align-items-center gap-2">
              <span class="stat-icon text-primary bg-primary-subtle">
                <i class="bi bi-calendar-check"></i>
              </span>
              <span class="text-uppercase text-muted small" data-i18n="dashboard.today"></span>
              <span class="fs-3 fw-bold text-primary">${todayCount}</span>
            </div>
          </div>
          <div class="col">
            <div class="d-flex flex-column align-items-center gap-2">
              <span class="stat-icon text-warning bg-warning-subtle">
                <i class="bi bi-exclamation-triangle"></i>
              </span>
              <span class="text-uppercase text-muted small" data-i18n="dashboard.urgent"></span>
              <span class="fs-3 fw-bold text-warning">${urgentCount}</span>
            </div>
          </div>
          <div class="col">
            <div class="d-flex flex-column align-items-center gap-2">
              <span class="stat-icon text-success bg-success-subtle">
                <i class="bi bi-check-circle"></i>
              </span>
              <span class="text-uppercase text-muted small" data-i18n="dashboard.completed"></span>
              <span class="fs-3 fw-bold text-success">${completedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
