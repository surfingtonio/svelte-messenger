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

<style>
  .chat-message {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    max-width: 70%;
    margin-bottom: 0.125rem;
  }

  .chat-message.you {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .chat-message.other {
    align-self: flex-start;
  }

  .avatar-slot {
    flex-shrink: 0;
    margin-bottom: 0.25rem;
  }

  .bubble-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .you .bubble-wrap {
    align-items: flex-end;
  }

  .other .bubble-wrap {
    align-items: flex-start;
  }

  .sender-name {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-muted);
    padding: 0 0.5rem;
  }

  .bubble {
    padding: 0.625rem 0.9rem;
    border-radius: 1.125rem;
    font-size: 0.875rem;
    line-height: 1.5;
    word-break: break-word;
    max-width: 100%;
    position: relative;
  }

  .you .bubble {
    background: var(--bg-message-out);
    color: var(--text-inverse);
    border-bottom-right-radius: 0.25rem;
  }

  .other .bubble {
    background: var(--bg-message-in);
    color: var(--text-primary);
    border-bottom-left-radius: 0.25rem;
    box-shadow: var(--shadow-sm);
  }

  .time {
    font-size: 0.65rem;
    opacity: 0.7;
    display: block;
    margin-top: 0.25rem;
    padding: 0 0.5rem;
    color: var(--text-muted);
  }

  .you .time {
    text-align: right;
  }
</style>

<div class="chat-message" class:you={isYou} class:other={!isYou}>
  {#if !isYou}
    <div class="avatar-slot">
      <Avatar first={chat.sender.first} last={chat.sender.last} size="sm" />
    </div>
  {/if}
  <div class="bubble-wrap">
    {#if !isYou}
      <span class="sender-name">{chat.sender.first}</span>
    {/if}
    <div class="bubble">
      {chat.message.content}
    </div>
    <span class="time">{formatTime(chat.message.time)}</span>
  </div>
</div>
