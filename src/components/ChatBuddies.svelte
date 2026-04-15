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

<div class="flex flex-col h-full overflow-x-hidden overflow-y-auto px-3 py-2">
  {#if users.length > 0}
    <div class="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2 py-1.5">
      Online — {users.length}
    </div>
    {#each users as user (user.id)}
      <ChatBuddy
        {user}
        selected={user.id === selectedUserId}
        on:click={() => handleClick(user)}
      />
    {/each}
  {:else}
    <div class="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center text-slate-400 dark:text-slate-500">
      <i class="fas fa-user-slash text-3xl opacity-40" aria-hidden="true" />
      <p class="text-sm m-0">No contacts online</p>
    </div>
  {/if}
</div>
