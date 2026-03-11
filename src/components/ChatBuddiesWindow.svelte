<script>
  import ChatBuddiesToolbar from './ChatBuddiesToolbar.svelte';
  import ChatBuddies from './ChatBuddies.svelte';

  export let users = [];
  export let user = null;
  export let selectedBuddyId;

  let filterText;

  function filterUsers(users, text) {
    return users.filter(user => {
      const regex = RegExp(text, 'i');
      return regex.test(`${user.first} ${user.last}`);
    });
  }

  function handleFilterUsers(event) {
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
    on:filterusers={handleFilterUsers} />
  <ChatBuddies
    bind:selectedUserId={selectedBuddyId}
    users={filteredUsers}
    on:selectbuddy />
</div>
