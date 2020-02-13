<script>
  import { createEventDispatcher } from 'svelte';
  import ChatBuddiesToolbar from './ChatBuddiesToolbar.svelte';
  import ChatBuddies from './ChatBuddies.svelte';

  export let users = [];

  let selectedUserId = 0;
  let filterText;
  let timeout;

  const dispatch = createEventDispatcher();

  function filterUsers(users, text) {
    return users.filter(user => {
      const regex = RegExp(text, 'i');
      return regex.test(user.username);
    });
  }

  function handleSelectBuddy(event) {
    dispatch('selectbuddy', event.detail);
  }

  function handleFilterUsers(event) {
    filterText = event.detail;
    filteredUsers = filterUsers(users, filterText);
  }

  function handleInput(event) {
    filterText = event.target.value;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      filteredUsers = filterUsers(users, filterText);
    }, 500);
  }

  $: filteredUsers = filterUsers(users, filterText);
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
    <ChatBuddiesToolbar
      on:filterusers={handleFilterUsers}
      on:input={handleInput} />
  </section>
  <section>
    <ChatBuddies
      bind:selectedUserId
      users={filteredUsers}
      on:selectbuddy={handleSelectBuddy} />
  </section>
</div>
