<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Avatar from './Avatar.svelte';
  import Icon from './Icon.svelte';
  import type { User } from '../types';

  export let user: User;
  export let usersCount: number = 0;

  const dispatch = createEventDispatcher<{ back: void }>();
</script>

<div class="flex items-center justify-between px-4 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
  <div class="flex items-center gap-3">
    <!-- Mobile back button -->
    <button
      class="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors -ml-1"
      on:click={() => dispatch('back')}
      aria-label="Back to contacts"
    >
      <Icon name="arrow-left" size={16} />
    </button>
    <div class="relative shrink-0">
      <Avatar first={user.first} last={user.last} size="md" />
      <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" aria-hidden="true" />
    </div>
    <div>
      <div class="font-bold text-[0.9375rem] text-slate-900 dark:text-slate-100 leading-tight">{user.first} {user.last}</div>
      <div class="text-xs text-green-500 font-medium">Online</div>
    </div>
  </div>
  <div>
    <div
      class="flex items-center gap-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full"
      title="{usersCount} online {usersCount === 1 ? 'user' : 'users'}"
    >
      <Icon name="users" size={12} />
      {usersCount} online
    </div>
  </div>
</div>
