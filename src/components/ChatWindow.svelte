<script>
  import { createEventDispatcher } from 'svelte';
  import ChatToolbar from './ChatToolbar.svelte';
  import ChatMessages from './ChatMessages.svelte';
  import ChatControls from './ChatControls.svelte';
  import KeyboardActivityIndicator from './KeyboardActivityIndicator.svelte';

  export let sender;
  export let receiver;
  export let usersCount;
  export let chats = [];

  export let keyboardActivity = false;
  export let keyboardActivityStatus;

  const dispatch = createEventDispatcher();

  function handleMessageSend(event) {
    dispatch('messagesend', event.detail);
  }

  function handleKeyboardActivity(event) {
    event.detail.keyCode === 13
      ? dispatch('keyboardactivitystop', sender)
      : dispatch('keyboardactivity', sender);
  }

  $: chatToolbarProps = { user: receiver, usersCount };
  $: chatMessagesProps = { user: sender, chats };
</script>

<style>
  .chat-window {
    display: grid;
    grid-template-rows: 4rem minmax(0, 100vh) 4rem;
    height: 100vh;
  }
</style>

<div class="chat-window">
  <section>
    <ChatToolbar {...chatToolbarProps} />
  </section>

  <section>
    <ChatMessages {...chatMessagesProps} />
    <KeyboardActivityIndicator bind:keyboardActivity {keyboardActivityStatus} />
  </section>

  <section>
    <ChatControls
      on:keyboardactivity={handleKeyboardActivity}
      on:messagesend={handleMessageSend} />
  </section>
</div>
