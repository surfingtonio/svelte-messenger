<script lang="ts">
  import ChatBuddiesToolbar from './ChatBuddiesToolbar.svelte';
  import ChatBuddies from './ChatBuddies.svelte';
  import type { User } from '../types';

  export let users: User[] = [];
  export let user: User | null = null;
  export let selectedBuddyId: number | undefined = undefined;
  export let isAdmin: boolean = false;

  let filterText: string = '';

  function filterUsers(list: User[], text: string): User[] {
    if (!text) return list;
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    return list.filter((u) => regex.test(`${u.first} ${u.last}`));
  }

  function handleFilterUsers(event: CustomEvent<string>) {
    filterText = event.detail;
  }

  $: filteredUsers = filterUsers(users, filterText);
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
