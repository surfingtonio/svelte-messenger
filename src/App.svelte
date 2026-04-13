<script lang="ts">
  import { onDestroy } from 'svelte';
  import _ from 'lodash';
  import app from './store';
  import { io } from 'socket.io-client';
  import type { Socket } from 'socket.io-client';
  import Auth from './components/Auth.svelte';
  import ChatBuddiesWindow from './components/ChatBuddiesWindow.svelte';
  import ChatWindow from './components/ChatWindow.svelte';
  import Home from './components/Home.svelte';
  import AdminPanel from './components/AdminPanel.svelte';
  import type { User, ChatMsg, AuthPayload } from './types';

  interface KeyboardActivityEntry {
    timeoutId: ReturnType<typeof setTimeout>;
  }

  let keyboardActivities: Record<string, KeyboardActivityEntry | null> = {};
  let selectedBuddyId: number | null = null;
  let loggedIn = false;
  let adminView = false;
  let authToken = '';
  let socket: Socket | null = null;

  function appendToStore(store: 'chats', key: string | number, data: ChatMsg) {
    const existingData: ChatMsg[] = _.get($app, `${store}.${key}`, []);
    return _.set($app, `${store}.${key}`, [...existingData, data]);
  }

  function clearKeyboardTimeout(userId: string | number) {
    const entry = _.get(keyboardActivities, String(userId), null) as KeyboardActivityEntry | null;
    if (entry?.timeoutId) clearTimeout(entry.timeoutId);
    keyboardActivities = _.set(keyboardActivities, String(userId), null);
  }

  function clearAllKeyboardTimeouts() {
    const entries = Object.values(keyboardActivities);
    entries.forEach((e) => { if (e?.timeoutId) clearTimeout(e.timeoutId); });
  }

  function connect(user: Partial<User>, token: string) {
    socket = io($app.config.namespace, { auth: { token } });

    socket.on('afteruserregister', (event: { users: Record<string, User> }) => {
      $app = _.set($app, 'users', event.users);
    });

    socket.on('keyboardactivity', (u: User) => {
      clearKeyboardTimeout(u.id);
      const timeoutId = setTimeout(() => clearKeyboardTimeout(u.id), $app.config.keyboardActivityTimeOut);
      keyboardActivities = _.set(keyboardActivities, String(u.id), { timeoutId });
    });

    socket.on('keyboardactivitystop', (u: User) => {
      clearKeyboardTimeout(u.id);
    });

    socket.on('userleave', (event: { users: Record<string, User> }) => {
      $app = _.set($app, 'users', event.users);
    });

    socket.on('userregister', (u: User) => {
      $app = _.set($app, 'user', u);
    });

    socket.on('messagereceive', (chat: ChatMsg) => {
      selectedBuddyId = selectedBuddyId ?? chat.sender.id;
      $app = appendToStore('chats', chat.sender.id, chat);
      new Audio('./sounds/pop.mp3').play().catch(() => {});
    });

    socket.emit('userregister', user);
  }

  function handleAuth(event: CustomEvent<AuthPayload>) {
    const { token, ...user } = event.detail;
    authToken = token;
    $app = _.set($app, 'user', user);
    loggedIn = true;
    connect(user, token);
  }

  function handleLogout() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    clearAllKeyboardTimeouts();
    $app = _.set($app, 'user', {});
    $app = _.set($app, 'users', {});
    $app = _.set($app, 'chats', {});
    selectedBuddyId = null;
    keyboardActivities = {};
    adminView = false;
    authToken = '';
    loggedIn = false;
  }

  onDestroy(() => {
    clearAllKeyboardTimeouts();
    if (socket) socket.disconnect();
  });

  function handleSelectBuddy(event: CustomEvent<number>) {
    selectedBuddyId = event.detail;
    adminView = false;
  }

  function handleToggleAdmin() {
    adminView = !adminView;
    if (adminView) selectedBuddyId = null;
  }

  function handleMessageSend(event: CustomEvent<ChatMsg>) {
    $app = appendToStore('chats', event.detail.receiver.id, event.detail);
    socket?.emit('messagesend', event.detail);
  }

  function handleKeyboardActivity(event: CustomEvent<{ user: User; socketId: string }>) {
    socket?.emit('keyboardactivity', {
      user: event.detail.user,
      socketId: event.detail.socketId,
    });
  }

  function handlekeyboardActivityStop(event: CustomEvent<{ user: User; socketId: string }>) {
    socket?.emit('keyboardactivitystop', {
      user: event.detail.user,
      socketId: event.detail.socketId,
    });
  }

  $: user = _.get($app, 'user', null) as Partial<User>;
  $: users = _.get($app, 'users', {}) as Record<string, User>;
  $: chats = _.get($app, `chats.${selectedBuddyId}`, []) as ChatMsg[];
  $: receiver = _.get($app, `users.${selectedBuddyId}`, null) as User | null;
  $: buddies = _.filter(users, (buddy: User) => buddy.online && buddy.id !== (user as User).id);
  $: usersCount = buddies.length;
  $: keyboardActivity = _.get(keyboardActivities, String(selectedBuddyId), null);
  $: isAdmin = (user as User).roles?.includes('admin') ?? false;
  $: adminSelfId = (user as User).id ?? 0;
  $: chatWindowProps = {
    sender: user as User,
    receiver,
    usersCount,
    chats,
    keyboardActivity: !_.isNull(keyboardActivity),
  };
</script>

<style>
  :global(:root) {
    /* Brand */
    --brand-primary: #6c63ff;
    --brand-primary-dark: #5a52e0;
    --brand-primary-light: rgba(108, 99, 255, 0.1);

    /* Backgrounds */
    --bg-app: #f0f2f7;
    --bg-sidebar: #ffffff;
    --bg-chat: #f0f2f7;
    --bg-card: #ffffff;
    --bg-input: #f0f2f7;
    --bg-message-out: #6c63ff;
    --bg-message-in: #ffffff;
    --bg-disabled: #f5f5f5;

    /* Text */
    --text-primary: #1a1a2e;
    --text-secondary: #8896ab;
    --text-muted: #aab4be;
    --text-inverse: #ffffff;
    --text-brand: #6c63ff;

    /* Borders */
    --border-color: #e8ecf0;
    --border-radius-sm: 0.375rem;
    --border-radius: 0.75rem;
    --border-radius-lg: 1.25rem;
    --border-radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

    /* Status */
    --color-online: #22c55e;
    --color-offline: #cbd5e1;

    /* Sizing */
    --sidebar-width: 20rem;
    --toolbar-height: 4rem;
    --controls-height: 4rem;
    --avatar-sm: 2rem;
    --avatar-md: 2.5rem;
    --avatar-lg: 3rem;

    /* Transitions */
    --transition: 0.15s ease;
    --transition-slow: 0.25s ease;
  }

  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(::-webkit-scrollbar) {
    width: 4px;
  }

  :global(::-webkit-scrollbar-track) {
    background: transparent;
  }

  :global(::-webkit-scrollbar-thumb) {
    background: var(--border-color);
    border-radius: var(--border-radius-full);
  }

  :global(::-webkit-scrollbar-thumb:hover) {
    background: var(--text-muted);
  }

  .not-supported {
    display: none;
  }

  .container {
    display: grid;
    grid-template-columns: var(--sidebar-width) 1fr;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: var(--bg-app);
  }

  @media (max-width: 319px), (max-height: 319px) {
    .container {
      display: none;
    }

    .not-supported {
      align-items: center;
      display: flex;
      height: 100vh;
      justify-content: center;
      white-space: nowrap;
      width: 100vw;
    }
  }
</style>

{#if !loggedIn}
  <Auth on:auth={handleAuth} />
{:else}
  <div class="container">
    <ChatBuddiesWindow
      users={buddies}
      {user}
      {isAdmin}
      bind:selectedBuddyId
      on:selectbuddy={handleSelectBuddy}
      on:logout={handleLogout}
      on:toggleadmin={handleToggleAdmin} />
    {#if adminView}
      <AdminPanel selfId={adminSelfId} token={authToken} on:sessionexpired={handleLogout} />
    {:else if selectedBuddyId === null}
      <Home bind:usersCount {user} />
    {:else}
      <ChatWindow
        {...chatWindowProps}
        on:messagesend={handleMessageSend}
        on:keyboardactivity={handleKeyboardActivity}
        on:keyboardactivitystop={handlekeyboardActivityStop} />
    {/if}
  </div>
{/if}
<p class="not-supported">Screen size not supported</p>
