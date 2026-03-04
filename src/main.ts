import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from './i18n';
import { Navbar } from './components/layout/Navbar';
import { QuickStats } from './components/dashboard/QuickStats';
import { NextPatient, setNextPatientDoctor, shiftNextPatient } from './components/dashboard/NextPatient';
import { PatientQueue, setupPatientQueueHandlers } from './components/dashboard/PatientQueue/index';
import { renderCalendarHTML } from './components/calendar/CalendarLayout';
import { initCalendar, refreshCalendarSettings, refreshCalendarLocale } from './components/calendar/CalendarLogic/index';
import { renderCalendarSettings, initCalendarSettings, setRefreshCallback } from './components/user/Settings/CalendarSettings/index';
import { renderSearchDropdown, setupGlobalSearch } from './components/search/PatientSearch';
import { renderPatientTab, initPatientTab } from './components/patient/PatientTab/index';
import { initializeTestData } from './utils/localhostData';

// Import Bootstrap and make it globally available
// @ts-ignore - Bootstrap doesn't have type declarations
import * as Bootstrap from 'bootstrap';

// Ensure Bootstrap is available on window
declare global {
    interface Window {
        bootstrap: typeof Bootstrap;
    }
}

// Make Bootstrap globally available BEFORE any other code runs
(window as unknown as Record<string, unknown>).bootstrap = Bootstrap;

type ThemeMode = 'light' | 'dark';
type LanguageMode = 'en' | 'bg';
type View = 'dashboard' | 'calendar' | 'settings' | 'patients';

const THEME_STORAGE_KEY = 'dentisyn-theme';
const LANG_STORAGE_KEY = 'dentisyn-language';
const rootElement = document.documentElement;

// ========== GLOBAL STATE ==========
let currentView: View = 'dashboard';

// ========== HELPER FUNCTIONS (Logic extraction) ==========

const applyTheme = (mode: ThemeMode) => {
    rootElement.setAttribute('data-bs-theme', mode);
};

const setupThemeHandlers = () => {
    const toggleButton = document.getElementById('theme-toggle') as HTMLButtonElement | null;
    const syncToggleLabel = (mode: ThemeMode) => {
        if (!toggleButton) return;
        toggleButton.innerHTML = mode === 'dark'
            ? '<span aria-hidden="true">☀️</span><span>Light</span>'
            : '<span aria-hidden="true">🌙</span><span>Dark</span>';
    };

    // Initial sync
    syncToggleLabel(rootElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light');

    toggleButton?.addEventListener('click', () => {
        const nextMode: ThemeMode = rootElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(nextMode);
        localStorage.setItem(THEME_STORAGE_KEY, nextMode);
        syncToggleLabel(nextMode);
    });
};

const setupLanguageHandlers = () => {
    const langToggleButton = document.getElementById('lang-toggle') as HTMLButtonElement | null;
    const updateLangButtonText = (lang: LanguageMode) => {
        if (!langToggleButton) return;
        langToggleButton.textContent = lang === 'bg' ? 'EN' : 'BG';
    };

    // Set the HTML lang attribute so browsers render date inputs in the correct locale
    const applyLang = (lang: LanguageMode) => {
        document.documentElement.lang = lang === 'bg' ? 'bg' : 'en';
    };

    applyLang(i18next.language as LanguageMode);
    updateLangButtonText(i18next.language as LanguageMode);

    langToggleButton?.addEventListener('click', () => {
        const nextLang: LanguageMode = i18next.language === 'bg' ? 'en' : 'bg';
        i18next.changeLanguage(nextLang);
        localStorage.setItem(LANG_STORAGE_KEY, nextLang);
        applyLang(nextLang);
        updateLangButtonText(nextLang);
        renderTranslations();
        
        // Update calendar locale if calendar is visible
        if (refreshCalendarLocale) {
            refreshCalendarLocale();
        }
    });
};

// Function to render all translations
const renderTranslations = () => {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach((element) => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.textContent = i18next.t(key);
        }
    });
};

// Named handler so it can be removed before re-adding on each renderApp()
const closeSubmenusOnOutsideClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu .dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
};

// Setup nested dropdown hover behavior
const setupNestedDropdowns = () => {
    const settingsDropdownToggle = document.getElementById('settingsDropdownToggle') as HTMLElement;

    if (settingsDropdownToggle) {
        // Handle click on Settings to toggle submenu (works for both mobile and desktop)
        settingsDropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const parentLi = settingsDropdownToggle.closest('li.dropdown') as HTMLElement;
            const submenu = parentLi?.querySelector('ul.dropdown-menu') as HTMLElement;

            if (submenu) {
                const isVisible = submenu.classList.contains('show');

                // Close all other submenus
                document.querySelectorAll('.dropdown-menu .dropdown-menu.show').forEach(menu => {
                    if (menu !== submenu) {
                        menu.classList.remove('show');
                    }
                });

                // Toggle this submenu
                if (isVisible) {
                    submenu.classList.remove('show');
                } else {
                    submenu.classList.add('show');
                }
            }
        });
    }

    // Remove previous listener before adding to prevent accumulation across renderApp() calls
    document.removeEventListener('click', closeSubmenusOnOutsideClick);
    document.addEventListener('click', closeSubmenusOnOutsideClick);
};

const setupNavigationHandlers = () => {
    const dashboardLink = document.querySelector('[data-i18n="nav.dashboard"]') as HTMLAnchorElement;
    const calendarLink = document.querySelector('[data-i18n="nav.calendar"]') as HTMLAnchorElement;
    const patientsLink = document.querySelector('[data-i18n="nav.patients"]') as HTMLAnchorElement;
    const settingsLink = document.getElementById('navCalendarSettings') as HTMLAnchorElement;

    // Helper to set active class
    const updateActiveState = (view: View) => {
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        if (view === 'dashboard') dashboardLink?.classList.add('active');
        if (view === 'calendar') calendarLink?.classList.add('active');
        if (view === 'patients') patientsLink?.classList.add('active');
        // Settings doesn't highlight main nav
    };

    // Set initial active state
    updateActiveState(currentView);

    dashboardLink?.addEventListener('click', (e) => {
        e.preventDefault();
        renderApp('dashboard');
    });

    calendarLink?.addEventListener('click', (e) => {
        e.preventDefault();
        renderApp('calendar');
    });

    patientsLink?.addEventListener('click', (e) => {
        e.preventDefault();
        renderApp('patients');
    });

    settingsLink?.addEventListener('click', (e) => {
        e.preventDefault();
        renderApp('settings');
    });
};

const setupDashboardHandlers = () => {
    // Patient Queue handles its own events
    setupPatientQueueHandlers();

    // ── NextPatient: doctor filter pills ──
    document.querySelectorAll('.next-patient-doc-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            const doctor = (btn as HTMLElement).dataset.doctor ?? 'all';
            setNextPatientDoctor(doctor);
            rerenderNextPatient();
        });
    });

    // ── NextPatient: arrow navigation ──
    document.getElementById('nextPatientPrev')?.addEventListener('click', () => {
        shiftNextPatient(-1);
        rerenderNextPatient();
    });
    document.getElementById('nextPatientNext')?.addEventListener('click', () => {
        shiftNextPatient(1);
        rerenderNextPatient();
    });

    // ── NextPatient: note expand/collapse ──
    setupNoteExpandHandlers();
};

/** Setup expand/collapse handlers for truncated notes in NextPatient cards */
const setupNoteExpandHandlers = () => {
    document.querySelectorAll('.note-expand-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const noteId = (btn as HTMLElement).dataset.noteId;
            const container = document.querySelector(`.next-patient-note[data-note-id="${noteId}"]`);
            if (!container) return;
            container.querySelector('.note-truncated')?.classList.add('d-none');
            container.querySelector('.note-full')?.classList.remove('d-none');
        });
    });
    document.querySelectorAll('.note-collapse-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const noteId = (btn as HTMLElement).dataset.noteId;
            const container = document.querySelector(`.next-patient-note[data-note-id="${noteId}"]`);
            if (!container) return;
            container.querySelector('.note-truncated')?.classList.remove('d-none');
            container.querySelector('.note-full')?.classList.add('d-none');
        });
    });
};

/** Re-render the NextPatient section in place and reattach its handlers */
const rerenderNextPatient = () => {
    const section = document.getElementById('nextPatientSection');
    if (!section) return;
    const parent = section.parentElement;
    if (!parent) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = NextPatient();
    const newSection = tmp.firstElementChild as HTMLElement;
    parent.replaceChild(newSection, section);
    // Reattach only NextPatient handlers
    document.querySelectorAll('.next-patient-doc-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            const doctor = (btn as HTMLElement).dataset.doctor ?? 'all';
            setNextPatientDoctor(doctor);
            rerenderNextPatient();
        });
    });
    document.getElementById('nextPatientPrev')?.addEventListener('click', () => {
        shiftNextPatient(-1);
        rerenderNextPatient();
    });
    document.getElementById('nextPatientNext')?.addEventListener('click', () => {
        shiftNextPatient(1);
        rerenderNextPatient();
    });
    setupNoteExpandHandlers();
    renderTranslations();
};

// ========== RENDER UI COMPONENTS ==========
const renderApp = (view: View = 'dashboard') => {
    currentView = view;
    const appElement = document.querySelector<HTMLDivElement>('#app');
    if (!appElement) return;

    let mainContent = '';

    if (view === 'dashboard') {
        mainContent = `
        <main class="container py-4">
			<div class="row g-4 mb-4">
				<div class="col-lg-4">
					${QuickStats()}
				</div>
				<div class="col-lg-8">
					${NextPatient()}
				</div>
			</div>
			${PatientQueue()}
		</main>`;
    } else if (view === 'calendar') {
        const calendarHTML = renderCalendarHTML();
        mainContent = `
        <main class="container py-4">
            ${calendarHTML}
        </main>`;
    } else if (view === 'settings') {
        const settingsHTML = renderCalendarSettings();
        mainContent = `
        <main class="container py-4">
            ${settingsHTML}
        </main>`;
    } else if (view === 'patients') {
        const patientsHTML = renderPatientTab();
        mainContent = `
        <main class="container py-4">
            ${patientsHTML}
        </main>`;
    }

    appElement.innerHTML = `
		${Navbar()}
		${mainContent}
		${renderSearchDropdown()}
	`;

    // Re-attach all global handlers since DOM was wiped
    setupThemeHandlers();
    setupLanguageHandlers();
    setupNavigationHandlers();
    setupNestedDropdowns();
    setupGlobalSearch(
        () => currentView,
        (view) => renderApp(view as View)
    );
    renderTranslations();

    // Dashboard button handlers
    if (view === 'dashboard') {
        setupDashboardHandlers();
    }

    // Specific Module Initialization
    if (view === 'calendar') {
        initCalendar();
        // Wire up the refresh callback for settings
        setRefreshCallback(refreshCalendarSettings);
    } else if (view === 'settings') {
        initCalendarSettings();
        // Wire up the refresh callback for settings
        setRefreshCallback(refreshCalendarSettings);
    } else if (view === 'patients') {
        initPatientTab();
    }
};

// ========== INITIALIZATION ==========

// Initialize test data from localhost folder
initializeTestData();

// Initialize theme from localStorage
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
if (savedTheme === 'light' || savedTheme === 'dark') {
    applyTheme(savedTheme);
} else {
    applyTheme('light');
}

// Initialize language from localStorage
const savedLanguage = localStorage.getItem(LANG_STORAGE_KEY);
if (savedLanguage === 'en' || savedLanguage === 'bg') {
    i18next.changeLanguage(savedLanguage);
} else {
    i18next.changeLanguage('bg');
}

// Listen for programmatic navigation (e.g. from PatientQueue "New Appointment")
window.addEventListener('dentisyn:navigate', ((e: CustomEvent<{ view: View }>) => {
    renderApp(e.detail.view);
}) as EventListener);

// Initial Render
renderApp('dashboard');
