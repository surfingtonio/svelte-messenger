<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { User } from '../types';

  export let user: Partial<User>;
  export let usersCount: number = 0;

  const dispatch = createEventDispatcher<{ back: void }>();
</script>

<div data-testid="home-view" class="flex flex-col h-full bg-slate-100 dark:bg-slate-900">
  <!-- Mobile back bar -->
  <div class="md:hidden flex items-center px-4 h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
    <button
      class="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm font-[inherit] -ml-1 mr-2"
      on:click={() => dispatch('back')}
      aria-label="Back to contacts"
    >
      <i class="fas fa-arrow-left" aria-hidden="true" />
    </button>
    <span class="font-semibold text-slate-900 dark:text-slate-100">Messenger</span>
  </div>

  <!-- Welcome content -->
  <div class="flex-1 flex items-center justify-center p-8">
    <div class="text-center max-w-xs">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-full mb-6">
        <i class="fas fa-comment-dots text-brand-500 dark:text-brand-400 text-3xl" aria-hidden="true" />
      </div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
        Hey, <span class="text-brand-500">{user.first}!</span>
      </h2>
      {#if usersCount > 0}
        <p class="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          You have {usersCount} contact{usersCount === 1 ? '' : 's'} online.<br />
          Pick one to start chatting.
        </p>
        <span class="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
          <i class="fas fa-arrow-left text-brand-500" aria-hidden="true" />
          Select a contact on the left
        </span>
      {:else}
        <p class="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          No one else is online right now.<br />
          Check back soon!
        </p>
        <span class="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
          <i class="fas fa-clock text-brand-500" aria-hidden="true" />
          Waiting for others to join…
        </span>
      {/if}
    </div>
  </div>
</div>
