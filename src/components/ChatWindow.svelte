<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChatToolbar from './ChatToolbar.svelte';
  import ChatMessages from './ChatMessages.svelte';
  import ChatControls from './ChatControls.svelte';
  import KeyboardActivityIndicator from './KeyboardActivityIndicator.svelte';
  import type { User, ChatMsg } from '../types';

  export let sender: User;
  export let receiver: User;
  export let usersCount: number;
  export let chats: ChatMsg[] = [];
  export let keyboardActivity: boolean = false;

  const dispatch = createEventDispatcher<{
    messagesend: ChatMsg;
    keyboardactivity: { user: User; socketId: string };
    keyboardactivitystop: { user: User; socketId: string };
  }>();

  function handleMessageSend(event: CustomEvent<string>) {
    const chat: ChatMsg = {
      message: { content: event.detail, time: new Date() },
      sender,
      receiver,
    };
    dispatch('messagesend', chat);
  }

  function handleKeyboardActivity(event: CustomEvent<KeyboardEvent>) {
    const data = { user: sender, socketId: receiver.socketId ?? '' };
    event.detail.keyCode === 13
      ? dispatch('keyboardactivitystop', data)
      : dispatch('keyboardactivity', data);
  }

  $: disabled = !receiver.online;
  $: chatToolbarProps = { user: receiver, usersCount };
  $: chatMessagesProps = { user: sender, chats, disabled };
  $: keyboardActivityStatus = `${receiver.first} is typing`;
</script>

<style>
  .chat-window {
    display: grid;
    grid-template-rows: var(--toolbar-height) 1fr auto;
    height: 100vh;
    background: var(--bg-chat);
    overflow: hidden;
  }

  .messages-area {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }
</style>

<div class="chat-window">
  <ChatToolbar {...chatToolbarProps} />
  <div class="messages-area">
    <ChatMessages {...chatMessagesProps} />
    <KeyboardActivityIndicator bind:keyboardActivity {keyboardActivityStatus} />
  </div>
  <ChatControls
    {disabled}
    on:keyboardactivity={handleKeyboardActivity}
    on:messagesend={handleMessageSend} />
</div>
