<script>
  import { createEventDispatcher } from 'svelte';

  let searchInput;

  function handleChange(event) {
    dispatch('filterusers', searchInput.value);
  }

  const dispatch = createEventDispatcher();
</script>

<style>
  .chat-buddies-toolbar {
    align-items: center;
    background: var(--component-secondary-background);
    border-right: 1px solid #fff;
    display: flex;
    height: 100%;
  }

  .chat-buddies-toolbar .search {
    display: flex;
    flex: 1;
    padding: 0.5rem 1rem;
  }

  .chat-buddies-toolbar .search input {
    border-radius: 0.5rem;
    border: 1px solid var(--component-line-color);
    flex: 1;
    outline: none;
    padding: var(--chat-input-padding-y) var(--chat-input-padding-x);
  }

  .chat-buddies-toolbar .button {
    background: transparent;
    border: 0;
  }

  .chat-buddies-toolbar .search-button {
    margin-left: -2rem;
  }
</style>

<div class="chat-buddies-toolbar">
  <form class="search">
    <input type="text" placeholder="Search..." bind:this={searchInput} />
    <button class="button search-button" on:click|preventDefault={handleChange}>
      <i class="fas fa-search search-icon" />
    </button>
  </form>
</div>
