<script>
  import { onMount } from 'svelte';
  import ChatMessage from './ChatMessage.svelte';

  export let user;
  export let chats = [];
  export let disabled = false;

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
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 1.25rem 1.5rem;
    gap: 0.25rem;
  }

  .chat-messages.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
</style>

<div class="chat-messages" class:disabled bind:this={chatWindow}>
  {#each chats as chat}
    <ChatMessage {user} {chat} />
  {/each}
</div>
