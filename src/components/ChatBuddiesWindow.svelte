<script>
  import ChatBuddiesToolbar from './ChatBuddiesToolbar.svelte';
  import ChatBuddies from './ChatBuddies.svelte';

  export let users = [];

  function handleFilterUsers(event) {
    filteredUsers = users.filter(user => {
      const regex = RegExp(event.detail, 'i');
      return regex.test(user.username);
    });
  }

  $: filteredUsers = users || [];
</script>

<style>
  .chat-buddies-window {
    border-right: 1px solid var(--component-line-color);
    display: grid;
    grid-template-rows: 4rem minmax(0, 100vh);
    height: 100vh;
  }
</style>

<div class="chat-buddies-window">
  <section>
    <ChatBuddiesToolbar on:filterusers={handleFilterUsers} />
  </section>
  <section>
    <ChatBuddies users={filteredUsers} />
  </section>
</div>
