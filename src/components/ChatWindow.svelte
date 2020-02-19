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

  const dispatch = createEventDispatcher();

  function handleMessageSend(event) {
    let chat = {
      message: { content: event.detail, time: new Date() },
      sender,
      receiver
    };
    dispatch('messagesend', chat);
  }

  function handleKeyboardActivity(event) {
    const data = { user: sender, socketId: receiver.socketId };
    event.detail.keyCode === 13
      ? dispatch('keyboardactivitystop', data)
      : dispatch('keyboardactivity', data);
  }

  $: disabled = !receiver.online;
  $: chatToolbarProps = { user: receiver, usersCount };
  $: chatMessagesProps = { user: sender, chats, disabled };
  $: keyboardActivityStatus = `${receiver.first} ${receiver.last} is typing`;
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
      {disabled}
      on:keyboardactivity={handleKeyboardActivity}
      on:messagesend={handleMessageSend} />
  </section>
</div>
