<script>
  import { createEventDispatcher } from 'svelte';
  import ChatBuddy from './ChatBuddy.svelte';

  export let users = [];
  export let selectedUserId;

  const dispatch = createEventDispatcher();

  function handleClick(user) {
    selectedUserId = user.id;
    dispatch('selectbuddy', selectedUserId);
  }
</script>

<style>
  .chat-buddies {
    border-right: 1px solid var(--component-line-color);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
  }
</style>

<div class="chat-buddies">
  {#each users as user (user.id)}
    <ChatBuddy
      {user}
      selected={user.id === selectedUserId}
      on:click={handleClick.bind(this, user)} />
  {/each}
</div>
