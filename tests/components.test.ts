import { describe, it, expect } from 'vitest';
import { Navbar } from '../src/components/layout/Navbar';
import { QuickStats } from '../src/components/dashboard/QuickStats';
import { NextPatient } from '../src/components/dashboard/NextPatient';
import { PatientQueue } from '../src/components/dashboard/PatientQueue/index';
import { renderCalendarHTML } from '../src/components/calendar/CalendarLayout';
import { renderSearchDropdown } from '../src/components/search/PatientSearch';
import { getNextActions } from '../src/components/dashboard/PatientQueue/statusWorkflow';
import { calculatePunctuality } from '../src/services/patientStatsService';
import {
  setPendingAppointment,
  getPendingAppointment,
  clearPendingAppointment
} from '../src/services/pendingAppointmentService';
import { renderPatientTab } from '../src/components/patient/PatientTab/render';
import { renderNewPatientForm } from '../src/components/patient/NewPatient/render';
import { renderPatientCarton } from '../src/components/patient/PatientCarton/render';
import { OBLASTS, HEALTH_REGIONS } from '../src/data/oblasts';
import type { DelayRecord } from '../src/types/patient';

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

    it('should contain stat columns', () => {
      const html = QuickStats();
      // Values depend on localStorage, just check structure
      expect(html).toContain('fs-3 fw-bold');
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

    it('should render when no appointments', () => {
      const html = NextPatient();
      // Could show "no upcoming" or a patient card depending on localStorage
      expect(html).toContain('data-i18n="dashboard.nextPatient"');
    });

    it('should render card structure', () => {
      const html = NextPatient();
      expect(html).toContain('card');
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
      expect(html).toContain('data-i18n="table.end"');
      expect(html).toContain('data-i18n="table.status"');
      expect(html).toContain('data-i18n="table.actions"');
    });

    it('should render empty state or rows based on localStorage', () => {
      const html = PatientQueue();
      // Either has rows or shows empty message
      expect(html.length).toBeGreaterThan(100);
    });

    it('should contain doctor filter pills', () => {
      const html = PatientQueue();
      expect(html).toContain('doctor-filter-pill');
    });

    it('should contain status badge i18n keys', () => {
      const html = PatientQueue();
      // At least the empty state or badge key should exist
      expect(html).toContain('data-i18n');
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

  describe('Navbar Search Button', () => {
    it('should contain global search button', () => {
      const html = Navbar();
      expect(html).toContain('id="globalSearchBtn"');
    });

    it('should contain search icon', () => {
      const html = Navbar();
      expect(html).toContain('bi-search');
    });
  });

  describe('Search Dropdown', () => {
    it('should render search overlay HTML', () => {
      const html = renderSearchDropdown();
      expect(html).toContain('globalSearchOverlay');
      expect(html).toContain('globalSearchInput');
      expect(html).toContain('globalSearchResults');
    });

    it('should contain Esc close button', () => {
      const html = renderSearchDropdown();
      expect(html).toContain('globalSearchClose');
      expect(html).toContain('Esc');
    });
  });

  describe('Left Status in Workflow', () => {
    it('should allow NewAppointment action from Left status', () => {
      const actions = getNextActions('Left');
      expect(actions).toContain('NewAppointment');
    });

    it('should NOT allow Bill from Left status', () => {
      const actions = getNextActions('Left');
      expect(actions).not.toContain('Bill');
    });

    it('should allow Bill from Completed status', () => {
      const actions = getNextActions('Completed');
      expect(actions).toContain('Bill');
    });
  });

  describe('Punctuality Scoring', () => {
    it('should return punctual for empty history', () => {
      expect(calculatePunctuality([])).toBe('punctual');
    });

    it('should return punctual for minor delays', () => {
      const history: DelayRecord[] = [
        { appointmentId: '1', scheduledTime: '', actualArrivalTime: '', delayMinutes: 3, date: '2025-01-01' },
        { appointmentId: '2', scheduledTime: '', actualArrivalTime: '', delayMinutes: 2, date: '2025-01-02' },
      ];
      expect(calculatePunctuality(history)).toBe('punctual');
    });

    it('should return delayed for 3+ delays over 5 min', () => {
      const history: DelayRecord[] = Array.from({ length: 4 }, (_, i) => ({
        appointmentId: `a-${i}`,
        scheduledTime: '',
        actualArrivalTime: '',
        delayMinutes: 10,
        date: `2025-01-0${i + 1}`,
      }));
      expect(calculatePunctuality(history)).toBe('delayed');
    });

    it('should return unreliable for 5+ delays over 5 min', () => {
      const history: DelayRecord[] = Array.from({ length: 6 }, (_, i) => ({
        appointmentId: `a-${i}`,
        scheduledTime: '',
        actualArrivalTime: '',
        delayMinutes: 15,
        date: `2025-01-0${i + 1}`,
      }));
      expect(calculatePunctuality(history)).toBe('unreliable');
    });
  });

  describe('Pending Appointment Context', () => {
    it('should set and get pending context', () => {
      setPendingAppointment({
        patientId: 'p-1',
        patientName: 'Test Patient',
        phone: '+359888123456',
        doctorId: 'dr-ivanov',
      });
      const ctx = getPendingAppointment();
      expect(ctx).not.toBeNull();
      expect(ctx?.patientName).toBe('Test Patient');
      expect(ctx?.doctorId).toBe('dr-ivanov');
    });

    it('should clear pending context', () => {
      setPendingAppointment({
        patientId: 'p-1',
        patientName: 'Test Patient',
        phone: '+359888123456',
        doctorId: 'dr-ivanov',
      });
      clearPendingAppointment();
      expect(getPendingAppointment()).toBeNull();
    });
  });

  // ─── Part 6: Patient Tab Tests ───────────────────────

  describe('PatientTab Component', () => {
    it('should render patient tab with sub-tab navigation', () => {
      const html = renderPatientTab();
      expect(html).toContain('patientTabContainer');
      expect(html).toContain('newPatientTab');
      expect(html).toContain('patientCartonTab');
    });

    it('should have New Patient tab active by default', () => {
      const html = renderPatientTab('new');
      expect(html).toContain('id="newPatientTab"');
      // The "new" tab button should have "active" class
      expect(html).toMatch(/class="nav-link active"[\s\S]*?id="newPatientTab"/);
    });

    it('should support carton sub-tab', () => {
      const html = renderPatientTab('carton');
      expect(html).toMatch(/class="nav-link active"[\s\S]*?id="patientCartonTab"/);
    });

    it('should contain i18n attributes', () => {
      const html = renderPatientTab();
      expect(html).toContain('data-i18n="patient.tabTitle"');
      expect(html).toContain('data-i18n="patient.newPatient"');
      expect(html).toContain('data-i18n="patient.patientCarton"');
    });
  });

  describe('NewPatient Form', () => {
    it('should render the registration form', () => {
      const html = renderNewPatientForm();
      expect(html).toContain('newPatientForm');
      expect(html).toContain('npFirstName');
      expect(html).toContain('npFamilyName');
      expect(html).toContain('npPhone');
    });

    it('should contain ID type selector with EGN/LNCh/EU/SSN options', () => {
      const html = renderNewPatientForm();
      expect(html).toContain('value="EGN"');
      expect(html).toContain('value="LNCh"');
      expect(html).toContain('value="EU"');
      expect(html).toContain('value="SSN"');
    });

    it('should contain NZOK section with oblast dropdown', () => {
      const html = renderNewPatientForm();
      expect(html).toContain('npNzokNumber');
      expect(html).toContain('npRzokOblast');
      expect(html).toContain('npHealthRegion');
    });

    it('should contain patient flag checkboxes', () => {
      const html = renderNewPatientForm();
      expect(html).toContain('npUnfavorable');
      expect(html).toContain('npExemptFee');
      expect(html).toContain('npPensioner');
    });

    it('should have date of birth and sex fields', () => {
      const html = renderNewPatientForm();
      expect(html).toContain('npDob');
      expect(html).toContain('npSex');
    });

    it('should have auto-fill indicators for EGN', () => {
      const html = renderNewPatientForm();
      expect(html).toContain('npDobAutoFill');
      expect(html).toContain('npSexAutoFill');
    });

    it('should contain family link area', () => {
      const html = renderNewPatientForm();
      expect(html).toContain('familyLinkArea');
    });

    it('should have create patient submit button', () => {
      const html = renderNewPatientForm();
      expect(html).toContain('createPatientBtn');
      expect(html).toContain('data-i18n="patient.createPatient"');
    });
  });

  describe('PatientCarton Component', () => {
    it('should render search state when no patient selected', () => {
      const html = renderPatientCarton();
      expect(html).toContain('cartonSearchInput');
      expect(html).toContain('cartonSearchResults');
    });

    it('should contain i18n attributes', () => {
      const html = renderPatientCarton();
      expect(html).toContain('data-i18n="patient.searchPatient"');
      expect(html).toContain('data-i18n="patient.selectPatient"');
    });
  });

  describe('Bulgarian Oblast Data', () => {
    it('should have all 28 oblasts', () => {
      expect(OBLASTS).toHaveLength(28);
    });

    it('should have all 28 health regions', () => {
      expect(HEALTH_REGIONS).toHaveLength(28);
    });

    it('should have Sofia City in oblasts', () => {
      const sofia = OBLASTS.find(o => o.code === 'SOF');
      expect(sofia).toBeDefined();
      expect(sofia?.nameBG).toBe('София-град');
      expect(sofia?.nameEN).toBe('Sofia City');
    });

    it('should have unique oblast codes', () => {
      const codes = OBLASTS.map(o => o.code);
      expect(new Set(codes).size).toBe(codes.length);
    });
  });
});
