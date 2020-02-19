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
    --chat-controls-height: 3rem;
    --chat-controls-padding-x: 0.25rem;
    --chat-controls-padding-y: 0.25rem;
    --chat-input-padding-x: 0.25rem;
    --chat-input-padding-y: 0.5rem;
    --chat-item-margin: 0.5rem 0;
    --chat-item-padding-x: 1rem;
    --chat-item-padding-y: 0;
    --chat-items-max-width: 100vw;
    --chat-items-min-width: 480px;
    --chat-toolbar-height: 3rem;
    --chat-toolbar-padding-x: 1rem;
    --chat-toolbar-padding-y: 0.5rem;
    --component-border-radius: 0.25rem;
    --component-border-width: 1px;
    --component-line-color: #e4e9f2;
    --component-max-height: 100%;
    --component-max-width: 100%;
    --component-min-width: 480px;
    --component-primary-background: #fff;
    --component-primary-color: #101010;
    --component-secondary-background: #f5f6f8;
    --component-secondary-color: #97a4b2;
    --component-small-font: 0.75rem;
    --component-theme-background: #7360f2;
    --message-border-radius: 1rem;
    --message-max-width: 30rem;
    --message-other-color: #efefef;
    --message-padding-x: 1rem;
    --message-padding-y: 0.5rem;
    --message-you-color: #d8ebff;
    --scrollbar-thumb-border-radius: 0.2rem;
    --scrollbar-thumb-color: rgba(228, 228, 228, 0.5);
    --scrollbar-thumb-hover-color: rgba(228, 228, 228, 1);
    --scrollbar-track-background: transparent;
    --scrollbar-width: 0.5rem;
    --toolbar-separator-width: 0.25rem;
  }

  :global(::-webkit-scrollbar) {
    width: var(--scrollbar-width);
  }

  :global(::-webkit-scrollbar-track) {
    background: var(--scrollbar-track-background);
  }

  :global(::-webkit-scrollbar-thumb) {
    background: var(--scrollbar-thumb-color);
    border-radius: var(--scrollbar-thumb-border-radius);
    opacity: 0.1;
  }

  :global(::-webkit-scrollbar-thumb:hover) {
    background: var(--scrollbar-thumb-hover-color);
    opacity: 1;
  }

  .not-supported {
    display: none;
  }

  .container {
    display: grid;
    grid-template-columns: 18rem auto;
    grid-template-rows: minmax(0, 100vh) auto;
    height: 100vh;
    width: 100vw;
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
    <section>
      <ChatBuddiesWindow
        users={buddies}
        bind:selectedBuddyId
        on:selectbuddy={handleSelectBuddy} />
    </section>
    {#if selectedBuddyId === null}
      <section class="home">
        <Home bind:usersCount {user} />
      </section>
    {:else}
      <section>
        <ChatWindow
          {...chatWindowProps}
          on:messagesend={handleMessageSend}
          on:keyboardactivity={handleKeyboardActivity}
          on:keyboardactivitystop={handlekeyboardActivityStop} />
      </section>
    {/if}
  </div>
{/if}
<p class="not-supported">Screen size not supported</p>
