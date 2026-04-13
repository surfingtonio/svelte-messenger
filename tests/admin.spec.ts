import { test, expect } from '@playwright/test';
import { uid, registerAndLogin, registerAndLoginAsAdmin } from './helpers';

// ---------------------------------------------------------------------------
// Admin panel — access control and functionality
// ---------------------------------------------------------------------------
test.describe('Admin panel — API access control', () => {
  test('GET /api/admin/users returns 401 without auth header', async ({ request }) => {
    const res = await request.get('/api/admin/users');
    expect(res.status()).toBe(401);
  });

  test('GET /api/admin/users returns 403 for regular (non-admin) user', async ({ request }) => {
    const username = uid();
    const reg = await request.post('/api/register', {
      data: { first: 'Regular', last: 'User', username, password: 'pass1234' },
    });
    const { token } = await reg.json();
    const res = await request.get('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(403);
  });

  test('GET /api/admin/users returns 200 and user list for admin', async ({ request }) => {
    const username = uid();
    const reg = await request.post('/api/register', {
      data: { first: 'Admin', last: 'User', username, password: 'adminpass' },
    });
    const { token } = await reg.json();
    // Elevate to admin
    await request.post('/api/test/make-admin', { data: { username } });
    // Re-login to get admin JWT
    const login = await request.post('/api/login', { data: { username, password: 'adminpass' } });
    const { token: adminToken } = await login.json();
    const res = await request.get('/api/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((u: { username: string }) => u.username === username)).toBe(true);
  });

  test('PATCH /api/admin/users/:id/roles returns 400 for invalid role', async ({ request }) => {
    const username = uid();
    await request.post('/api/register', {
      data: { first: 'Admin', last: 'B', username, password: 'adminpass' },
    });
    await request.post('/api/test/make-admin', { data: { username } });
    const login = await request.post('/api/login', { data: { username, password: 'adminpass' } });
    const { token, id } = await login.json();

    const target = uid();
    const treg = await request.post('/api/register', {
      data: { first: 'Target', last: 'T', username: target, password: 'pass1234' },
    });
    const { id: targetId } = await treg.json();

    const res = await request.patch(`/api/admin/users/${targetId}/roles`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { roles: ['user', 'superpower'] },
    });
    expect(res.status()).toBe(400);
  });

  test('DELETE /api/admin/users/:id prevents admin from deleting self', async ({ request }) => {
    const username = uid();
    await request.post('/api/register', {
      data: { first: 'Self', last: 'Admin', username, password: 'adminpass' },
    });
    await request.post('/api/test/make-admin', { data: { username } });
    const login = await request.post('/api/login', { data: { username, password: 'adminpass' } });
    const { token, id } = await login.json();
    const res = await request.delete(`/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Admin panel — UI tests
// ---------------------------------------------------------------------------
test.describe('Admin panel — UI', () => {
  test('Admin panel button is NOT visible for regular users', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Regular',
      last: 'User',
      username: uid(),
      password: 'regular1',
    });
    await expect(page.getByTitle('Admin panel')).not.toBeVisible();
  });

  test('Admin panel button IS visible for admin users', async ({ page, request }) => {
    await registerAndLoginAsAdmin(page, request, {
      first: 'Admin',
      last: 'User',
      username: uid(),
      password: 'admin123',
    });
    await expect(page.getByTitle('Admin panel')).toBeVisible();
  });

  test('Clicking the Admin panel button opens the admin view', async ({ page, request }) => {
    await registerAndLoginAsAdmin(page, request, {
      first: 'Admin',
      last: 'View',
      username: uid(),
      password: 'admin123',
    });
    await page.getByTitle('Admin panel').click();
    // Admin panel heading should be visible
    await expect(page.getByText('User Management')).toBeVisible({ timeout: 5_000 });
  });

  test('Admin panel displays the list of registered users', async ({ page, request }) => {
    const adminUser = uid();
    const otherUser = uid();

    // Register the other user first
    await request.post('/api/register', {
      data: { first: 'Other', last: 'Person', username: otherUser, password: 'other123' },
    });

    await registerAndLoginAsAdmin(page, request, {
      first: 'Admin',
      last: 'List',
      username: adminUser,
      password: 'admin123',
    });
    await page.getByTitle('Admin panel').click();

    // Wait for users to load and verify the other user appears
    await expect(page.locator('tr').filter({ hasText: `@${otherUser}` }).first()).toBeVisible({ timeout: 8_000 });
  });

  test('Admin can toggle admin role for another user', async ({ page, request }) => {
    const adminUser = uid();
    const targetUser = uid();

    const treg = await request.post('/api/register', {
      data: { first: 'Target', last: 'Person', username: targetUser, password: 'target123' },
    });
    const { id: targetId } = await treg.json();

    await registerAndLoginAsAdmin(page, request, {
      first: 'Admin',
      last: 'Toggle',
      username: adminUser,
      password: 'admin123',
    });
    await page.getByTitle('Admin panel').click();
    await expect(page.locator('tr').filter({ hasText: `@${targetUser}` }).first()).toBeVisible({ timeout: 8_000 });

    // Find the Make Admin button for the target user row and click it
    const targetRow = page.locator('tr').filter({ hasText: `@${targetUser}` }).first();
    const toggleBtn = targetRow.getByRole('button', { name: /admin/i }).first();
    await toggleBtn.click();

    // The row should refresh into the admin state.
    await expect(page.locator('tr').filter({ hasText: `@${targetUser}` }).first().getByRole('button', { name: /revoke admin/i })).toBeVisible({ timeout: 5_000 });
  });

  test('Admin can delete another user', async ({ page, request }) => {
    const adminUser = uid();
    const targetUser = uid();

    await request.post('/api/register', {
      data: { first: 'ToDelete', last: 'Person', username: targetUser, password: 'delete123' },
    });

    await registerAndLoginAsAdmin(page, request, {
      first: 'Admin',
      last: 'Delete',
      username: adminUser,
      password: 'admin123',
    });
    await page.getByTitle('Admin panel').click();
    await expect(page.locator('tr').filter({ hasText: `@${targetUser}` }).first()).toBeVisible({ timeout: 8_000 });

    // Handle the confirm dialog
    page.once('dialog', (dialog) => dialog.accept());

    // Click delete button for the target user
    const targetRow = page.locator('tr').filter({ hasText: `@${targetUser}` }).first();
    await targetRow.getByTitle('Delete user').click();

    // User should be gone from the list
    await expect(page.locator('tr').filter({ hasText: `@${targetUser}` })).toHaveCount(0, { timeout: 5_000 });
  });
});
