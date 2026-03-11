<script>
  import { onMount, onDestroy } from 'svelte';
  import _ from 'lodash';
  import app from './store.js';
  import io from 'socket.io-client';
  import AjaxLoader from './components/AjaxLoader.svelte';
  import ChatBuddiesWindow from './components/ChatBuddiesWindow.svelte';
  import ChatWindow from './components/ChatWindow.svelte';
  import Home from './components/Home.svelte';

  let keyboardActivities = {};
  let loading = true;
  let selectedBuddyId = null;
  const socket = io($app.config.namespace);

  function appendToStore(store, key, data) {
    const existingData = _.get($app, `${store}.${key}`, []);
    return _.set($app, `${store}.${key}`, [...existingData, data]);
  }

  function clearKeyboardTimeout(userId) {
    let timeoutId = _.get(keyboardActivities, `${userId}.timeoutId`, null);
    if (timeoutId) clearTimeout(timeoutId);
    keyboardActivities = _.set(keyboardActivities, `${userId}`, null);
  }

  function clearAllKeyboardTimeouts() {
    const timeoutIds = _.map(keyboardActivities, 'timeoutId');
    return _.map(timeoutIds, clearTimeout);
  }

  async function fetchUser() {
    return await fetch('https://randomuser.me/api/?nat=us,ca')
      .then(handleErrors)
      .then(res =>
        res.json().then(res => ({
          id: new Date().getTime(),
          first: res.results[0].name.first,
          last: res.results[0].name.last,
          username: res.results[0].login.username,
          avatar: res.results[0].picture.thumbnail,
          online: false
        }))
      );
  }

  function handleErrors(res) {
    if (!res.ok) throw Error(res.statusText);
    return res;
  }

  onMount(async () => {
    const user = await fetchUser();
    $app = _.set($app, 'user', user);
    loading = false;
    socket.emit('userregister', user);
  });

  onDestroy(() => clearAllKeyboardTimeouts());

  function handleSelectBuddy(event) {
    selectedBuddyId = event.detail;
  }

  function handleMessageSend(event) {
    $app = appendToStore('chats', event.detail.receiver.id, event.detail);
    socket.emit('messagesend', event.detail);
  }

  function handleKeyboardActivity(event) {
    socket.emit('keyboardactivity', {
      user: event.detail.user,
      socketId: event.detail.socketId
    });
  }

  function handlekeyboardActivityStop(event) {
    socket.emit('keyboardactivitystop', {
      user: event.detail.user,
      socketId: event.detail.socketId
    });
  }

  socket.on('afteruserregister', event => {
    $app = _.set($app, 'users', event.users);
  });

  socket.on('keyboardactivity', user => {
    clearKeyboardTimeout(user.id);
    let timeoutId = setTimeout(() => clearKeyboardTimeout(user.id), 1000);
    keyboardActivities = _.set(keyboardActivities, `${user.id}`, { timeoutId });
  });

  socket.on('keyboardactivitystop', user => {
    clearKeyboardTimeout(user.id);
  });

  socket.on('userleave', event => {
    $app = _.set($app, 'users', event.users);
  });

  socket.on('userregister', user => {
    $app = _.set($app, 'user', user);
  });

  socket.on('messagereceive', chat => {
    selectedBuddyId = selectedBuddyId || chat.sender.id;
    $app = appendToStore('chats', chat.sender.id, chat);
    new Audio('./sounds/pop.mp3').play();
  });

  $: user = _.get($app, 'user', null);
  $: users = _.get($app, 'users', null);
  $: chats = _.get($app, `chats.${selectedBuddyId}`, []);
  $: receiver = _.get($app, `users.${selectedBuddyId}`, null);
  $: keyboardActivityTimeOut = _.get($app, 'keyboardActivityTimeOut', 1000);
  $: buddies = _.filter(users, buddy => buddy.online && buddy.id !== user.id);
  $: usersCount = buddies.length;
  $: keyboardActivity = _.get(keyboardActivities, selectedBuddyId, null);
  $: chatWindowProps = {
    sender: user,
    receiver,
    usersCount,
    chats,
    keyboardActivity: !_.isNull(keyboardActivity)
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

{#if loading}
  <AjaxLoader />
{:else}
  <div class="container">
    <ChatBuddiesWindow
      users={buddies}
      {user}
      bind:selectedBuddyId
      on:selectbuddy={handleSelectBuddy} />
    {#if selectedBuddyId === null}
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
