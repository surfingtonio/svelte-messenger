<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let disabled: boolean = false;

  let message: string = '';

  const dispatch = createEventDispatcher<{
    messagesend: string;
    keyboardactivity: KeyboardEvent;
  }>();

  function handleMessageSend() {
    const trimmed = message.trim();
    if (trimmed !== '') {
      dispatch('messagesend', trimmed);
      message = '';
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    dispatch('keyboardactivity', event);
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleMessageSend();
    }
  }
</script>

<div class="flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0">
  <input
    type="text"
    class="flex-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full px-4 py-2.5 text-sm font-[inherit] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed"
    placeholder={disabled ? 'User is offline' : 'Type a message…'}
    {disabled}
    bind:value={message}
    on:keydown={handleKeydown}
  />
  <button
    class="w-10 h-10 flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed rounded-full text-white text-sm shadow-[0_2px_8px_theme(colors.brand.500/40%)] hover:shadow-[0_4px_12px_theme(colors.brand.500/50%)] disabled:shadow-none transition shrink-0 font-[inherit]"
    {disabled}
    on:click|preventDefault={handleMessageSend}
    title="Send message"
    aria-label="Send message"
  >
    <i class="fas fa-paper-plane" />
  </button>
</div>
