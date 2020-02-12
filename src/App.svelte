<script>
  import { onMount, onDestroy } from 'svelte';
  import io from 'socket.io-client';
  import ChatBuddiesWindow from './components/ChatBuddiesWindow.svelte';
  import ChatWindow from './components/ChatWindow.svelte';
  import AjaxLoader from './components/AjaxLoader.svelte';

  let user = {};
  let users = [];
  let usersCount;
  let chats = [];
  let loading = true;
  let timeout;
  let keyboardActivity = false;

  const socket = io('/chatrooms');

  function handleChatReceive(event) {
    socket.emit('chatreceive', event.detail);
  }

  function handleKeyboardActivity(event) {
    socket.emit('keyboardactivity', user);
  }

  function handlekeyboardActivityStop(event) {
    socket.emit('keyboardactivitystop', user);
  }

  function handleUserAction(data) {
    let everyone = Object.values(data.users);
    users = everyone.filter(buddy => buddy.id !== user.id);
    usersCount = everyone.length;
  }

  function handleSelectBuddy(event) {
    user = event.detail;
  }

  socket.on('userleave', data => handleUserAction(data));

  socket.on('userregister', registeredUser => (user = registeredUser));

  socket.on('userjoin', data => handleUserAction(data));

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
    fetch('https://randomuser.me/api/?nat=us,ca')
      .then(res => {
        loading = false;
        if (res.ok) {
          res
            .json()
            .then(res => {
              let fakeUser = res.results[0];
              user = {
                id: new Date().getTime(),
                username: `${fakeUser.name.first} ${fakeUser.name.last}`,
                avatar: fakeUser.picture.thumbnail
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
      <ChatBuddiesWindow bind:users on:selectbuddy={handleSelectBuddy} />
    </section>
    <section>
      <ChatWindow
        {user}
        {usersCount}
        bind:chats
        bind:keyboardActivity
        on:chatreceive={handleChatReceive}
        on:keyboardactivity={handleKeyboardActivity}
        on:keyboardactivitystop={handlekeyboardActivityStop} />
    </section>
  </div>
{/if}
<p class="not-supported">Screen size not supported</p>
