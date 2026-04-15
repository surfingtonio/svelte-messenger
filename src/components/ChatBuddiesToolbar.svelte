<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Avatar from './Avatar.svelte';
  import type { User } from '../types';

  export let user: User | null = null;
  export let isAdmin: boolean = false;

  let search: string = '';

  const dispatch = createEventDispatcher<{
    filterusers: string;
    logout: void;
    toggleadmin: void;
    opensettings: void;
  }>();

  function handleFilterUsers() {
    dispatch('filterusers', search);
  }

  function handleLogout() {
    dispatch('logout');
  }

  function handleToggleAdmin() {
    dispatch('toggleadmin');
  }

  function handleOpenSettings() {
    dispatch('opensettings');
  }
</script>

<div class="px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">

  <!-- Brand row -->
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 flex items-center justify-center">
        <img src="/logo.svg" alt="Messenger logo" width="32" height="32" />
      </div>
      <span class="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">Messenger</span>
    </div>
    <div class="flex items-center gap-1.5">
      {#if isAdmin}
        <button
          class="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:border-brand-300 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-xs font-[inherit]"
          on:click={handleToggleAdmin}
          title="Admin panel"
          aria-label="Admin panel"
        >
          <i class="fas fa-users-cog" aria-hidden="true" />
        </button>
      {/if}
      <button
        class="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-xs font-[inherit]"
        on:click={handleOpenSettings}
        title="Settings"
        aria-label="Open settings"
      >
        <i class="fas fa-cog" aria-hidden="true" />
      </button>
      <button
        class="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-colors text-xs font-[inherit]"
        on:click={handleLogout}
        title="Log out"
        aria-label="Log out"
      >
          <i class="fas fa-sign-out-alt" aria-hidden="true" />
      </button>
    </div>
  </div>

  <!-- Current user card -->
  {#if user}
    <div class="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 mb-3">
      <div class="relative shrink-0">
        <Avatar first={user.first} last={user.last} size="md" />
        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" aria-hidden="true" />
      </div>
      <div class="flex-1 min-w-0">
        <div data-testid="current-user-name" class="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{user.first} {user.last}</div>
        <div class="text-[0.7rem] text-green-500 font-medium">Active now</div>
      </div>
    </div>
  {/if}

  <!-- Search -->
  <div class="relative flex items-center">
      <i class="fas fa-search absolute left-3 text-slate-400 text-xs pointer-events-none" aria-hidden="true" />
    <input
      type="text"
      class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full pl-8 pr-3 py-2 text-sm font-[inherit] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
      placeholder="Search contacts…"
      bind:value={search}
      on:input={handleFilterUsers}
    />
  </div>
</div>
