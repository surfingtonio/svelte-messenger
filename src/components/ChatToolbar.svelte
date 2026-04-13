<script lang="ts">
  import Avatar from './Avatar.svelte';
  import type { User } from '../types';

  export let user: User;
  export let usersCount: number = 0;
</script>

<style>
  .chat-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem 1.25rem;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
    height: var(--toolbar-height);
  }

  .user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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

  .user-info .name {
    font-weight: 700;
    font-size: 0.9375rem;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .user-info .status {
    font-size: 0.75rem;
    color: var(--color-online);
    font-weight: 500;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .online-badge {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    background: var(--brand-primary-light);
    color: var(--brand-primary);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.375rem 0.75rem;
    border-radius: var(--border-radius-full);
  }

  .online-badge i {
    font-size: 0.7rem;
  }
</style>

<div class="chat-toolbar">
  <div class="user">
    <div class="avatar-wrap">
      <Avatar first={user.first} last={user.last} size="md" />
      <span class="online-dot" />
    </div>
    <div class="user-info">
      <div class="name">{user.first} {user.last}</div>
      <div class="status">Online</div>
    </div>
  </div>
  <div class="controls">
    <div
      class="online-badge"
      title="{usersCount} online {usersCount === 1 ? 'user' : 'users'}"
    >
      <i class="fas fa-users" />
      {usersCount} online
    </div>
  </div>
</div>
