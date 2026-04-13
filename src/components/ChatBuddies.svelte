<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChatBuddy from './ChatBuddy.svelte';
  import type { User } from '../types';

  export let users: User[] = [];
  export let selectedUserId: number | undefined = undefined;

  const dispatch = createEventDispatcher<{ selectbuddy: number }>();

  function handleClick(user: User) {
    selectedUserId = user.id;
    dispatch('selectbuddy', selectedUserId);
  }
</script>

<style>
  .chat-buddies {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0.5rem 0.75rem;
    gap: 0.125rem;
  }

  .section-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 0.5rem 0.5rem 0.25rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 2rem 1rem;
    color: var(--text-muted);
    text-align: center;
  }

  .empty-state i {
    font-size: 2rem;
    opacity: 0.4;
  }

  .empty-state p {
    font-size: 0.875rem;
    margin: 0;
  }
</style>

<div class="chat-buddies">
  {#if users.length > 0}
    <div class="section-label">Online — {users.length}</div>
    {#each users as user (user.id)}
      <ChatBuddy
        {user}
        selected={user.id === selectedUserId}
        on:click={handleClick.bind(this, user)} />
    {/each}
  {:else}
    <div class="empty-state">
      <i class="fas fa-user-slash" />
      <p>No contacts online</p>
    </div>
  {/if}
</div>
