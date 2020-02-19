<script>
  export let user;
  export let selected = false;
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

  .chat-buddy .fullname {
    font-weight: 700;
    font-size: 0.9rem;
  }

  .chat-buddy.selected {
    background: #edf4f6;
  }
</style>

<div class="chat-buddy" class:selected on:click>
  <img src={user.avatar} alt="`${user.first} ${user.last}`" class="avatar" />
  <div class="fullname">{user.first} {user.last}</div>
</div>
