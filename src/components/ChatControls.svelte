<script>
  import { createEventDispatcher } from 'svelte';

  export let disabled = false;

  let message = '';

  const dispatch = createEventDispatcher();

  function handleMessageSend() {
    const trimmed = message.trim();
    if (trimmed !== '') {
      dispatch('messagesend', trimmed);
      message = '';
    }
  }

  function handleKeydown(event) {
    dispatch('keyboardactivity', event);
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleMessageSend();
    }
  }
</script>

<style>
  .chat-controls {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.875rem 1.25rem;
    background: var(--bg-card);
    border-top: 1px solid var(--border-color);
  }

  .input-wrap {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }

  .chat-input {
    width: 100%;
    background: var(--bg-input);
    border: 1.5px solid var(--border-color);
    border-radius: var(--border-radius-full);
    padding: 0.625rem 1rem;
    font-size: 0.9rem;
    font-family: inherit;
    color: var(--text-primary);
    outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
    resize: none;
  }

  .chat-input::placeholder {
    color: var(--text-muted);
  }

  .chat-input:focus {
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px var(--brand-primary-light);
    background: white;
  }

  .chat-input:disabled {
    background: var(--bg-disabled);
    color: var(--text-muted);
    cursor: not-allowed;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: var(--brand-primary);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: background var(--transition), transform var(--transition),
      box-shadow var(--transition);
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(108, 99, 255, 0.4);
  }

  .send-btn:hover:not(:disabled) {
    background: var(--brand-primary-dark);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(108, 99, 255, 0.5);
  }

  .send-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .send-btn:disabled {
    background: var(--text-muted);
    cursor: not-allowed;
    box-shadow: none;
  }
</style>

<div class="chat-controls">
  <div class="input-wrap">
    <input
      type="text"
      class="chat-input"
      placeholder={disabled ? 'User is offline' : 'Type a message…'}
      {disabled}
      bind:value={message}
      on:keydown={handleKeydown}
    />
  </div>
  <button
    class="send-btn"
    {disabled}
    on:click|preventDefault={handleMessageSend}
    title="Send message"
  >
    <i class="fas fa-paper-plane" />
  </button>
</div>
