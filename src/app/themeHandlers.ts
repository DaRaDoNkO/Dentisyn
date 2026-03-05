import i18next from '../i18n';

export type ThemeMode = 'light' | 'dark';
export type LanguageMode = 'en' | 'bg';

export const THEME_STORAGE_KEY = 'dentisyn-theme';
export const LANG_STORAGE_KEY = 'dentisyn-language';

const rootElement = document.documentElement;

export const applyTheme = (mode: ThemeMode): void => {
    rootElement.setAttribute('data-bs-theme', mode);
};

export const renderTranslations = (): void => {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.getAttribute('data-i18n');
        if (key) element.textContent = i18next.t(key);
    });
};

export const setupThemeHandlers = (): void => {
    const toggleButton = document.getElementById('theme-toggle') as HTMLButtonElement | null;
    const syncLabel = (mode: ThemeMode) => {
        if (!toggleButton) return;
        toggleButton.innerHTML = mode === 'dark'
            ? '<span aria-hidden="true">☀️</span><span>Light</span>'
            : '<span aria-hidden="true">🌙</span><span>Dark</span>';
    };

    syncLabel(rootElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light');

    toggleButton?.addEventListener('click', () => {
        const next: ThemeMode = rootElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(THEME_STORAGE_KEY, next);
        syncLabel(next);
    });
};

export const setupLanguageHandlers = (
    onLangChange: () => void,
    refreshLocale?: () => void
): void => {
    const btn = document.getElementById('lang-toggle') as HTMLButtonElement | null;

    const applyLang = (lang: LanguageMode) => {
        document.documentElement.lang = lang === 'bg' ? 'bg' : 'en';
        if (btn) btn.textContent = lang === 'bg' ? 'EN' : 'BG';
    };

    applyLang(i18next.language as LanguageMode);

    btn?.addEventListener('click', () => {
        const next: LanguageMode = i18next.language === 'bg' ? 'en' : 'bg';
        i18next.changeLanguage(next);
        localStorage.setItem(LANG_STORAGE_KEY, next);
        applyLang(next);
        onLangChange();
        refreshLocale?.();
    });
};
