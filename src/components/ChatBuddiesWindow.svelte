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
    const regex = new RegExp(text, 'i');
    return list.filter((u) => regex.test(`${u.first} ${u.last}`));
  }

  function handleFilterUsers(event: CustomEvent<string>) {
    filterText = event.detail;
  }

  $: filteredUsers = filterUsers(users, filterText);
</script>

<style>
  .chat-buddies-window {
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;
    overflow: hidden;
  }
</style>

<div class="chat-buddies-window">
  <ChatBuddiesToolbar
    {user}
    {isAdmin}
    on:filterusers={handleFilterUsers}
    on:logout
    on:toggleadmin />
  <ChatBuddies
    bind:selectedUserId={selectedBuddyId}
    users={filteredUsers}
    on:selectbuddy />
</div>
