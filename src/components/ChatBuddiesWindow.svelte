<script lang="ts">
  import ChatBuddiesToolbar from './ChatBuddiesToolbar.svelte';
  import ChatBuddies from './ChatBuddies.svelte';
  import { filterUsersByName } from '../utils';
  import type { User } from '../types';

  export let users: User[] = [];
  export let user: User | null = null;
  export let selectedBuddyId: number | undefined = undefined;
  export let isAdmin: boolean = false;

  let filterText: string = '';

  function handleFilterUsers(event: CustomEvent<string>) {
    filterText = event.detail;
  }

  $: filteredUsers = filterUsersByName(users, filterText);
</script>

<div class="flex flex-col h-full overflow-hidden">
  <ChatBuddiesToolbar
    {user}
    {isAdmin}
    on:filterusers={handleFilterUsers}
    on:logout
    on:toggleadmin
    on:opensettings
  />
  <ChatBuddies
    bind:selectedUserId={selectedBuddyId}
    users={filteredUsers}
    on:selectbuddy
  />
</div>
