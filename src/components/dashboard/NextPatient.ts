export function NextPatient(): string {
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
                <h4 class="mb-1">Sarah Jenkins</h4>
                <span class="text-muted">
                  <i class="bi bi-clock me-2"></i>
                  10:30 AM
                </span>
              </div>
            </div>
          </div>
        </div>
        <p class="text-muted mb-4"><span data-i18n="dashboard.reason"></span> Root Canal (Follow-up)</p>
        <button type="button" class="btn btn-primary" data-i18n="dashboard.openChart"></button>
      </div>
    </div>
  `;
}
