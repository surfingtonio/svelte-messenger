<script>
  export let user;
  export let usersCount = 0;
</script>

<style>
  .home {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: var(--bg-chat);
    padding: 2rem;
  }

  .welcome-card {
    text-align: center;
    max-width: 22rem;
  }

  .icon-ring {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 5rem;
    height: 5rem;
    background: var(--brand-primary-light);
    border-radius: 50%;
    margin-bottom: 1.5rem;
  }

  .icon-ring i {
    font-size: 2rem;
    color: var(--brand-primary);
  }

  .greeting {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
    letter-spacing: -0.02em;
  }

  .greeting span {
    color: var(--brand-primary);
  }

  .subtitle {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    margin: 0 0 1.75rem;
    line-height: 1.6;
  }

  .hint {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-full);
    padding: 0.625rem 1.125rem;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    box-shadow: var(--shadow-sm);
  }

  .hint i {
    color: var(--brand-primary);
  }
</style>

<div class="home">
  <div class="welcome-card">
    <div class="icon-ring">
      <i class="fas fa-comment-dots" />
    </div>
    <h2 class="greeting">
      Hey, <span>{user.first}!</span>
    </h2>
    {#if usersCount > 0}
      <p class="subtitle">
        You have {usersCount} contact{usersCount === 1 ? '' : 's'} online.<br />
        Pick one to start chatting.
      </p>
      <span class="hint">
        <i class="fas fa-arrow-left" />
        Select a contact on the left
      </span>
    {:else}
      <p class="subtitle">
        No one else is online right now.<br />
        Check back soon!
      </p>
      <span class="hint">
        <i class="fas fa-clock" />
        Waiting for others to join…
      </span>
    {/if}
  </div>
</div>
