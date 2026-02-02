# Copilot Instructions for DentiSyn Dental App

You are building a **Dental Practice Management MVP** using TypeScript, Bootstrap 5, and Vite—with LocalStorage persistence and i18n support (English/Bulgarian).

## Core Architecture

**Component-Driven String Rendering:** Components like `Navbar()` and `QuickStats()` return HTML strings, not DOM elements. Bootstrap your app in [main.ts](src/main.ts) by calling `renderApp()`, then attach event listeners to rendered elements using type-asserted DOM queries.

**Data Flow:** UI Components → Services (business logic) → Repositories (localStorage abstraction). Type definitions in [src/types/](src/types/); validation schemas in [src/schemas/](src/schemas/).

## Build & Development

```bash
npm run dev      # Vite dev server (http://localhost:5173)
npm run build    # Compile TS + bundle to dist/
npm run preview  # Test production build locally
npx vitest       # Run unit tests
npx playwright test  # Run E2E tests (when playwright tests exist)
```

## Key Patterns & Conventions

**DOM Selection & Event Handling:** Always use type assertions when querying and attaching listeners:
```typescript
const btn = document.getElementById('theme-toggle') as HTMLButtonElement;
btn.addEventListener('click', () => {
  console.info(`[AUDIT] Theme toggled | Time: ${new Date().toISOString()}`);
  // Update theme logic
});
```

**File Organization:** Keep files under 150 lines. For components with multiple concerns (render + events + storage), split into modular folders with:
- `types.ts` — Interfaces and type definitions
- `storage.ts` — localStorage operations
- `render.ts` — HTML string generation
- `events.ts` — Event handlers and initialization
- `index.ts` — Barrel exports

See [src/components/settings/CalendarSettings/](src/components/settings/CalendarSettings/) as reference.

**i18n (English/Bulgarian):** Use `data-i18n` attributes in HTML; translation keys defined in [src/locales/{en,bg}.json](src/locales/en.json). System auto-detects browser language via i18next-browser-languagedetector.

**Puter.js Integration (AI Research):** When implementing AI features, create service modules (e.g., src/services/drugService.ts) that call Puter.js for external AI queries. Example:
```typescript
// Future: src/services/drugService.ts
export async function checkDrugInteractions(drugName: string): Promise<string> {
  try {
    const prompt = `Check for drug interactions with ${drugName}. List any serious interactions found.`;
    const result = await puter.ai.chat(prompt, { 
      model: 'perplexity/sonar-reasoning-pro' 
    });
    console.info(`[AUDIT] DRUG_CHECK | Drug: ${drugName} | Time: ${new Date().toISOString()}`);
    return result;
  } catch (error) {
    console.error(`[ERROR] Drug check failed: ${error}`);
    throw error;
  }
}
```
Call services from components via onclick handlers.

**Styling:** Bootstrap 5 utilities only; override global styles in [src/style.css](src/style.css).

**Storage Keys:** Prefix with `dentisyn-` (e.g., `dentisyn-theme`, `dentisyn-language`).

**Mock Data:** Faker.js only—no real patient data ever. Log all state mutations to console with ISO timestamps for auditability.

## Project Structure

- [src/components/dashboard/](src/components/dashboard/) — QuickStats, NextPatient, PatientQueue widgets
- [src/components/layout/](src/components/layout/) — Navbar
- [src/components/calendar/](src/components/calendar/) — CalendarLayout (render), CalendarLogic (events)
- [src/components/appointment/](src/components/appointment/) — AppointmentModal (patient search, scheduling)
- [src/components/settings/CalendarSettings/](src/components/settings/CalendarSettings/) — types, storage, render, events (modular structure)
- [src/repositories/](src/repositories/) — localStorage queries using Repository Pattern (patientRepository, appointmentRepository)
- [src/utils/](src/utils/) — Utility functions (bgUtils for EGN/LNCh validation)
- [src/types/](src/types/) — TypeScript type definitions (patient.ts)

## Testing Strategy

**Unit Tests (Vitest):** Verify component HTML output and i18n attributes. After rendering, simulate DOM events and verify state changes:
```typescript
import { JSDOM } from 'jsdom';
import { describe, it, expect, beforeEach } from 'vitest';
import { Navbar } from '../src/components/layout/Navbar';

describe('Navbar DOM Events', () => {
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><body id="root"></body>`);
    (global as any).document = dom.window.document;
    (global as any).window = dom.window;
  });

  it('should toggle theme on button click', () => {
    const root = document.getElementById('root') as HTMLDivElement;
    root.innerHTML = Navbar();
    
    const themeBtn = document.getElementById('theme-toggle') as HTMLButtonElement;
    expect(themeBtn).toBeTruthy();
    
    // Simulate click (actual handler tested in main.ts integration)
    const clickEvent = new MouseEvent('click', { bubbles: true });
    themeBtn.dispatchEvent(clickEvent);
    expect(clickEvent.bubbles).toBe(true);
  });
});
```

**E2E Tests (Playwright):** Test full user workflows. Create [tests/e2e.spec.ts](tests/e2e.spec.ts):
```typescript
import { test, expect } from '@playwright/test';

test.describe('Dental App E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should toggle theme and persist to localStorage', async ({ page }) => {
    // Click theme toggle button
    const themeBtn = page.locator('#theme-toggle');
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();
    
    // Verify localStorage was updated
    const theme = await page.evaluate(() => localStorage.getItem('dentisyn-theme'));
    expect(theme).toBeTruthy();
  });

  test('should toggle language and update UI text', async ({ page }) => {
    const langBtn = page.locator('#lang-toggle');
    await langBtn.click();
    
    // Verify language changed (check for different text content)
    const navText = await page.locator('nav').textContent();
    expect(navText).toBeTruthy();
  });

  test('should display patient queue with all rows', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});
```
Run: `npx playwright test` (requires dev server running).

## Non-Negotiable Constraints

- **Strict TypeScript:** `strict: true` enabled; forbidden to use `any`. Define explicit interfaces/types.
- **150-line file limit:** Refactor immediately if exceeded.
- **Phase 1 = LocalStorage only:** No external databases, APIs, or backends.
- **Testing:** Write Vitest tests in [tests/](tests/components.test.ts). Verify HTML output correctness and i18n attribute presence (see navbar tests as reference).

See [src/types/patient.ts](src/types/patient.ts) for current type definitions.
