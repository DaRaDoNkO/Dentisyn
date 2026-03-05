import { NextPatient, setNextPatientDoctor, shiftNextPatient } from '../components/dashboard/NextPatient';
import { setupPatientQueueHandlers } from '../components/dashboard/PatientQueue/index';
import { renderTranslations } from './themeHandlers';

export const setupNoteExpandHandlers = (): void => {
    document.querySelectorAll('.note-expand-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = (btn as HTMLElement).dataset.noteId;
            const c = document.querySelector(`.next-patient-note[data-note-id="${id}"]`);
            c?.querySelector('.note-truncated')?.classList.add('d-none');
            c?.querySelector('.note-full')?.classList.remove('d-none');
        });
    });
    document.querySelectorAll('.note-collapse-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = (btn as HTMLElement).dataset.noteId;
            const c = document.querySelector(`.next-patient-note[data-note-id="${id}"]`);
            c?.querySelector('.note-truncated')?.classList.remove('d-none');
            c?.querySelector('.note-full')?.classList.add('d-none');
        });
    });
};

const attachNextPatientHandlers = (): void => {
    document.querySelectorAll('.next-patient-doc-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            setNextPatientDoctor((btn as HTMLElement).dataset.doctor ?? 'all');
            rerenderNextPatient();
        });
    });
    document.getElementById('nextPatientPrev')?.addEventListener('click', () => { shiftNextPatient(-1); rerenderNextPatient(); });
    document.getElementById('nextPatientNext')?.addEventListener('click', () => { shiftNextPatient(1);  rerenderNextPatient(); });
};

export const rerenderNextPatient = (): void => {
    const section = document.getElementById('nextPatientSection');
    if (!section?.parentElement) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = NextPatient();
    section.parentElement.replaceChild(tmp.firstElementChild as HTMLElement, section);
    attachNextPatientHandlers();
    setupNoteExpandHandlers();
    renderTranslations();
};

export const setupDashboardHandlers = (): void => {
    setupPatientQueueHandlers();
    attachNextPatientHandlers();
    setupNoteExpandHandlers();
};
