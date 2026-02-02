export function Navbar(): string {
  return `
    <nav class="navbar navbar-expand-lg bg-body border-bottom shadow-sm py-3">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="#">
          <span class="badge text-bg-primary rounded-circle p-3">DS</span>
          <span>DentiSyn</span>
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#primaryNav"
          aria-controls="primaryNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="primaryNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link active fw-semibold" aria-current="page" href="#" data-i18n="nav.dashboard"></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" data-i18n="nav.patients"></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#" data-i18n="nav.calendar"></a>
            </li>
          </ul>
          <ul class="navbar-nav ms-auto align-items-lg-center gap-2">
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center gap-2"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-person-circle fs-5"></i>
                <span>User</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#">Profile</a></li>
                <li class="dropdown dropstart">
                  <a class="dropdown-item dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-gear me-2"></i>Settings
                  </a>
                  <ul class="dropdown-menu dropdown-menu-mobile-right">
                    <li><a class="dropdown-item" href="#" id="navCalendarSettings">
                      <i class="bi bi-calendar3 me-2"></i>Calendar
                    </a></li>
                  </ul>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a class="dropdown-item" href="#" id="lang-toggle">
                    <i class="bi bi-translate me-2"></i>Language
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" id="theme-toggle">
                    <i class="bi bi-moon me-2"></i>Dark Mode
                  </a>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li><a class="dropdown-item" href="#">Logout</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `;
}
