export type View = 'dashboard' | 'calendar' | 'settings' | 'patients';

const closeSubmenusOnOutsideClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (!target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu .dropdown-menu.show')
            .forEach(m => m.classList.remove('show'));
    }
};

export const setupNestedDropdowns = (): void => {
    const toggle = document.getElementById('settingsDropdownToggle') as HTMLElement | null;

    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const parentLi = toggle.closest('li.dropdown') as HTMLElement;
            const submenu = parentLi?.querySelector('ul.dropdown-menu') as HTMLElement;
            if (!submenu) return;
            const visible = submenu.classList.contains('show');
            document.querySelectorAll('.dropdown-menu .dropdown-menu.show')
                .forEach(m => { if (m !== submenu) m.classList.remove('show'); });
            submenu.classList.toggle('show', !visible);
        });
    }

    document.removeEventListener('click', closeSubmenusOnOutsideClick);
    document.addEventListener('click', closeSubmenusOnOutsideClick);
};

export const setupNavigationHandlers = (
    getCurrentView: () => View,
    checkUnsaved: () => Promise<'save' | 'discard' | 'stay'>,
    renderApp: (view: View) => void
): void => {
    const navigate = async (target: View): Promise<void> => {
        if (getCurrentView() === 'settings' && target !== 'settings') {
            const result = await checkUnsaved();
            if (result === 'stay') return;
        }
        renderApp(target);
    };

    const dashLink = document.querySelector('[data-i18n="nav.dashboard"]') as HTMLAnchorElement;
    const calLink  = document.querySelector('[data-i18n="nav.calendar"]')  as HTMLAnchorElement;
    const patLink  = document.querySelector('[data-i18n="nav.patients"]')  as HTMLAnchorElement;
    const setLink  = document.getElementById('navCalendarSettings')        as HTMLAnchorElement;

    const markActive = (view: View) => {
        document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
        if (view === 'dashboard') dashLink?.classList.add('active');
        if (view === 'calendar')  calLink?.classList.add('active');
        if (view === 'patients')  patLink?.classList.add('active');
    };

    markActive(getCurrentView());

    dashLink?.addEventListener('click', (e) => { e.preventDefault(); navigate('dashboard'); });
    calLink?.addEventListener('click',  (e) => { e.preventDefault(); navigate('calendar'); });
    patLink?.addEventListener('click',  (e) => { e.preventDefault(); navigate('patients'); });
    setLink?.addEventListener('click',  (e) => { e.preventDefault(); navigate('settings'); });
};
