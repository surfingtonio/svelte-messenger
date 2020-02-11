<script>
  import moment from 'moment';

  export let chat = {};
  export let user = {};
</script>

<style>
  .chat-message {
    display: flex;
    padding-bottom: 0.5rem;
  }

  .chat-message .chat {
    max-width: 500px;
  }

  .chat-message .username {
    color: var(--component-secondary-color);
    font-size: var(--component-small-font);
  }

  .chat-message .message {
    background: var(--message-other-color);
    border-radius: 0 var(--message-border-radius) var(--message-border-radius)
      var(--message-border-radius);
    padding: var(--message-padding-y) var(--message-padding-x);
    word-break: break-word;
  }

  .chat-message .message .time {
    color: var(--component-secondary-color);
    display: block;
    font-size: var(--component-small-font);
    padding-top: 0.25rem;
    text-align: right;
  }

  .chat-message.you {
    justify-content: flex-end;
  }

  .chat-message.you .user {
    text-align: right;
  }

  .chat-message.you .message {
    background: var(--message-you-color);
    border-radius: var(--message-border-radius) 0 var(--message-border-radius)
      var(--message-border-radius);
  }

  @media (max-width: 600px) {
    .chat-message .chat {
      max-width: 100%;
    }
  }

  .chat {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
  }

  .chat .user {
    flex-basis: 100%;
    order: 1;
    width: 100%;
  }

  .chat .avatar {
    border-radius: 40%;
    flex-basis: auto;
    flex: 0;
    height: 2rem;
    margin-right: 0.25rem;
    order: 2;
  }

  .chat .message {
    flex-basis: auto;
    flex: 1;
    order: 3;
  }
</style>

<div class={chat.user.id === user.id ? 'chat-message you' : 'chat-message'}>
  <div class="chat">
    {#if chat.user.id !== user.id}
      <img src={chat.user.avatar} alt={chat.user.username} class="avatar" />
    {/if}
    <div class="user">
      <span class="username">
        {chat.user.id === user.id ? 'You' : chat.user.username}
      </span>
    </div>
    <div class="message">
      <span class="content">{chat.message.content}</span>
      <span class="time">{moment(chat.message.time).format('h:mm:ss a')}</span>
    </div>
  </div>
</div>
