<script>
  import { createEventDispatcher } from 'svelte';
  import ChatBuddy from './ChatBuddy.svelte';

  export let users = [];
  export let selectedUser;

  const dispatch = createEventDispatcher();

  function handleSelectBuddy(event) {
    selectedUser = event.detail;
    dispatch('selectbuddy', selectedUser);
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
  {#each users as user}
    <ChatBuddy
      {user}
      selected={typeof selectedUser !== 'undefined' && user.id === selectedUser.id}
      on:selectbuddy={handleSelectBuddy} />
  {/each}
</div>
