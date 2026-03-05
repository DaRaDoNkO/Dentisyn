import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from './i18n';
import { Navbar } from './components/layout/Navbar';
import { QuickStats } from './components/dashboard/QuickStats';
import { NextPatient } from './components/dashboard/NextPatient';
import { PatientQueue } from './components/dashboard/PatientQueue/index';
import { renderCalendarHTML } from './components/calendar/CalendarLayout';
import { initCalendar, refreshCalendarSettings, refreshCalendarLocale } from './components/calendar/CalendarLogic/index';
import { renderCalendarSettings, initCalendarSettings, setRefreshCallback, checkUnsavedChanges } from './components/user/Settings/CalendarSettings/index';
import { renderSearchDropdown, setupGlobalSearch } from './components/search/PatientSearch';
import { renderPatientTab, initPatientTab } from './components/patient/PatientTab/index';
import { initializeTestData } from './utils/localhostData';
import { applyTheme, setupThemeHandlers, setupLanguageHandlers, renderTranslations, THEME_STORAGE_KEY, LANG_STORAGE_KEY } from './app/themeHandlers';
import { setupNestedDropdowns, setupNavigationHandlers, type View } from './app/navigationHandlers';
import { setupDashboardHandlers } from './app/dashboardHandlers';

// @ts-ignore - Bootstrap doesn't have type declarations
import * as Bootstrap from 'bootstrap';
declare global { interface Window { bootstrap: typeof Bootstrap; } }
(window as unknown as Record<string, unknown>).bootstrap = Bootstrap;

let currentView: View = 'dashboard';

const renderApp = (view: View = 'dashboard'): void => {
    currentView = view;
    const appElement = document.querySelector<HTMLDivElement>('#app');
    if (!appElement) return;

    let mainContent = '';
    if (view === 'dashboard') {
        mainContent = `
        <main class="container py-4">
            <div class="row g-4 mb-4">
                <div class="col-lg-4">${QuickStats()}</div>
                <div class="col-lg-8">${NextPatient()}</div>
            </div>
            ${PatientQueue()}
        </main>`;
    } else if (view === 'calendar') {
        mainContent = `<main class="container py-4">${renderCalendarHTML()}</main>`;
    } else if (view === 'settings') {
        mainContent = `<main class="container py-4">${renderCalendarSettings()}</main>`;
    } else if (view === 'patients') {
        mainContent = `<main class="container py-4">${renderPatientTab()}</main>`;
    }

    appElement.innerHTML = `${Navbar()}${mainContent}${renderSearchDropdown()}`;

    setupThemeHandlers();
    setupLanguageHandlers(renderTranslations, refreshCalendarLocale);
    setupNavigationHandlers(() => currentView, checkUnsavedChanges, renderApp);
    setupNestedDropdowns();
    setupGlobalSearch(() => currentView, (v) => renderApp(v as View));
    renderTranslations();

    if (view === 'dashboard') {
        setupDashboardHandlers();
    } else if (view === 'calendar') {
        initCalendar();
        setRefreshCallback(refreshCalendarSettings);
    } else if (view === 'settings') {
        initCalendarSettings();
        setRefreshCallback(refreshCalendarSettings);
    } else if (view === 'patients') {
        initPatientTab();
    }
};

// ── Initialization ──────────────────────────────────────────────────────────
initializeTestData();

const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
applyTheme((savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light');

const savedLanguage = localStorage.getItem(LANG_STORAGE_KEY);
i18next.changeLanguage((savedLanguage === 'en' || savedLanguage === 'bg') ? savedLanguage : 'bg');

window.addEventListener('dentisyn:navigate', ((e: CustomEvent<{ view: View }>) => {
    const target = e.detail.view;
    const doNavigate = async () => {
        if (currentView === 'settings' && target !== 'settings') {
            const result = await checkUnsavedChanges();
            if (result === 'stay') return;
        }
        renderApp(target);
    };
    doNavigate();
}) as EventListener);

renderApp('dashboard');
