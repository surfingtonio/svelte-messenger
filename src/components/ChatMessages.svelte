<script>
  import { onMount } from 'svelte';
  import ChatMessage from './ChatMessage.svelte';

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
  .chat-messages {
    flex-direction: column;
    display: flex;
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    padding: var(--chat-item-padding-y) var(--chat-item-padding-x);
    width: calc(var(--chat-item-max-width) - (var(--chat-item-padding-x) * 2));
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

<div class="chat-messages" bind:this={chatWindow}>
  {#each chats as chat}
    <ChatMessage {user} {chat} />
  {/each}
</div>
