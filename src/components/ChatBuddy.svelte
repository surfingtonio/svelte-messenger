<script lang="ts">
  import Avatar from './Avatar.svelte';
  import type { User } from '../types';

  export let user: User;
  export let selected: boolean = false;
</script>

<button
  class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-full text-left font-[inherit] transition-colors cursor-pointer
    {selected
      ? 'bg-brand-50 dark:bg-brand-900/30 shadow-sm'
      : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'}"
  type="button"
  on:click
>
  <div class="relative shrink-0">
    <Avatar first={user.first} last={user.last} size="md" />
    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" aria-hidden="true" />
  </div>
  <div class="flex-1 min-w-0">
    <div
      class="font-semibold text-sm truncate
        {selected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-slate-100'}"
    >{user.first} {user.last}</div>
    <div class="text-[0.7rem] text-green-500 font-medium mt-0.5" aria-label="Online">Online</div>
  </div>
</button>
