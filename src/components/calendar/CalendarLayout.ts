
export const renderCalendarHTML = (): string => {
  return `
    <div class="card shadow-sm border-0 h-100" style="border-radius: 12px; overflow: hidden;">
      <div class="card-header d-flex flex-wrap justify-content-between align-items-center py-3" style="border-bottom: 1px solid rgba(0,0,0,0.06); background: transparent;">
        <div class="d-flex align-items-center gap-3">
            <h5 class="mb-0 fw-bold" data-i18n="nav.calendar">Calendar</h5>
            <button type="button" class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" id="unconfirmedPanelBtn"
              style="border-radius: 20px; padding: 4px 14px; font-size: 0.82rem;">
              <i class="bi bi-exclamation-circle"></i>
              <span data-i18n="calendar.unconfirmedBtn">Unconfirmed</span>
              <span class="badge bg-danger ms-1" id="unconfirmedCount" style="font-size:0.7rem;min-width:20px;">0</span>
            </button>
        </div>
        
        <div class="d-flex flex-wrap text-nowrap gap-2 align-items-center">
             <!-- Doctor Filters -->
            <div class="me-3 d-flex align-items-center gap-3">
                <div class="form-check">
                    <input class="form-check-input doctor-filter" type="checkbox" value="dr-ivanov" id="filterIvanov" checked style="border-color: #16a34a;">
                    <label class="form-check-label fw-bold" style="color: #16a34a; font-size: 0.88rem;" for="filterIvanov">
                        <span data-i18n="calendar.drIvanov">Dr. Ivanov</span>
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input doctor-filter" type="checkbox" value="dr-ruseva" id="filterRuseva" checked style="border-color: #2563eb;">
                    <label class="form-check-label fw-bold" style="color: #2563eb; font-size: 0.88rem;" for="filterRuseva">
                        <span data-i18n="calendar.drRuseva">Dr. Ruseva</span>
                    </label>
                </div>
            </div>

            <!-- View Switcher -->
             <div class="btn-group" role="group">
                <button type="button" class="btn btn-outline-secondary btn-sm active" id="view-timeGridWeek" data-i18n="calendar.week">Week</button>
                <button type="button" class="btn btn-outline-secondary btn-sm" id="view-dayGridMonth" data-i18n="calendar.month">Month</button>
                <button type="button" class="btn btn-outline-secondary btn-sm" id="view-listWeek" data-i18n="calendar.list">List</button>
            </div>
        </div>
      </div>
      <div class="card-body p-0">
         <div id="calendar" style="padding: 4px;"></div>
      </div>
    </div>
  `;
};
