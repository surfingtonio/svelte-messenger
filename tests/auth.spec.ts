import { test, expect } from '@playwright/test';

// Generate a unique username for each test run to avoid collisions
function uid() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

test.describe('Auth screen', () => {
  test('shows the login tab by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Log In' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' }).first()).toBeVisible();
    // Login fields are visible
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('can switch to the sign up tab', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await expect(page.getByLabel('First name')).toBeVisible();
    await expect(page.getByLabel('Last name')).toBeVisible();
    await expect(page.getByLabel('Confirm password')).toBeVisible();
  });

  test('shows error when login fields are empty', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Log In' }).first().click();
    await expect(page.getByText('Please fill in all fields.')).toBeVisible();
  });

  test('shows error for mismatched passwords on signup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await page.getByLabel('First name').fill('Test');
    await page.getByLabel('Last name').fill('User');
    await page.getByLabel('Username').fill(uid());
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm password').fill('different');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();
  });

  test('shows error for password too short on signup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await page.getByLabel('First name').fill('Test');
    await page.getByLabel('Last name').fill('User');
    await page.getByLabel('Username').fill(uid());
    await page.getByLabel('Password').fill('abc');
    await page.getByLabel('Confirm password').fill('abc');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Password must be at least 6 characters.')).toBeVisible();
  });

  test('can register a new user and reach the chat UI', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    const username = uid();
    await page.getByLabel('First name').fill('Jane');
    await page.getByLabel('Last name').fill('Doe');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill('securepass');
    await page.getByLabel('Confirm password').fill('securepass');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.locator('.container')).toBeVisible({ timeout: 10_000 });
  });

  test('shows error for duplicate username on signup', async ({ page }) => {
    await page.goto('/');
    const username = uid();

    // Register once
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await page.getByLabel('First name').fill('Jane');
    await page.getByLabel('Last name').fill('Doe');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill('securepass');
    await page.getByLabel('Confirm password').fill('securepass');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.locator('.container')).toBeVisible({ timeout: 10_000 });

    // Navigate back to auth by reloading (server keeps the account in-memory)
    await page.goto('/');

    // Try to register again with same username
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await page.getByLabel('First name').fill('John');
    await page.getByLabel('Last name').fill('Smith');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill('otherpass');
    await page.getByLabel('Confirm password').fill('otherpass');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText('Username is already taken.')).toBeVisible();
  });

  test('can log in after registering', async ({ page }) => {
    await page.goto('/');
    const username = uid();

    // Register first
    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await page.getByLabel('First name').fill('Alex');
    await page.getByLabel('Last name').fill('Test');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill('mypassword');
    await page.getByLabel('Confirm password').fill('mypassword');
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.locator('.container')).toBeVisible({ timeout: 10_000 });

    // Reload and log back in
    await page.goto('/');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill('mypassword');
    await page.getByRole('button', { name: 'Log In' }).last().click();
    await expect(page.locator('.container')).toBeVisible({ timeout: 10_000 });
  });

  test('shows error for invalid credentials on login', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Username').fill('nonexistentuser_xyz');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Log In' }).last().click();
    await expect(page.getByText('Invalid username or password.')).toBeVisible();
  });
});

test.describe('API endpoints', () => {
  test('GET /api/health returns ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toMatchObject({ ok: true });
  });

  test('POST /api/register returns user without password', async ({ request }) => {
    const res = await request.post('/api/register', {
      data: { first: 'Api', last: 'Test', username: uid(), password: 'apitest123' }
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('first', 'Api');
    expect(body).not.toHaveProperty('password');
    expect(body).not.toHaveProperty('passwordHash');
  });

  test('POST /api/register rejects missing fields', async ({ request }) => {
    const res = await request.post('/api/register', {
      data: { first: 'Only' }
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/login rejects wrong password', async ({ request }) => {
    const username = uid();
    await request.post('/api/register', {
      data: { first: 'X', last: 'Y', username, password: 'correctpass' }
    });
    const res = await request.post('/api/login', {
      data: { username, password: 'wrongpass' }
    });
    expect(res.status()).toBe(401);
  });
});
