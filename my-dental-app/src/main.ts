import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from './i18n';
import { Navbar } from './components/layout/Navbar';
import { QuickStats } from './components/dashboard/QuickStats';
import { NextPatient } from './components/dashboard/NextPatient';
import { PatientQueue } from './components/dashboard/PatientQueue';
import { renderCalendarHTML } from './components/calendar/CalendarLayout';
import { initCalendar, refreshCalendarSettings } from './components/calendar/CalendarLogic';
import { renderCalendarSettings, initCalendarSettings, setRefreshCallback } from './components/settings/CalendarSettings/index';

// Import Bootstrap and make it globally available
// @ts-ignore - Bootstrap doesn't have type declarations
import * as Bootstrap from 'bootstrap';

// Ensure Bootstrap is available on window
declare global {
  interface Window {
    bootstrap: any;
  }
}

// Make Bootstrap globally available BEFORE any other code runs
(window as any).bootstrap = Bootstrap;

type ThemeMode = 'light' | 'dark';
type LanguageMode = 'en' | 'bg';
type View = 'dashboard' | 'calendar' | 'settings';

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

    updateLangButtonText(i18next.language as LanguageMode);

    langToggleButton?.addEventListener('click', () => {
        const nextLang: LanguageMode = i18next.language === 'bg' ? 'en' : 'bg';
        i18next.changeLanguage(nextLang);
        localStorage.setItem(LANG_STORAGE_KEY, nextLang);
        updateLangButtonText(nextLang);
        renderTranslations();
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

const setupNavigationHandlers = () => {
    const dashboardLink = document.querySelector('[data-i18n="nav.dashboard"]') as HTMLAnchorElement;
    const calendarLink = document.querySelector('[data-i18n="nav.calendar"]') as HTMLAnchorElement;
    const settingsLink = document.getElementById('navCalendarSettings') as HTMLAnchorElement;

    // Helper to set active class
    const updateActiveState = (view: View) => {
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        if (view === 'dashboard') dashboardLink?.classList.add('active');
        if (view === 'calendar') calendarLink?.classList.add('active');
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
    
    settingsLink?.addEventListener('click', (e) => {
        e.preventDefault();
        renderApp('settings');
    });
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
    }

	appElement.innerHTML = `
		${Navbar()}
		${mainContent}
	`;

    // Re-attach all global handlers since DOM was wiped
    setupThemeHandlers();
    setupLanguageHandlers();
    setupNavigationHandlers();
    renderTranslations();

    // Specific Module Initialization
    if (view === 'calendar') {
        initCalendar();
        // Wire up the refresh callback for settings
        setRefreshCallback(refreshCalendarSettings);
    } else if (view === 'settings') {
        initCalendarSettings();
        // Wire up the refresh callback for settings
        setRefreshCallback(refreshCalendarSettings);
    }
};

// ========== INITIALIZATION ==========

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

// Initial Render
renderApp('dashboard');
