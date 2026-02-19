export function PatientQueue(): string {
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
              <tr>
                <td>John Doe</td>
                <td>09:00 AM</td>
                <td>
                  <span class="badge bg-success-subtle text-success-emphasis d-inline-flex align-items-center gap-2 rounded-pill queue-status">
                    <i class="bi bi-check-circle-fill"></i>
                    <span data-i18n="status.completed"></span>
                  </span>
                </td>
                <td>
                  <div class="d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary" data-i18n="table.view"></button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-i18n="table.billing"></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Sarah Jenkins</td>
                <td>10:30 AM</td>
                <td>
                  <span class="badge bg-warning-subtle text-warning-emphasis d-inline-flex align-items-center gap-2 rounded-pill queue-status">
                    <i class="bi bi-hourglass-split"></i>
                    <span data-i18n="status.waiting"></span>
                  </span>
                </td>
                <td>
                  <button type="button" class="btn btn-sm btn-primary" data-i18n="table.checkIn"></button>
                </td>
              </tr>
              <tr>
                <td>Mike Ross</td>
                <td>11:15 AM</td>
                <td>
                  <span class="badge bg-info-subtle text-info-emphasis d-inline-flex align-items-center gap-2 rounded-pill queue-status">
                    <i class="bi bi-calendar-event"></i>
                    <span data-i18n="status.confirmed"></span>
                  </span>
                </td>
                <td>
                  <button type="button" class="btn btn-sm btn-outline-danger" data-i18n="table.cancel"></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}
