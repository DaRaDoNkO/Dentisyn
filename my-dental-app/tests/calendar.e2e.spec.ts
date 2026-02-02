import { test, expect } from '@playwright/test';

test.describe('Calendar Module E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Navigate to Calendar
        await page.click('[data-i18n="nav.calendar"]');
    });

    test('should display calendar container', async ({ page }) => {
        await expect(page.locator('#calendar')).toBeVisible();
    });

    test('should have view switcher buttons', async ({ page }) => {
        await expect(page.locator('#view-timeGridWeek')).toBeVisible();
        await expect(page.locator('#view-dayGridMonth')).toBeVisible();
        await expect(page.locator('#view-listWeek')).toBeVisible();
    });

    test('should have doctor filters checked by default', async ({ page }) => {
        const filterIvanov = page.locator('#filterIvanov');
        const filterRuseva = page.locator('#filterRuseva');
        
        await expect(filterIvanov).toBeChecked();
        await expect(filterRuseva).toBeChecked();
    });

    test('should switch views', async ({ page }) => {
        await page.click('#view-dayGridMonth');
        await expect(page.locator('.fc-daygrid-month-view')).toBeVisible();

        await page.click('#view-listWeek');
        await expect(page.locator('.fc-list-week-view')).toBeVisible();
        
        await page.click('#view-timeGridWeek');
        await expect(page.locator('.fc-timegrid-week-view')).toBeVisible();
    });

    test('should toggle doctor filters', async ({ page }) => {
        const filterIvanov = page.locator('#filterIvanov');
        
        // It is checked by default
        await expect(filterIvanov).toBeChecked();

        // Click to uncheck
        await filterIvanov.click();
        await expect(filterIvanov).not.toBeChecked();

        // Click to check again
        await filterIvanov.click();
        await expect(filterIvanov).toBeChecked();
    });
});
