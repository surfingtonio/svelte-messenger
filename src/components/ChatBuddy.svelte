<script lang="ts">
  import Avatar from './Avatar.svelte';
  import type { User } from '../types';

  export let user: User;
  export let selected: boolean = false;
</script>

<style>
  .chat-buddy {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 0.75rem;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background var(--transition);
    position: relative;
    width: 100%;
    background: transparent;
    border: none;
    text-align: left;
    font-family: inherit;
  }

  .chat-buddy:hover {
    background: var(--bg-input);
  }

  .chat-buddy.selected {
    background: var(--brand-primary-light);
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

  .info {
    flex: 1;
    min-width: 0;
  }

  .fullname {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-buddy.selected .fullname {
    color: var(--brand-primary);
  }

  .status {
    font-size: 0.7rem;
    color: var(--color-online);
    font-weight: 500;
    margin-top: 0.1rem;
  }
</style>

<button class="chat-buddy" class:selected type="button" on:click>
  <div class="avatar-wrap">
    <Avatar first={user.first} last={user.last} size="md" />
    <span class="online-dot" />
  </div>
  <div class="info">
    <div class="fullname">{user.first} {user.last}</div>
    <div class="status">Online</div>
  </div>
</button>
