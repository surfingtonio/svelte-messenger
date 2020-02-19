<script>
  export let user;
  export let usersCount = 0;
</script>

<style>
  :root {
    --online-color: #73c538;
  }

  .chat-toolbar {
    background: var(--component-secondary-background);
    display: flex;
    height: calc(100% - (var(--chat-toolbar-padding-y) * 2));
    justify-content: space-between;
    padding: var(--chat-toolbar-padding-y) var(--chat-toolbar-padding-x);
    width: calc(100% - (var(--chat-toolbar-padding-x) * 2));
  }

  .chat-toolbar .controls {
    align-items: center;
    display: flex;
    font-size: 1.5rem;
    justify-content: space-between;
  }

  .chat-toolbar .online-users {
    color: var(--component-theme-background);
  }

  .chat-toolbar .online-users span {
    background: var(--online-color);
    border-radius: 50%;
    border: 1px solid var(--online-color);
    color: #fff;
    display: inline-block;
    font-size: 0.5rem;
    font-weight: 700;
    height: 0.5rem;
    line-height: 0.5rem;
    margin: 0 0 -0.7rem -0.7rem;
    padding: 0.166rem;
    text-align: center;
    vertical-align: middle;
    width: 0.5rem;
  }

  .chat-toolbar .user {
    align-items: center;
    display: flex;
  }

  .chat-toolbar .user .avatar {
    border-radius: 40%;
    margin-right: 0.75rem;
    max-height: 100%;
  }

  .chat-toolbar .user .fullname {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: var(--chat-toolbar-height);
    white-space: nowrap;
  }
</style>

<div class="chat-toolbar">
  <div class="user">
    <img src={user.avatar} alt={`${user.first} ${user.last}`} class="avatar" />
    <span class="fullname">{user.first} {user.last}</span>
  </div>
  <div class="controls">
    <div
      class="online-users"
      title="{usersCount} online {usersCount === 1 ? 'user' : 'users'}">
      <i class="fas fa-users" />
      <span class="usersCount">{usersCount}</span>
    </div>
  </div>
</div>
