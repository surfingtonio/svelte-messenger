import { type Page, type APIRequestContext } from '@playwright/test';

/** Generate a unique username suffix to avoid collisions across parallel test runs. */
export function uid(): string {
  return `u_${Date.now()}_${Math.floor(Math.random() * 99_999)}`;
}

/** Register a new account and wait until the chat UI is visible. */
export async function registerAndLogin(
  page: Page,
  opts: { first: string; last: string; username: string; password: string }
) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign Up' }).first().click();
  await page.getByLabel('First name').fill(opts.first);
  await page.getByLabel('Last name').fill(opts.last);
  await page.getByLabel('Username').fill(opts.username);
  await page.locator('#signup-password').fill(opts.password);
  await page.locator('#signup-confirm').fill(opts.password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.locator('[data-testid="contacts-sidebar"]').waitFor({ state: 'visible', timeout: 12_000 });
}

/** Log into an existing account and wait until the chat UI is visible. */
export async function login(
  page: Page,
  opts: { username: string; password: string }
) {
  await page.goto('/');
  await page.getByLabel('Username').fill(opts.username);
  await page.locator('#login-password').fill(opts.password);
  await page.getByRole('button', { name: 'Log In' }).last().click();
  await page.locator('[data-testid="contacts-sidebar"]').waitFor({ state: 'visible', timeout: 12_000 });
}

/**
 * Register a new user, elevate to admin via the test endpoint, then log in again
 * to get a fresh JWT that contains the admin role.
 * Requires the server to be running with TEST_MODE=1.
 */
export async function registerAndLoginAsAdmin(
  page: Page,
  request: APIRequestContext,
  opts: { first: string; last: string; username: string; password: string }
) {
  await registerAndLogin(page, opts);
  // Elevate via test endpoint
  await request.post('/api/test/make-admin', { data: { username: opts.username } });
  // Log out and back in so the new JWT carries admin roles
  await page.getByTitle('Log out').click();
  await login(page, { username: opts.username, password: opts.password });
}
