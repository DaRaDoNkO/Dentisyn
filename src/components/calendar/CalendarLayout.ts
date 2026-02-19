
export const renderCalendarHTML = (): string => {
  return `
    <div class="card shadow border-0 h-100">
      <div class="card-header d-flex flex-wrap justify-content-between align-items-center py-3 border-bottom">
        <div class="d-flex align-items-center gap-3">
            <h5 class="mb-0" data-i18n="nav.calendar">Calendar</h5>
        </div>
        
        <div class="d-flex flex-wrap text-nowrap gap-2 align-items-center">
             <!-- Doctor Filters -->
            <div class="me-3 d-flex align-items-center gap-3">
                <div class="form-check">
                    <input class="form-check-input doctor-filter" type="checkbox" value="dr-ivanov" id="filterIvanov" checked>
                    <label class="form-check-label fw-bold" style="color: #198754;" for="filterIvanov">
                        <span data-i18n="calendar.drIvanov">Dr. Ivanov</span>
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input doctor-filter" type="checkbox" value="dr-ruseva" id="filterRuseva" checked>
                    <label class="form-check-label fw-bold" style="color: #0d6efd;" for="filterRuseva">
                        <span data-i18n="calendar.drRuseva">Dr. Ruseva</span>
                    </label>
                </div>
            </div>

            <!-- View Switcher -->
             <div class="btn-group" role="group">
                <button type="button" class="btn btn-outline-secondary active" id="view-timeGridWeek" data-i18n="calendar.week">Week</button>
                <button type="button" class="btn btn-outline-secondary" id="view-dayGridMonth" data-i18n="calendar.month">Month</button>
                <button type="button" class="btn btn-outline-secondary" id="view-listWeek" data-i18n="calendar.list">List</button>
            </div>
        </div>
      </div>
      <div class="card-body p-0">
         <div id="calendar"></div>
      </div>
    </div>
  `;
};
