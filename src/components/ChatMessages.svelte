<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import ChatMessage from './ChatMessage.svelte';
  import type { User, ChatMsg } from '../types';

  export let user: User;
  export let chats: ChatMsg[] = [];
  export let disabled: boolean = false;

  let chatWindow: HTMLDivElement;
  let observer: MutationObserver;

  onMount(() => {
    observer = new MutationObserver(() => {
      chatWindow.scrollTop = chatWindow.scrollHeight - chatWindow.clientHeight;
    });
    observer.observe(chatWindow, { childList: true });
  });

  onDestroy(() => {
    observer?.disconnect();
  });
</script>

<div
  class="flex-1 flex flex-col overflow-x-hidden overflow-y-auto px-4 py-5 gap-0.5 chat-bg {disabled ? 'opacity-60 pointer-events-none' : ''}"
  bind:this={chatWindow}
  aria-live="polite"
  aria-label="Chat messages"
  role="log"
>
  {#each chats as chat}
    <ChatMessage {user} {chat} />
  {/each}
</div>
