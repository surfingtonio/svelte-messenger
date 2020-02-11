<script>
  import { createEventDispatcher } from 'svelte';
  import ChatToolbar from './ChatToolbar.svelte';
  import ChatMessages from './ChatMessages.svelte';
  import ChatControls from './ChatControls.svelte';
  import KeyboardActivityIndicator from './KeyboardActivityIndicator.svelte';

  export let user;
  export let usersCount;
  export let chats = [];
  export let keyboardActivity = false;

  const dispatch = createEventDispatcher();

  function handleMessageSend(event) {
    let chat = {
      message: { content: event.detail, time: new Date() },
      user
    };
    chats = [...chats, chat];
    dispatch('chatreceive', chat);
  }

  function handleKeyboardActivity(event) {
    event.detail.keyCode === 13
      ? dispatch('keyboardactivitystop', user)
      : dispatch('keyboardactivity', user);
  }
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
    <ChatToolbar {user} {usersCount} />
  </section>

  <section>
    <ChatMessages {user} {chats} />
    <KeyboardActivityIndicator bind:keyboardActivity />
  </section>

  <section>
    <ChatControls
      on:keyboardactivity={handleKeyboardActivity}
      on:messagesend={handleMessageSend} />
  </section>
</div>
