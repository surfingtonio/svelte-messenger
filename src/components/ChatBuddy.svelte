<script>
  export let user;
</script>

<style>
  .chat-buddy {
    align-items: center;
    border-bottom: 1px solid var(--component-line-color);
    cursor: pointer;
    display: flex;
    padding: 0.5rem 1rem;
  }

  .chat-buddy .avatar {
    border-radius: 40%;
    margin-right: 0.75rem;
  }

  .chat-buddy .user {
    font-weight: 700;
    font-size: 0.9rem;
  }
</style>

<div class="chat-buddy">
  <img src={user.avatar} alt={user.username} class="avatar" />
  <div class="user">{user.username}</div>
</div>
