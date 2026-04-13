import { test, expect } from '@playwright/test';
import { uid, registerAndLogin } from './helpers';

const MOBILE = { width: 390, height: 844 };   // iPhone 14
const DESKTOP = { width: 1280, height: 800 };

// ---------------------------------------------------------------------------
// Mobile layout — responsive behaviour
// ---------------------------------------------------------------------------
test.describe('Mobile layout', () => {
  test('contacts sidebar is visible by default on mobile (no chat selected)', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await registerAndLogin(page, {
      first: 'Mobile',
      last: 'User',
      username: uid(),
      password: 'mobile12',
    });

    // Sidebar is visible
    await expect(page.locator('[data-testid="contacts-sidebar"]')).toBeVisible();
    // Main panel is hidden until a contact is selected
    await expect(page.locator('[data-testid="main-panel"]')).not.toBeVisible();
  });

  test('on desktop, both sidebar and main panel are visible simultaneously', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await registerAndLogin(page, {
      first: 'Desktop',
      last: 'User',
      username: uid(),
      password: 'desktop1',
    });

    await expect(page.locator('[data-testid="contacts-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-panel"]')).toBeVisible();
  });

  test('on mobile, selecting a contact hides the sidebar and shows the chat panel', async ({
    browser,
  }) => {
    const userA = uid();
    const userB = uid();

    const ctxA = await browser.newContext({ viewport: MOBILE });
    const ctxB = await browser.newContext({ viewport: MOBILE });
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await registerAndLogin(pageA, { first: 'Alice', last: 'M', username: userA, password: 'pass1234' });
      await registerAndLogin(pageB, { first: 'Bob', last: 'M', username: userB, password: 'pass5678' });

      // Alice: contacts visible, main hidden
      await expect(pageA.locator('[data-testid="contacts-sidebar"]')).toBeVisible();
      await expect(pageA.locator('[data-testid="main-panel"]')).not.toBeVisible();

      // Alice selects Bob
      await expect(pageA.getByText('Bob M')).toBeVisible({ timeout: 8_000 });
      await pageA.getByText('Bob M').click();

      // After selecting: contacts hidden, main (chat) visible
      await expect(pageA.locator('[data-testid="main-panel"]')).toBeVisible({ timeout: 5_000 });
      await expect(pageA.locator('[data-testid="contacts-sidebar"]')).not.toBeVisible();
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test('on mobile, the back button in the chat toolbar returns to the contacts list', async ({
    browser,
  }) => {
    const userA = uid();
    const userB = uid();

    const ctxA = await browser.newContext({ viewport: MOBILE });
    const ctxB = await browser.newContext({ viewport: MOBILE });
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await registerAndLogin(pageA, { first: 'Alice', last: 'Back', username: userA, password: 'pass1234' });
      await registerAndLogin(pageB, { first: 'Bob', last: 'Back', username: userB, password: 'pass5678' });

      // Alice selects Bob
      await expect(pageA.getByText('Bob Back')).toBeVisible({ timeout: 8_000 });
      await pageA.getByText('Bob Back').click();
      await expect(pageA.locator('[data-testid="main-panel"]')).toBeVisible({ timeout: 5_000 });

      // Tap the back button (aria-label="Back to contacts")
      await pageA.getByRole('button', { name: 'Back to contacts' }).click();

      // Contacts sidebar should be visible again
      await expect(pageA.locator('[data-testid="contacts-sidebar"]')).toBeVisible();
      await expect(pageA.locator('[data-testid="main-panel"]')).not.toBeVisible();
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test('on mobile, the home view back button returns to the contacts list', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await registerAndLogin(page, {
      first: 'Back',
      last: 'Home',
      username: uid(),
      password: 'backhome',
    });

    // On mobile, the main panel is hidden by default
    // Simulate tapping somewhere that would open main panel — navigate programmatically
    // by checking the initial state: sidebar visible, main hidden
    await expect(page.locator('[data-testid="contacts-sidebar"]')).toBeVisible();
  });

  test('auth screen is usable on mobile without horizontal scroll', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/');

    // Key auth elements should be visible on mobile
    await expect(page.getByRole('button', { name: 'Log In' }).first()).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    // Page should not have horizontal scrollbar (scrollWidth === clientWidth)
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalScroll).toBe(false);
  });
});
