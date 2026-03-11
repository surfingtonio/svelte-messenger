<script>
  import moment from 'moment';

  export let chat;
  export let user;

  $: isYou = chat.sender.id === user.id;
</script>

<style>
  .chat-message {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    max-width: 70%;
    margin-bottom: 0.125rem;
  }

  .chat-message.you {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .chat-message.other {
    align-self: flex-start;
  }

  .avatar {
    width: var(--avatar-sm);
    height: var(--avatar-sm);
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    margin-bottom: 0.25rem;
  }

  .bubble-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .you .bubble-wrap {
    align-items: flex-end;
  }

  .other .bubble-wrap {
    align-items: flex-start;
  }

  .sender-name {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-muted);
    padding: 0 0.5rem;
  }

  .bubble {
    padding: 0.625rem 0.9rem;
    border-radius: 1.125rem;
    font-size: 0.875rem;
    line-height: 1.5;
    word-break: break-word;
    max-width: 100%;
    position: relative;
  }

  .you .bubble {
    background: var(--bg-message-out);
    color: var(--text-inverse);
    border-bottom-right-radius: 0.25rem;
  }

  .other .bubble {
    background: var(--bg-message-in);
    color: var(--text-primary);
    border-bottom-left-radius: 0.25rem;
    box-shadow: var(--shadow-sm);
  }

  .time {
    font-size: 0.65rem;
    opacity: 0.7;
    display: block;
    margin-top: 0.25rem;
    padding: 0 0.5rem;
    color: var(--text-muted);
  }

  .you .time {
    text-align: right;
  }
</style>

<div class="chat-message" class:you={isYou} class:other={!isYou}>
  {#if !isYou}
    <img
      src={chat.sender.avatar}
      alt="{chat.sender.first} {chat.sender.last}"
      class="avatar"
    />
  {/if}
  <div class="bubble-wrap">
    {#if !isYou}
      <span class="sender-name">{chat.sender.first}</span>
    {/if}
    <div class="bubble">
      {chat.message.content}
    </div>
    <span class="time">{moment(chat.message.time).format('h:mm a')}</span>
  </div>
</div>
