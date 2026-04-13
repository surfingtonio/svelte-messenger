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
  import SettingsModal from './components/SettingsModal.svelte';
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
  let showSettings = false;
  // Mobile: 'contacts' shows the sidebar, 'chat' shows the main panel
  let mobileView: 'contacts' | 'chat' = 'contacts';

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
    mobileView = 'chat';
  }

  function handleToggleAdmin() {
    adminView = !adminView;
    if (adminView) {
      selectedBuddyId = null;
      mobileView = 'chat';
    }
  }

  function handleBack() {
    mobileView = 'contacts';
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

{#if !loggedIn}
  <Auth on:auth={handleAuth} />
{:else}
  <!-- Outer wrapper fills the full viewport height -->
  <div class="flex h-dvh overflow-hidden bg-slate-100 dark:bg-slate-900">

    <!-- Sidebar (contacts list) — full-width on mobile, fixed 20 rem on md+ -->
    <aside
      data-testid="contacts-sidebar"
      class="flex flex-col w-full md:w-80 shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 {mobileView === 'chat' ? 'max-md:hidden' : ''}"
    >
      <ChatBuddiesWindow
        users={buddies}
        {user}
        {isAdmin}
        bind:selectedBuddyId
        on:selectbuddy={handleSelectBuddy}
        on:logout={handleLogout}
        on:toggleadmin={handleToggleAdmin}
        on:opensettings={() => (showSettings = true)}
      />
    </aside>

    <!-- Main content — full-width on mobile, flex-1 on md+ -->
    <main
      data-testid="main-panel"
      class="flex flex-col flex-1 min-w-0 {mobileView !== 'chat' ? 'max-md:hidden' : ''}"
    >
      {#if adminView}
        <AdminPanel selfId={adminSelfId} token={authToken} on:sessionexpired={handleLogout} on:back={handleBack} />
      {:else if selectedBuddyId === null}
        <Home bind:usersCount {user} on:back={handleBack} />
      {:else}
        <ChatWindow
          {...chatWindowProps}
          on:messagesend={handleMessageSend}
          on:keyboardactivity={handleKeyboardActivity}
          on:keyboardactivitystop={handlekeyboardActivityStop}
          on:back={handleBack}
        />
      {/if}
    </main>
  </div>

  {#if showSettings}
    <SettingsModal on:close={() => (showSettings = false)} />
  {/if}
{/if}
