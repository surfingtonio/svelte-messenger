<script lang="ts">
  import Avatar from './Avatar.svelte';
  import type { User, ChatMsg } from '../types';

  export let chat: ChatMsg;
  export let user: User;

  $: isYou = chat.sender.id === user.id;

  function formatTime(time: Date | string): string {
    return new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
</script>

<div class="flex items-end gap-2 max-w-[70%] mb-0.5 {isYou ? 'self-end flex-row-reverse' : 'self-start'}">
  {#if !isYou}
    <div class="shrink-0 mb-1">
      <Avatar first={chat.sender.first} last={chat.sender.last} size="sm" />
    </div>
  {/if}
  <div class="flex flex-col gap-0.5 {isYou ? 'items-end' : 'items-start'}">
    {#if !isYou}
      <span class="text-[0.7rem] font-semibold text-slate-400 dark:text-slate-500 px-2">{chat.sender.first}</span>
    {/if}
    <div
      class="px-3.5 py-2.5 rounded-[1.125rem] text-sm leading-relaxed break-words max-w-full
        {isYou
          ? 'bg-brand-500 text-white rounded-br-[0.25rem]'
          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-[0.25rem] shadow-sm'}"
    >{chat.message.content}</div>
    <span class="text-[0.65rem] opacity-60 px-2 text-slate-500 dark:text-slate-400 {isYou ? 'text-right' : ''}">{formatTime(chat.message.time)}</span>
  </div>
</div>
