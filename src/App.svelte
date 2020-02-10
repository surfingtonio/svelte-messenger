<script>
  import { onMount, onDestroy } from 'svelte';
  import io from 'socket.io-client';
  import ChatWindow from './components/ChatWindow.svelte';
  import AjaxLoader from './components/AjaxLoader.svelte';

  let user = {};
  let usersCount;
  let chats = [];
  let loading = true;
  let timeout;
  let keyboardActivity = false;

  const socket = io('/chatrooms');

  function handleMessageReceive(event) {
    socket.emit('messagereceive', event.detail);
  }

  function handlekeyboardActivity(event) {
    socket.emit('keyboardactivity', user);
  }

  function handlekeyboardActivityStop(event) {
    socket.emit('keyboardactivitystop', user);
  }

  socket.on('userleave', user => {
    usersCount--;
  });

  socket.on('userregister', registeredUser => (user = registeredUser));

  socket.on('userjoin', data => (usersCount = Object.keys(data.users).length));

  socket.on('messagereceive', chat => {
    new Audio('./sounds/pling.mp3').play();
    chats = [...chats, chat];
  });

  socket.on('keyboardactivity', users => {
    keyboardActivity = true;
    clearTimeout(timeout);
    timeout = setTimeout(() => (keyboardActivity = false), 1000);
  });

  socket.on('keyboardactivitystop', user => {
    keyboardActivity = false;
    clearTimeout(timeout);
  });

  onMount(() => {
    fetch('https://uinames.com/api/?minlen=4&region=canada')
      .then(res => {
        loading = false;
        if (res.ok) {
          res
            .json()
            .then(data => {
              user = {
                id: new Date().getTime(),
                username: `${data.name} ${data.surname}`,
                avatar: `./images/avatar-${data.gender}.png`
              };
              socket.emit('userregister', user);
            })
            .catch(err => console.error(err));
        } else {
          user = {
            id: new Date().getTime(),
            username: `John Doe`,
            avatar: `./images/avatar-male.png`
          };
          socket.emit('userregister', user);
        }
      })
      .catch(err => console.error(err));
  });

  onDestroy(() => clearInterval(timeout));
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

  .not-supported {
    display: none;
  }

  .container {
    display: grid;
    grid-template-columns: auto;
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

<div class="container">
  {#if loading}
    <AjaxLoader />
  {:else}
    <section>
      <ChatWindow
        {user}
        {usersCount}
        bind:chats
        bind:keyboardActivity
        on:messagesend={handleMessageReceive}
        on:keyboardactivity={handlekeyboardActivity}
        on:keyboardactivitystop={handlekeyboardActivityStop} />
    </section>
  {/if}
</div>
<p class="not-supported">Screen size not supported</p>
