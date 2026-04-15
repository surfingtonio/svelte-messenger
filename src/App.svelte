<script lang="ts">
  import { onDestroy } from 'svelte';
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

  const notificationSound = new Audio('./sounds/pop.mp3');

  function appendToStore(store: 'chats', key: string | number, data: ChatMsg) {
    const existingData: ChatMsg[] = $app[store][String(key)] ?? [];
    return { ...$app, [store]: { ...$app[store], [String(key)]: [...existingData, data] } };
  }

  function clearKeyboardTimeout(userId: string | number) {
    const entry = keyboardActivities[String(userId)] ?? null;
    if (entry?.timeoutId) clearTimeout(entry.timeoutId);
    keyboardActivities = { ...keyboardActivities, [String(userId)]: null };
  }

  function clearAllKeyboardTimeouts() {
    const entries = Object.values(keyboardActivities);
    entries.forEach((e) => { if (e?.timeoutId) clearTimeout(e.timeoutId); });
  }

  function connect(user: Partial<User>, token: string) {
    socket = io($app.config.namespace, { auth: { token } });

    socket.on('afteruserregister', (event: { users: Record<string, User> }) => {
      $app = { ...$app, users: event.users };
    });

    socket.on('keyboardactivity', (u: User) => {
      clearKeyboardTimeout(u.id);
      const timeoutId = setTimeout(() => clearKeyboardTimeout(u.id), $app.config.keyboardActivityTimeOut);
      keyboardActivities = { ...keyboardActivities, [String(u.id)]: { timeoutId } };
    });

    socket.on('keyboardactivitystop', (u: User) => {
      clearKeyboardTimeout(u.id);
    });

    socket.on('userleave', (event: { users: Record<string, User> }) => {
      $app = { ...$app, users: event.users };
    });

    socket.on('userregister', (u: User) => {
      $app = { ...$app, user: u };
    });

    socket.on('messagereceive', (chat: ChatMsg) => {
      selectedBuddyId = selectedBuddyId ?? chat.sender.id;
      $app = appendToStore('chats', chat.sender.id, chat);
      notificationSound.play().catch(() => {});
    });

    socket.emit('userregister');
  }

  function handleAuth(event: CustomEvent<AuthPayload>) {
    const { token, ...user } = event.detail;
    authToken = token;
    $app = { ...$app, user };
    loggedIn = true;
    connect(user, token);
  }

  function handleLogout() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    clearAllKeyboardTimeouts();
    $app = { ...$app, user: {}, users: {}, chats: {} };
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

  function handleKeyboardActivityStop(event: CustomEvent<{ user: User; socketId: string }>) {
    socket?.emit('keyboardactivitystop', {
      user: event.detail.user,
      socketId: event.detail.socketId,
    });
  }

  $: user = ($app.user ?? null) as Partial<User>;
  $: users = ($app.users ?? {}) as Record<string, User>;
  $: chats = (selectedBuddyId !== null ? $app.chats[String(selectedBuddyId)] : null) ?? [] as ChatMsg[];
  $: receiver = (selectedBuddyId !== null ? $app.users[String(selectedBuddyId)] ?? null : null) as User | null;
  $: buddies = Object.values(users).filter((buddy: User) => buddy.online && buddy.id !== (user as User).id);
  $: usersCount = buddies.length;
  $: keyboardActivity = keyboardActivities[String(selectedBuddyId)] ?? null;
  $: isAdmin = (user as User).roles?.includes('admin') ?? false;
  $: adminSelfId = (user as User).id ?? 0;
  $: chatWindowProps = {
    sender: user as User,
    receiver,
    usersCount,
    chats,
    keyboardActivity: keyboardActivity !== null,
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
          on:keyboardactivitystop={handleKeyboardActivityStop}
          on:back={handleBack}
        />
      {/if}
    </main>
  </div>

  {#if showSettings}
    <SettingsModal on:close={() => (showSettings = false)} />
  {/if}
{/if}
