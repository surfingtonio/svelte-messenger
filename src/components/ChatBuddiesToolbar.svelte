<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Avatar from './Avatar.svelte';
  import type { User } from '../types';

  export let user: User | null = null;

  let search: string = '';

  const dispatch = createEventDispatcher<{
    filterusers: string;
    logout: void;
  }>();

  function handleFilterUsers() {
    dispatch('filterusers', search);
  }

  function handleLogout() {
    dispatch('logout');
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
  }

  .brand-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.875rem;
    height: 1.875rem;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    color: var(--text-muted);
    font-size: 0.8rem;
    cursor: pointer;
    transition: background var(--transition), color var(--transition), border-color var(--transition);
    font-family: inherit;
    flex-shrink: 0;
  }

  .logout-btn:hover {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.3);
    color: #dc2626;
  }

  .app-icon {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
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
  <div class="brand-row">
    <div class="app-brand">
      <div class="app-icon">
        <img src="/logo.svg" alt="Messenger logo" width="32" height="32" />
      </div>
      <span class="app-name">Messenger</span>
    </div>
    <button class="logout-btn" on:click={handleLogout} title="Log out">
      <i class="fas fa-sign-out-alt" />
    </button>
  </div>

  {#if user}
    <div class="current-user">
      <div class="avatar-wrap">
        <Avatar first={user.first} last={user.last} size="md" />
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
