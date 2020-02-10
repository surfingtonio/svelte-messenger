<script>
  import { onMount } from 'svelte';
  import moment from 'moment';

  export let user;
  export let chats = [];

  let chatWindow;

  onMount(() => {
    var observer = new MutationObserver(mutations => {
      chatWindow.scrollTop = chatWindow.scrollHeight - chatWindow.clientHeight;
    });
    observer.observe(chatWindow, { childList: true });
  });
</script>

<style>
  .chat-items {
    flex-direction: column;
    display: flex;
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: var(--chat-item-padding-y) var(--chat-item-padding-x);
    width: calc(var(--chat-item-max-width) - (var(--chat-item-padding-x) * 2));
  }

  .chat-items .chat-item {
    display: flex;
  }

  .chat-items .chat-item .chat {
    max-width: 45%;
  }

  .chat-items .chat-item .username {
    color: var(--component-secondary-color);
    font-size: var(--component-small-font);
  }

  .chat-items .message {
    background: var(--message-other-color);
    border-radius: 0 var(--message-border-radius) var(--message-border-radius)
      var(--message-border-radius);
    padding: var(--message-padding-y) var(--message-padding-x);
    word-break: break-word;
  }

  .chat-items .message .time {
    color: var(--component-secondary-color);
    display: block;
    font-size: var(--component-small-font);
    padding-top: 0.25rem;
    text-align: right;
  }

  .chat-items .you {
    justify-content: flex-end;
  }

  .chat-items .you .user {
    text-align: right;
  }

  .chat-items .you .message {
    background: var(--message-you-color);
    border-radius: var(--message-border-radius) 0 var(--message-border-radius)
      var(--message-border-radius);
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
</style>

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
