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
    event.detail.key === 'Enter'
      ? dispatch('keyboardactivitystop', data)
      : dispatch('keyboardactivity', data);
  }

  $: disabled = !receiver.online;
  $: chatToolbarProps = { user: receiver, usersCount };
  $: chatMessagesProps = { user: sender, chats, disabled };
  $: keyboardActivityStatus = `${receiver.first} is typing`;
</script>

<div class="flex flex-col h-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
  <ChatToolbar {...chatToolbarProps} on:back />
  <div class="relative flex flex-col overflow-hidden flex-1 min-h-0">
    <ChatMessages {...chatMessagesProps} />
    <KeyboardActivityIndicator bind:keyboardActivity {keyboardActivityStatus} />
  </div>
  <ChatControls
    {disabled}
    on:keyboardactivity={handleKeyboardActivity}
    on:messagesend={handleMessageSend}
  />
</div>
