<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from './Icon.svelte';
  import type { User } from '../types';

  export let user: Partial<User>;
  export let usersCount: number = 0;

  const dispatch = createEventDispatcher<{ back: void }>();
</script>

<div data-testid="home-view" class="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
  <!-- Mobile back bar -->
  <div class="md:hidden flex items-center px-4 h-16 border-b border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shrink-0">
    <button
      class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors -ml-1 mr-2"
      on:click={() => dispatch('back')}
      aria-label="Back to contacts"
    >
      <Icon name="arrow-left" size={16} />
    </button>
    <span class="font-semibold text-slate-900 dark:text-slate-100">Messenger</span>
  </div>

  <!-- Welcome content -->
  <div class="flex-1 flex items-center justify-center p-8">
    <div class="text-center max-w-xs animate-fade-in">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-2xl mb-6">
        <Icon name="message-circle" size={36} className="text-brand-500 dark:text-brand-400" />
      </div>
      <h2 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
        Hey, <span class="text-brand-500">{user.first}!</span>
      </h2>
      {#if usersCount > 0}
        <p class="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          You have {usersCount} contact{usersCount === 1 ? '' : 's'} online.<br />
          Pick one to start chatting.
        </p>
        <span class="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
          <Icon name="arrow-left" size={14} className="text-brand-500" />
          Select a contact on the left
        </span>
      {:else}
        <p class="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          No one else is online right now.<br />
          Check back soon!
        </p>
        <span class="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
          <Icon name="clock" size={14} className="text-brand-500" />
          Waiting for others to join…
        </span>
      {/if}
    </div>
  </div>
</div>
