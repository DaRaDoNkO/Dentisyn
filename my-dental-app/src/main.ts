import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import i18next from './i18n';

type ThemeMode = 'light' | 'dark';
type LanguageMode = 'en' | 'bg';

const THEME_STORAGE_KEY = 'dentisyn-theme';
const LANG_STORAGE_KEY = 'dentisyn-language';
const rootElement = document.documentElement;

// ========== THEME MANAGEMENT ==========
const applyTheme = (mode: ThemeMode) => {
	rootElement.setAttribute('data-bs-theme', mode);
};

// Initialize theme from localStorage
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
if (savedTheme === 'light' || savedTheme === 'dark') {
	applyTheme(savedTheme);
} else {
	applyTheme('light');
}

const toggleButton = document.getElementById('theme-toggle') as HTMLButtonElement | null;

const syncToggleLabel = (mode: ThemeMode) => {
	if (!toggleButton) return;
	toggleButton.innerHTML = mode === 'dark'
		? '<span aria-hidden="true">☀️</span><span>Light</span>'
		: '<span aria-hidden="true">🌙</span><span>Dark</span>';
};

syncToggleLabel(rootElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light');

toggleButton?.addEventListener('click', () => {
	const nextMode: ThemeMode = rootElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
	applyTheme(nextMode);
	localStorage.setItem(THEME_STORAGE_KEY, nextMode);
	syncToggleLabel(nextMode);
});

// ========== INTERNATIONALIZATION (i18n) ==========

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

// Initialize language from localStorage
const savedLanguage = localStorage.getItem(LANG_STORAGE_KEY);
if (savedLanguage === 'en' || savedLanguage === 'bg') {
	i18next.changeLanguage(savedLanguage);
} else {
	i18next.changeLanguage('bg');
}

// Render translations on page load
renderTranslations();

// Language toggle button
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