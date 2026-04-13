import { test, expect } from '@playwright/test';
import { uid, registerAndLogin } from './helpers';

// ---------------------------------------------------------------------------
// Auth screen — UI tests
// ---------------------------------------------------------------------------
test.describe('Auth screen', () => {
  test('shows the login tab by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Log In' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' }).first()).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
  });

  test('can switch to the sign up tab and see signup fields', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await expect(page.getByLabel('First name')).toBeVisible();
    await expect(page.getByLabel('Last name')).toBeVisible();
    await expect(page.getByLabel('Confirm password')).toBeVisible();
  });

  test('switching tabs clears any visible error', async ({ page }) => {
    await page.goto('/');
    // Trigger a login error
    await page.getByRole('button', { name: 'Log In' }).last().click();
    await expect(page.getByText('Please fill in all fields.')).toBeVisible();
    // Switch tab — error should be gone
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await expect(page.getByText('Please fill in all fields.')).not.toBeVisible();
  });

  test('shows error when login fields are empty', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Log In' }).last().click();
    await expect(page.getByText('Please fill in all fields.')).toBeVisible();
  });

  test('shows error for mismatched passwords on signup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await page.getByLabel('First name').fill('Test');
    await page.getByLabel('Last name').fill('User');
    await page.getByLabel('Username').fill(uid());
    await page.locator('#signup-password').fill('password123');
    await page.locator('#signup-confirm').fill('different');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();
  });

  test('shows error for password shorter than 6 characters on signup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await page.getByLabel('First name').fill('Test');
    await page.getByLabel('Last name').fill('User');
    await page.getByLabel('Username').fill(uid());
    await page.locator('#signup-password').fill('abc');
    await page.locator('#signup-confirm').fill('abc');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Password must be at least 6 characters.')).toBeVisible();
  });

  test('can register a new user and reach the chat UI', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Jane',
      last: 'Doe',
      username: uid(),
      password: 'securepass',
    });
    await expect(page.locator('[data-testid="contacts-sidebar"]')).toBeVisible();
    await expect(page.getByText('Messenger').first()).toBeVisible();
  });

  test('shows error for duplicate username on signup', async ({ page }) => {
    const username = uid();
    // Register once
    await registerAndLogin(page, { first: 'Jane', last: 'Doe', username, password: 'securepass' });
    // Navigate back to auth
    await page.goto('/');
    // Try same username again
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await page.getByLabel('First name').fill('John');
    await page.getByLabel('Last name').fill('Smith');
    await page.getByLabel('Username').fill(username);
    await page.locator('#signup-password').fill('otherpass');
    await page.locator('#signup-confirm').fill('otherpass');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Username is already taken.')).toBeVisible();
  });

  test('can log in after registering', async ({ page }) => {
    const username = uid();
    await registerAndLogin(page, { first: 'Alex', last: 'Test', username, password: 'mypassword' });
    // Reload and log back in with login form
    await page.goto('/');
    await page.getByLabel('Username').fill(username);
    await page.locator('#login-password').fill('mypassword');
    await page.getByRole('button', { name: 'Log In' }).last().click();
    await expect(page.locator('[data-testid="contacts-sidebar"]')).toBeVisible({ timeout: 12_000 });
  });

  test('shows error for invalid credentials on login', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill('nonexistentuser_xyz_abc');
    await page.locator('#login-password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Log In' }).last().click();
    await expect(page.getByText('Invalid username or password.')).toBeVisible();
  });

  test('shows error for missing username on login', async ({ page }) => {
    await page.goto('/');
    await page.locator('#login-password').fill('somepassword');
    await page.getByRole('button', { name: 'Log In' }).last().click();
    await expect(page.getByText('Please fill in all fields.')).toBeVisible();
  });

  test('auth card is visible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // The auth card should be fully visible — not cut off
    await expect(page.getByRole('button', { name: 'Log In' }).first()).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// API endpoint tests (no browser, uses request context)
// ---------------------------------------------------------------------------
test.describe('API endpoints', () => {
  test('GET /api/health returns ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toMatchObject({ ok: true });
  });

  test('POST /api/register succeeds and returns user fields without password hash', async ({ request }) => {
    const res = await request.post('/api/register', {
      data: { first: 'Api', last: 'Test', username: uid(), password: 'apitest123' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('first', 'Api');
    expect(body).toHaveProperty('last', 'Test');
    expect(body).toHaveProperty('token');
    expect(body).not.toHaveProperty('password');
    expect(body).not.toHaveProperty('passwordHash');
  });

  test('POST /api/register returns 400 for missing fields', async ({ request }) => {
    const res = await request.post('/api/register', {
      data: { first: 'Only' },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/register returns 409 for duplicate username', async ({ request }) => {
    const username = uid();
    await request.post('/api/register', {
      data: { first: 'A', last: 'B', username, password: 'pass1234' },
    });
    const res = await request.post('/api/register', {
      data: { first: 'C', last: 'D', username, password: 'pass5678' },
    });
    expect(res.status()).toBe(409);
  });

  test('POST /api/login succeeds and returns a token', async ({ request }) => {
    const username = uid();
    await request.post('/api/register', {
      data: { first: 'Login', last: 'Test', username, password: 'correctpass' },
    });
    const res = await request.post('/api/login', {
      data: { username, password: 'correctpass' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('token');
  });

  test('POST /api/login returns 401 for wrong password', async ({ request }) => {
    const username = uid();
    await request.post('/api/register', {
      data: { first: 'X', last: 'Y', username, password: 'correctpass' },
    });
    const res = await request.post('/api/login', {
      data: { username, password: 'wrongpass' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/login returns 401 for non-existent user', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { username: 'no_such_user_xyz', password: 'anything' },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/admin/users requires auth token', async ({ request }) => {
    const res = await request.get('/api/admin/users');
    expect(res.status()).toBe(401);
  });

  test('GET /api/admin/users returns 403 for non-admin user', async ({ request }) => {
    const username = uid();
    const reg = await request.post('/api/register', {
      data: { first: 'Non', last: 'Admin', username, password: 'pass1234' },
    });
    const { token } = await reg.json();
    const res = await request.get('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(403);
  });
});
