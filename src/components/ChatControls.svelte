<script>
  import { createEventDispatcher } from 'svelte';

  export let disabled = false;

  let message;

  const dispatch = createEventDispatcher();

  function handleMessageSend(event) {
    message = message.trim();
    if (message !== '') {
      dispatch('messagesend', message);
      message = '';
    }
  }

  function handleKeydown(event) {
    dispatch('keyboardactivity', event);
  }
</script>

<style>
  .chat-controls {
    background: var(--component-secondary-background);
    display: flex;
    height: calc(100% - (var(--chat-controls-padding-y) * 2));
    margin: 0;
    padding: var(--chat-controls-padding-y) var(--chat-controls-padding-x);
  }

  .chat-controls .chat-input {
    background: var(--component-primary-background);
    border-radius: var(--component-border-radius);
    border: var(--component-border-width) solid var(--component-line-color);
    color: var(--component-primary-color);
    flex: 2;
    margin-right: var(--toolbar-separator-width);
    outline: none;
    padding: var(--chat-input-padding-y) var(--chat-input-padding-x);
  }

  .chat-controls :disabled {
    background: #efefef;
  }

  .chat-controls button {
    background: var(--component-secondary-background);
    border-radius: var(--component-border-radius);
    border: 1px solid var(--component-line-color);
    color: var(--component-primary-color);
    cursor: pointer;
    padding: 0 1rem;
  }
</style>

<form class="chat-controls">
  <input
    type="text"
    class="chat-input"
    placeholder="Type a message..."
    {disabled}
    bind:value={message}
    on:keydown={handleKeydown} />
  <button type="submit" on:click|preventDefault={handleMessageSend}>
    Send
  </button>
</form>
