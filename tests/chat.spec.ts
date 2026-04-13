import { test, expect } from '@playwright/test';

function uid() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

// Helper: register and log in, leaving the chat UI visible
async function loginAs(page, { first, last, username, password }) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign Up' }).first().click();
  await page.getByLabel('First name').fill(first);
  await page.getByLabel('Last name').fill(last);
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.locator('.container')).toBeVisible({ timeout: 10_000 });
}

test.describe('Chat UI', () => {
  test('shows the app brand in the sidebar after login', async ({ page }) => {
    await loginAs(page, {
      first: 'Chat',
      last: 'User',
      username: uid(),
      password: 'chatpass1'
    });
    await expect(page.getByText('Messenger')).toBeVisible();
  });

  test("shows the logged-in user's name in the sidebar", async ({ page }) => {
    const username = uid();
    await loginAs(page, { first: 'Robin', last: 'Hood', username, password: 'sherwood1' });
    await expect(page.locator('.current-user .user-name')).toContainText('Robin Hood');
  });

  test('shows the home welcome panel when no contact is selected', async ({ page }) => {
    await loginAs(page, {
      first: 'Home',
      last: 'Tester',
      username: uid(),
      password: 'hometest1'
    });
    await expect(page.locator('.home')).toBeVisible();
  });

  test('shows logout button in the sidebar', async ({ page }) => {
    await loginAs(page, {
      first: 'Logout',
      last: 'Tester',
      username: uid(),
      password: 'logout123'
    });
    await expect(page.locator('.logout-btn')).toBeVisible();
  });

  test('can log out and return to the auth screen', async ({ page }) => {
    await loginAs(page, {
      first: 'Log',
      last: 'Out',
      username: uid(),
      password: 'logout456'
    });
    await page.locator('.logout-btn').click();
    // After logout the auth screen should be visible again
    await expect(page.getByRole('button', { name: 'Log In' }).first()).toBeVisible({
      timeout: 5_000
    });
  });

  test('contact search input is present', async ({ page }) => {
    await loginAs(page, {
      first: 'Search',
      last: 'Tester',
      username: uid(),
      password: 'search123'
    });
    await expect(page.locator('.search-input')).toBeVisible();
  });
});
