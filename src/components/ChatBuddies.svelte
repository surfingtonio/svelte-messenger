<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChatBuddy from './ChatBuddy.svelte';
  import Icon from './Icon.svelte';
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
    {#each users as user, i (user.id)}
      <div class="animate-slide-up" style="animation-delay: {Math.min(i, 10) * 30}ms; animation-fill-mode: both;">
        <ChatBuddy
          {user}
          selected={user.id === selectedUserId}
          on:click={() => handleClick(user)}
        />
      </div>
    {/each}
  {:else}
    <div class="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center text-slate-400 dark:text-slate-500">
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
        <Icon name="user-x" size={20} className="opacity-50" />
      </div>
      <p class="text-sm m-0 font-medium">No contacts online</p>
    </div>
  {/if}
</div>
