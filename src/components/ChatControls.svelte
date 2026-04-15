<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from './Icon.svelte';

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

<div class="flex items-center gap-2.5 px-4 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200/80 dark:border-slate-700/80 shrink-0">
  <input
    type="text"
    class="flex-1 bg-slate-100 dark:bg-slate-700/60 border-0 rounded-xl px-4 py-2.5 text-sm font-[inherit] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed"
    placeholder={disabled ? 'User is offline' : 'Type a message…'}
    {disabled}
    aria-label="Message"
    name="message"
    bind:value={message}
    on:keydown={handleKeydown}
  />
  <button
    class="w-10 h-10 flex items-center justify-center bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl text-white shadow-[0_2px_8px_theme(colors.brand.500/40%)] hover:shadow-[0_4px_12px_theme(colors.brand.500/50%)] disabled:shadow-none transition-[color,background-color,box-shadow,transform] shrink-0"
    {disabled}
    on:click|preventDefault={handleMessageSend}
    title="Send message"
    aria-label="Send message"
  >
    <Icon name="send" size={16} />
  </button>
</div>
