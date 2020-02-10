<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import ChatToolbar from './ChatToolbar.svelte';
  import ChatControls from './ChatControls.svelte';
  import KeyboardActivityIndicator from './KeyboardActivityIndicator.svelte';
  import moment from 'moment';

  export let user;
  export let usersCount;
  export let chats = [];
  export let keyboardActivity = false;

  let chatWindow;

  const dispatch = createEventDispatcher();

  function handleMessageSend(event) {
    let chat = {
      message: { content: event.detail, time: new Date() },
      user
    };
    chats = [...chats, chat];
    dispatch('incomingMessage', chat);
  }

  function handleKeyboardActivity(event) {
    event.keyCode === 13
      ? dispatch('keyboardActivityStop', user)
      : dispatch('keyboardActivity', user);
  }

  onMount(() => {
    var observer = new MutationObserver(mutations => {
      chatWindow.scrollTop = chatWindow.scrollHeight - chatWindow.clientHeight;
    });
    observer.observe(chatWindow, { childList: true });
  });
</script>

<style>
  .chat-window {
    display: grid;
    grid-template-rows: 4rem minmax(0, 100vh) 4rem;
    height: 100vh;
  }

  .chat-items {
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  ::-webkit-scrollbar {
    width: var(--scrollbar-width);
  }

  ::-webkit-scrollbar-track {
    background: var(--scrollbar-track-background);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb-color);
    border-radius: var(--scrollbar-thumb-border-radius);
    opacity: 0.1;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--scrollbar-thumb-hover-color);
    opacity: 1;
  }

  .chat-item {
    display: flex;
    margin: var(--chat-item-margin);
    padding: var(--chat-item-padding-y) var(--chat-item-padding-x);
    width: calc(var(--chat-item-max-width) - (var(--chat-item-padding-x) * 2));
  }

  .chat-item .chat {
    max-width: 45%;
  }

  .chat-item.you .chat .user {
    text-align: right;
  }

  .chat-item .chat .user .username {
    color: var(--component-secondary-color);
    font-size: var(--component-small-font);
  }

  .message {
    background: var(--message-other-color);
    border-radius: 0 var(--message-border-radius) var(--message-border-radius)
      var(--message-border-radius);
    justify-content: space-between;
    max-width: var(--messsage-max-width);
    padding: var(--message-padding-y) var(--message-padding-x);
    word-break: break-word;
  }

  .you {
    justify-content: flex-end;
  }

  .you .message {
    background: var(--message-you-color);
    border-radius: var(--message-border-radius) 0 var(--message-border-radius)
      var(--message-border-radius);
  }

  .message .time {
    color: var(--component-secondary-color);
    display: block;
    font-size: var(--component-small-font);
    text-align: right;
  }
</style>

<div class="chat-window">
  <section>
    <ChatToolbar {user} {usersCount} />
  </section>

  <section>
    <div class="chat-items" bind:this={chatWindow}>
      {#each chats as chat}
        <div class={chat.user.id === user.id ? 'chat-item you' : 'chat-item'}>
          <div class="chat">
            <div class="user">
              <span class="username">
                {chat.user.id === user.id ? 'You' : chat.user.username}
              </span>
            </div>
            <div class="message">
              <span class="content">{chat.message.content}</span>
              <span class="time">
                {moment(chat.message.time).format('h:mm:ss a')}
              </span>
            </div>
          </div>
        </div>
      {/each}
    </div>
    <KeyboardActivityIndicator bind:activity={keyboardActivity} />
  </section>

  <section>
    <ChatControls
      on:keyboardactivity={handleKeyboardActivity}
      on:messagesend={handleMessageSend} />
  </section>
</div>
