<script>
  import { createEventDispatcher } from 'svelte';

  export let user = null;

  let search = '';

  const dispatch = createEventDispatcher();

  function handleFilterUsers() {
    dispatch('filterusers', search);
  }
</script>

<style>
  .sidebar-header {
    padding: 1.25rem 1rem 0.75rem;
    border-bottom: 1px solid var(--border-color);
  }

  .app-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .app-icon {
    width: 2rem;
    height: 2rem;
    background: var(--brand-primary);
    border-radius: var(--border-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .app-name {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }

  .current-user {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.5rem 0.625rem;
    border-radius: var(--border-radius);
    background: var(--brand-primary-light);
    margin-bottom: 0.75rem;
  }

  .avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .avatar {
    width: var(--avatar-md);
    height: var(--avatar-md);
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }

  .online-dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 0.625rem;
    height: 0.625rem;
    background: var(--color-online);
    border-radius: 50%;
    border: 2px solid white;
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-status {
    font-size: 0.7rem;
    color: var(--color-online);
    font-weight: 500;
  }

  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    color: var(--text-muted);
    font-size: 0.8rem;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-full);
    padding: 0.5rem 0.75rem 0.5rem 2.125rem;
    font-size: 0.875rem;
    font-family: inherit;
    color: var(--text-primary);
    outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
  }

  .search-input::placeholder {
    color: var(--text-muted);
  }

  .search-input:focus {
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px var(--brand-primary-light);
  }
</style>

<div class="sidebar-header">
  <div class="app-brand">
    <div class="app-icon">
      <i class="fas fa-comment-dots" />
    </div>
    <span class="app-name">Messenger</span>
  </div>

  {#if user}
    <div class="current-user">
      <div class="avatar-wrap">
        <img src={user.avatar} alt="{user.first} {user.last}" class="avatar" />
        <span class="online-dot" />
      </div>
      <div class="user-info">
        <div class="user-name">{user.first} {user.last}</div>
        <div class="user-status">Active now</div>
      </div>
    </div>
  {/if}

  <div class="search-wrap">
    <i class="fas fa-search search-icon" />
    <input
      type="text"
      class="search-input"
      placeholder="Search contacts..."
      bind:value={search}
      on:input={handleFilterUsers}
    />
  </div>
</div>
