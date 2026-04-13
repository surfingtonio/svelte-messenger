import { test, expect, type Page } from '@playwright/test';
import { uid, registerAndLogin } from './helpers';

// ---------------------------------------------------------------------------
// Chat UI — single user tests
// ---------------------------------------------------------------------------
test.describe('Chat UI — sidebar & navigation', () => {
  test('shows the app brand "Messenger" in the sidebar after login', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Chat',
      last: 'User',
      username: uid(),
      password: 'chatpass1',
    });
    await expect(page.getByText('Messenger').first()).toBeVisible();
  });

  test("shows the logged-in user's full name in the sidebar user card", async ({ page }) => {
    await registerAndLogin(page, { first: 'Robin', last: 'Hood', username: uid(), password: 'sherwood1' });
    await expect(page.locator('[data-testid="current-user-name"]')).toContainText('Robin Hood');
  });

  test('shows the home welcome panel when no contact is selected', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Home',
      last: 'Tester',
      username: uid(),
      password: 'hometest1',
    });
    // Home view is visible in the main panel
    await expect(page.locator('[data-testid="home-view"]')).toBeVisible();
    await expect(page.getByText(/Hey,\s*Home/)).toBeVisible();
  });

  test('shows Settings and Log out buttons in the sidebar toolbar', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Toolbar',
      last: 'Tester',
      username: uid(),
      password: 'toolbar1',
    });
    await expect(page.getByRole('button', { name: 'Open settings' })).toBeVisible();
    await expect(page.getByTitle('Log out')).toBeVisible();
  });

  test('can log out and return to the auth screen', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Log',
      last: 'Out',
      username: uid(),
      password: 'logout456',
    });
    await page.getByTitle('Log out').click();
    await expect(page.getByRole('button', { name: 'Log In' }).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test('contact search input is present and accepts text', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Search',
      last: 'Tester',
      username: uid(),
      password: 'search123',
    });
    const searchInput = page.getByPlaceholder('Search contacts...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('hello');
    await expect(searchInput).toHaveValue('hello');
  });

  test('home panel says "No one else is online" when no other users are connected', async ({ page }) => {
    await registerAndLogin(page, {
      first: 'Solo',
      last: 'User',
      username: uid(),
      password: 'solo1234',
    });
    await expect(page.getByText(/No one else is online/)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Two-user chat tests
// ---------------------------------------------------------------------------
test.describe('Chat UI — two-user messaging', () => {
  test('user A can see user B in the contacts list after both are online', async ({ browser }) => {
    const userA = uid();
    const userB = uid();

    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await registerAndLogin(pageA, { first: 'Alice', last: 'A', username: userA, password: 'pass1234' });
      await registerAndLogin(pageB, { first: 'Bob', last: 'B', username: userB, password: 'pass5678' });

      // A should see Bob in the contacts list
      await expect(pageA.getByText('Bob B')).toBeVisible({ timeout: 8_000 });
      // B should see Alice in the contacts list
      await expect(pageB.getByText('Alice A')).toBeVisible({ timeout: 8_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test('user A can send a message to user B and B receives it', async ({ browser }) => {
    const userA = uid();
    const userB = uid();

    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await registerAndLogin(pageA, { first: 'Alice', last: 'A', username: userA, password: 'pass1234' });
      await registerAndLogin(pageB, { first: 'Bob', last: 'B', username: userB, password: 'pass5678' });

      // Alice selects Bob and sends a message
      await expect(pageA.getByText('Bob B')).toBeVisible({ timeout: 8_000 });
      await pageA.getByText('Bob B').click();

      const messageInput = pageA.getByPlaceholder(/message/i);
      await messageInput.fill('Hello Bob!');
      await pageA.getByRole('button', { name: /send/i }).click();

      // Alice should see her own message
      await expect(pageA.getByText('Hello Bob!')).toBeVisible({ timeout: 5_000 });

      // Bob should receive the message
      await expect(pageB.getByText('Hello Bob!')).toBeVisible({ timeout: 8_000 });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });

  test('clicking a contact in the contacts list opens the chat window', async ({ browser }) => {
    const userA = uid();
    const userB = uid();

    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      await registerAndLogin(pageA, { first: 'Alice', last: 'Sender', username: userA, password: 'pass1234' });
      await registerAndLogin(pageB, { first: 'Bob', last: 'Receiver', username: userB, password: 'pass5678' });

      await expect(pageA.getByText('Bob Receiver')).toBeVisible({ timeout: 8_000 });
      await pageA.getByText('Bob Receiver').click();

      // The home view should be replaced by the chat window (message input visible)
      await expect(pageA.getByPlaceholder(/message/i)).toBeVisible({ timeout: 5_000 });
      // Home view no longer shown
      await expect(pageA.locator('[data-testid="home-view"]')).not.toBeVisible();
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});
