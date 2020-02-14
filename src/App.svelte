<script>
  import { onMount, onDestroy } from 'svelte';
  import app from './store.js';
  import io from 'socket.io-client';
  import _ from 'lodash';
  import Home from './components/Home.svelte';
  import ChatBuddiesWindow from './components/ChatBuddiesWindow.svelte';
  import ChatWindow from './components/ChatWindow.svelte';
  import AjaxLoader from './components/AjaxLoader.svelte';

  let chats;
  let timeout;
  let keyboardActivity = false;
  let keyboardActivityStatus = 'Someone is typing';

  const socket = io($app.config.namespace);

  function handleMessageSend(event) {
    // user: { id, username, avatar, socketId }
    // chat: { message: {content, time}, sender: <user>, receiver: <user> }
    let chat = {
      message: { content: event.detail, time: new Date() },
      sender: $app.user,
      receiver: $app.activeReceiver
    };
    let chats = $app.chats[chat.receiver.socketId] || [];
    $app = {
      ...$app,
      chats: {
        ...$app.chats,
        [chat.receiver.socketId]: [...chats, chat]
      }
    };
    socket.emit('messagesend', chat);
  }

  function handleUserAction(event) {
    $app = { ...$app, users: event.users };
  }

  function handleSelectBuddy(event) {
    let chats = $app.chats[event.detail.socketId] || [];
    $app = {
      ...$app,
      activeReceiver: event.detail,
      chats: { ...$app.chats, [event.detail.socketId]: chats }
    };
  }

  function handleKeyboardActivity(event) {
    socket.emit('keyboardactivity', {
      sender: event.detail,
      receiver: $app.activeReceiver
    });
  }

  function handlekeyboardActivityStop(event) {
    socket.emit('keyboardactivitystop', {
      sender: event.detail,
      receiver: $app.activeReceiver
    });
  }

  socket.on('userleave', event => {
    handleUserAction(event);
  });

  socket.on('userregister', registeredUser => {
    $app = { ...$app, user: registeredUser };
  });

  socket.on('afteruserregister', event => handleUserAction(event));

  socket.on('messagereceive', chat => {
    // user: { id, username, avatar, socketId }
    // chat: { message: {content, time}, sender: <user>, receiver: <user> }
    let chats = $app.chats[chat.sender.socketId] || [];
    $app = {
      ...$app,
      activeReceiver: chat.sender,
      chats: {
        ...$app.chats,
        [chat.sender.socketId]: [...chats, chat]
      }
    };
    new Audio('./sounds/pop.mp3').play();
  });

  socket.on('keyboardactivity', event => {
    keyboardActivity = true;
    keyboardActivityStatus = `${event.sender.username} is typing`;
    clearTimeout(timeout);
    timeout = setTimeout(
      () => (keyboardActivity = false),
      $app.config.keyboardActivityTimeOut
    );
  });

  socket.on('keyboardactivitystop', event => {
    keyboardActivity = false;
    clearTimeout(timeout);
  });

  onMount(() => {
    fetch('https://randomuser.me/api/?nat=us,ca')
      .then(res => {
        $app = { ...$app, isLoading: false };
        if (res.ok) {
          res
            .json()
            .then(res => {
              let fakeUser = res.results[0];
              $app = {
                ...$app,
                user: {
                  id: new Date().getTime(),
                  username: `${fakeUser.name.first} ${fakeUser.name.last}`,
                  avatar: fakeUser.picture.thumbnail
                }
              };
              socket.emit('userregister', $app.user);
            })
            .catch(err => console.error(err));
        } else {
          $app = {
            ...$app,
            user: {
              id: new Date().getTime(),
              username: `John Doe`,
              avatar: `./images/avatar-male.png`
            }
          };
          socket.emit('userregister', $app.user);
        }
      })
      .catch(err => console.error(err));
  });

  onDestroy(() => clearInterval(timeout));

  $: users = Object.values($app.users).filter(user => user.id !== $app.user.id);
  $: usersCount = Object.values(users).length;

  $: chatWindowProps = {
    sender: $app.user,
    receiver: $app.activeReceiver,
    usersCount: usersCount,
    chats: $app.chats[$app.activeReceiver.socketId],
    keyboardActivity,
    keyboardActivityStatus
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

{#if $app.isLoading}
  <AjaxLoader />
{:else}
  <div class="container">
    <section>
      <ChatBuddiesWindow {users} on:selectbuddy={handleSelectBuddy} />
    </section>
    {#if !_.isEmpty($app.activeReceiver)}
      <section>
        <ChatWindow
          {...chatWindowProps}
          on:messagesend={handleMessageSend}
          on:keyboardactivity={handleKeyboardActivity}
          on:keyboardactivitystop={handlekeyboardActivityStop} />
      </section>
    {:else}
      <section class="home">
        <Home bind:usersCount user={$app.user} />
      </section>
    {/if}
  </div>
{/if}
<p class="not-supported">Screen size not supported</p>
