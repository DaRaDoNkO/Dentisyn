import { describe, it, expect } from 'vitest';
import { Navbar } from '../src/components/layout/Navbar';
import { QuickStats } from '../src/components/dashboard/QuickStats';
import { NextPatient } from '../src/components/dashboard/NextPatient';
import { PatientQueue } from '../src/components/dashboard/PatientQueue';
import { renderCalendarHTML } from '../src/components/calendar/CalendarLayout';

describe('Component Rendering', () => {
  describe('Navbar Component', () => {
    it('should render HTML string', () => {
      const html = Navbar();
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });

    it('should contain DentiSyn branding', () => {
      const html = Navbar();
      expect(html).toContain('DentiSyn');
    });

    it('should contain theme-toggle button ID', () => {
      const html = Navbar();
      expect(html).toContain('id="theme-toggle"');
    });

    it('should contain lang-toggle button ID', () => {
      const html = Navbar();
      expect(html).toContain('id="lang-toggle"');
    });

    it('should contain data-i18n attributes for nav links', () => {
      const html = Navbar();
      expect(html).toContain('data-i18n="nav.dashboard"');
      expect(html).toContain('data-i18n="nav.patients"');
      expect(html).toContain('data-i18n="nav.calendar"');
    });

    it('should contain Bootstrap navbar structure', () => {
      const html = Navbar();
      expect(html).toContain('navbar');
      expect(html).toContain('navbar-brand');
    });
  });

  describe('QuickStats Component', () => {
    it('should render HTML string', () => {
      const html = QuickStats();
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });

    it('should contain quick stats heading', () => {
      const html = QuickStats();
      expect(html).toContain('data-i18n="dashboard.quickStats"');
    });

    it('should contain three stat columns', () => {
      const html = QuickStats();
      expect(html).toContain('data-i18n="dashboard.today"');
      expect(html).toContain('data-i18n="dashboard.urgent"');
      expect(html).toContain('data-i18n="dashboard.completed"');
    });

    it('should contain stat values', () => {
      const html = QuickStats();
      expect(html).toContain('>8<');
      expect(html).toContain('>2<');
      expect(html).toContain('>3<');
    });
  });

  describe('NextPatient Component', () => {
    it('should render HTML string', () => {
      const html = NextPatient();
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });

    it('should contain next patient heading', () => {
      const html = NextPatient();
      expect(html).toContain('data-i18n="dashboard.nextPatient"');
    });

    it('should contain patient name Sarah Jenkins', () => {
      const html = NextPatient();
      expect(html).toContain('Sarah Jenkins');
    });

    it('should contain open chart button', () => {
      const html = NextPatient();
      expect(html).toContain('data-i18n="dashboard.openChart"');
    });

    it('should contain appointment time', () => {
      const html = NextPatient();
      expect(html).toContain('10:30 AM');
    });
  });

  describe('PatientQueue Component', () => {
    it('should render HTML string', () => {
      const html = PatientQueue();
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });

    it('should contain patient queue heading', () => {
      const html = PatientQueue();
      expect(html).toContain('data-i18n="dashboard.patientQueue"');
    });

    it('should contain table headers with i18n keys', () => {
      const html = PatientQueue();
      expect(html).toContain('data-i18n="table.name"');
      expect(html).toContain('data-i18n="table.time"');
      expect(html).toContain('data-i18n="table.status"');
      expect(html).toContain('data-i18n="table.actions"');
    });

    it('should contain patient names', () => {
      const html = PatientQueue();
      expect(html).toContain('John Doe');
      expect(html).toContain('Sarah Jenkins');
      expect(html).toContain('Mike Ross');
    });

    it('should contain status badges with i18n keys', () => {
      const html = PatientQueue();
      expect(html).toContain('data-i18n="status.completed"');
      expect(html).toContain('data-i18n="status.waiting"');
      expect(html).toContain('data-i18n="status.confirmed"');
    });

    it('should contain action buttons with i18n keys', () => {
      const html = PatientQueue();
      expect(html).toContain('data-i18n="table.view"');
      expect(html).toContain('data-i18n="table.billing"');
      expect(html).toContain('data-i18n="table.checkIn"');
      expect(html).toContain('data-i18n="table.cancel"');
    });
  });

  describe('Calendar Module', () => {
    it('should render HTML string', () => {
      const html = renderCalendarHTML();
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });

    it('should contain View Switcher buttons', () => {
      const html = renderCalendarHTML();
      expect(html).toContain('id="view-timeGridWeek"');
      expect(html).toContain('id="view-dayGridMonth"');
      expect(html).toContain('id="view-listWeek"');
    });

    it('should contain Doctor Filters', () => {
      const html = renderCalendarHTML();
      expect(html).toContain('id="filterIvanov"');
      expect(html).toContain('id="filterRuseva"');
    });

    it('should contain Calendar container', () => {
      const html = renderCalendarHTML();
      expect(html).toContain('id="calendar"');
    });
  });
});
