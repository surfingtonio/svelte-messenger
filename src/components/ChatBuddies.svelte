<script>
  import ChatBuddy from './ChatBuddy.svelte';

  export let users = [];
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
    <ChatBuddy {user} />
  {/each}
</div>
