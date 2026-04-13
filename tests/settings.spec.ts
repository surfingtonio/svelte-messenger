import { test, expect } from '@playwright/test';
import { uid, registerAndLogin } from './helpers';

// ---------------------------------------------------------------------------
// Settings modal — theme toggle and persistence
// ---------------------------------------------------------------------------
test.describe('Settings modal', () => {
  test('Settings button opens the settings modal', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Settings',
      last: 'User',
      username: uid(),
      password: 'settings1',
    });
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings-modal"]').getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('Settings modal shows theme option buttons (Light, Dark, System)', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Theme',
      last: 'Tester',
      username: uid(),
      password: 'theme1234',
    });
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.getByRole('button', { name: 'Light' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dark' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'System' })).toBeVisible();
  });

  test('selecting Dark theme adds the .dark class to <html>', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Dark',
      last: 'Tester',
      username: uid(),
      password: 'dark1234',
    });
    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.getByRole('button', { name: 'Dark' }).click();
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(hasDark).toBe(true);
  });

  test('selecting Light theme removes the .dark class from <html>', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Light',
      last: 'Tester',
      username: uid(),
      password: 'light123',
    });
    await page.getByRole('button', { name: 'Open settings' }).click();
    // First switch to dark
    await page.getByRole('button', { name: 'Dark' }).click();
    // Then switch to light
    await page.getByRole('button', { name: 'Light' }).click();
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(hasDark).toBe(false);
  });

  test('theme selection is persisted in localStorage', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Persist',
      last: 'Tester',
      username: uid(),
      password: 'persist1',
    });
    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.getByRole('button', { name: 'Dark' }).click();

    const stored = await page.evaluate(() =>
      localStorage.getItem('messenger-theme')
    );
    expect(stored).toBe('dark');
  });

  test('theme persists after page reload', async ({ page }) => {
    const username = uid();
    await registerAndLogin(page, { first: 'Reload', last: 'Tester', username, password: 'reload12' });

    // Set dark theme
    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.getByRole('button', { name: 'Dark' }).click();
    await page.getByRole('button', { name: 'Close settings' }).click();

    // Reload the page (this will go back to auth; set localStorage directly then reload)
    await page.evaluate(() => localStorage.setItem('messenger-theme', 'dark'));
    await page.reload();

    // After reload, dark class should still be present (applied by theme store on init)
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(hasDark).toBe(true);
  });

  test('Settings modal closes when the X button is clicked', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Close',
      last: 'Tester',
      username: uid(),
      password: 'close123',
    });
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible();
    await page.getByRole('button', { name: 'Close settings' }).click();
    await expect(page.locator('[data-testid="settings-modal"]')).not.toBeVisible();
  });

  test('Settings modal closes when Escape key is pressed', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Escape',
      last: 'Tester',
      username: uid(),
      password: 'escape12',
    });
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="settings-modal"]')).not.toBeVisible();
  });

  test('Settings modal closes when the backdrop is clicked', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Backdrop',
      last: 'Tester',
      username: uid(),
      password: 'backdrop1',
    });
    await page.getByRole('button', { name: 'Open settings' }).click();
    await expect(page.locator('[data-testid="settings-modal"]')).toBeVisible();
    // Click the backdrop (top-left corner, which is outside the modal card)
    await page.mouse.click(10, 10);
    await expect(page.locator('[data-testid="settings-modal"]')).not.toBeVisible();
  });

  test('System theme option is selectable', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'System',
      last: 'Tester',
      username: uid(),
      password: 'system12',
    });
    await page.getByRole('button', { name: 'Open settings' }).click();
    await page.getByRole('button', { name: 'System' }).click();

    const stored = await page.evaluate(() =>
      localStorage.getItem('messenger-theme')
    );
    expect(stored).toBe('system');

    // aria-pressed should be true on the System button
    const isPressed = await page
      .getByRole('button', { name: 'System' })
      .getAttribute('aria-pressed');
    expect(isPressed).toBe('true');
  });
});
