<script lang="ts">
  import Avatar from './Avatar.svelte';

  export let selfId: number;
  export let token: string;

  interface AdminUser {
    id: number;
    first: string;
    last: string;
    username: string;
    roles: string[];
    createdAt: number;
  }

  let users: AdminUser[] = [];
  let loading = true;
  let error = '';

  function formatDate(ts: number): string {
    return new Date(ts * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  async function loadUsers() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (!res.ok) throw new Error('Failed to load users');
      users = await res.json();
    } catch {
      error = 'Failed to load users. Please try again.';
    } finally {
      loading = false;
    }
  }

  async function toggleAdmin(user: AdminUser) {
    const newRoles = user.roles.includes('admin')
      ? user.roles.filter((r) => r !== 'admin')
      : [...user.roles, 'admin'];
    const res = await fetch(`/api/admin/users/${user.id}/roles`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ roles: newRoles }),
    });
    if (res.ok) await loadUsers();
  }

  async function deleteUser(user: AdminUser) {
    if (!confirm(`Delete "${user.username}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (res.ok) await loadUsers();
  }

  loadUsers();
</script>

<style>
  .admin-panel {
    display: grid;
    grid-template-rows: var(--toolbar-height) 1fr;
    height: 100vh;
    background: var(--bg-chat);
    overflow: hidden;
  }

  .admin-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    flex-shrink: 0;
  }

  .admin-toolbar-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .toolbar-icon {
    width: 2rem;
    height: 2rem;
    background: var(--brand-primary-light);
    color: var(--brand-primary);
    border-radius: var(--border-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
  }

  .toolbar-title {
    font-weight: 600;
    font-size: 0.9375rem;
    color: var(--text-primary);
  }

  .toolbar-count {
    font-size: 0.75rem;
    color: var(--text-muted);
    background: var(--bg-input);
    padding: 0.125rem 0.5rem;
    border-radius: var(--border-radius-full);
    border: 1px solid var(--border-color);
  }

  .reload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    color: var(--text-muted);
    font-size: 0.8rem;
    cursor: pointer;
    transition: background var(--transition), color var(--transition), border-color var(--transition);
    font-family: inherit;
  }

  .reload-btn:hover {
    background: var(--brand-primary-light);
    border-color: var(--brand-primary);
    color: var(--brand-primary);
  }

  .admin-content {
    overflow-y: auto;
    padding: 1.5rem;
  }

  .status-msg {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 10rem;
    color: var(--text-muted);
    font-size: 0.875rem;
    gap: 0.5rem;
  }

  .error-msg {
    color: #dc2626;
  }

  .users-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--bg-card);
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
  }

  .users-table thead tr {
    background: var(--bg-input);
    border-bottom: 1px solid var(--border-color);
  }

  .users-table th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .users-table td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
  }

  .users-table tbody tr:last-child td {
    border-bottom: none;
  }

  .users-table tbody tr:hover {
    background: var(--bg-input);
  }

  .users-table tbody tr.self-row {
    background: var(--brand-primary-light);
  }

  .users-table tbody tr.self-row:hover {
    background: var(--brand-primary-light);
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .user-info-text {
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

  .user-username {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .roles-cell {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  .role-badge {
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 0.2rem 0.5rem;
    border-radius: var(--border-radius-full);
    text-transform: capitalize;
    letter-spacing: 0.02em;
  }

  .role-user {
    background: rgba(34, 197, 94, 0.12);
    color: #16a34a;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .role-admin {
    background: var(--brand-primary-light);
    color: var(--brand-primary);
    border: 1px solid rgba(108, 99, 255, 0.3);
  }

  .date-cell {
    font-size: 0.8125rem;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .actions-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: var(--border-radius-sm);
    border: 1px solid transparent;
    cursor: pointer;
    font-family: inherit;
    transition: background var(--transition), color var(--transition), border-color var(--transition);
    white-space: nowrap;
  }

  .grant-btn {
    background: var(--brand-primary-light);
    color: var(--brand-primary);
    border-color: rgba(108, 99, 255, 0.3);
  }

  .grant-btn:hover {
    background: var(--brand-primary);
    color: white;
    border-color: var(--brand-primary);
  }

  .revoke-btn {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
    border-color: rgba(239, 68, 68, 0.3);
  }

  .revoke-btn:hover {
    background: #dc2626;
    color: white;
    border-color: #dc2626;
  }

  .delete-btn {
    background: transparent;
    color: var(--text-muted);
    border-color: var(--border-color);
  }

  .delete-btn:hover {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
    border-color: rgba(239, 68, 68, 0.3);
  }

  .self-badge {
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 0.2rem 0.5rem;
    border-radius: var(--border-radius-full);
    background: var(--bg-input);
    color: var(--text-muted);
    border: 1px solid var(--border-color);
  }
</style>

<div class="admin-panel">
  <div class="admin-toolbar">
    <div class="admin-toolbar-left">
      <div class="toolbar-icon">
        <i class="fas fa-users-cog" />
      </div>
      <span class="toolbar-title">User Management</span>
      {#if !loading}
        <span class="toolbar-count">{users.length} {users.length === 1 ? 'user' : 'users'}</span>
      {/if}
    </div>
    <button class="reload-btn" on:click={loadUsers} title="Refresh">
      <i class="fas fa-sync" />
    </button>
  </div>

  <div class="admin-content">
    {#if loading}
      <div class="status-msg">
        <i class="fas fa-spinner fa-spin" />
        Loading users...
      </div>
    {:else if error}
      <div class="status-msg error-msg">
        <i class="fas fa-exclamation-circle" />
        {error}
      </div>
    {:else}
      <table class="users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Roles</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each users as user (user.id)}
            <tr class:self-row={user.id === selfId}>
              <td>
                <div class="user-cell">
                  <Avatar first={user.first} last={user.last} size="sm" />
                  <div class="user-info-text">
                    <div class="user-name">{user.first} {user.last}</div>
                    <div class="user-username">@{user.username}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="roles-cell">
                  {#each user.roles as role}
                    <span class="role-badge" class:role-user={role === 'user'} class:role-admin={role === 'admin'}>
                      {role}
                    </span>
                  {/each}
                </div>
              </td>
              <td class="date-cell">{formatDate(user.createdAt)}</td>
              <td>
                <div class="actions-cell">
                  {#if user.id !== selfId}
                    {#if user.roles.includes('admin')}
                      <button class="action-btn revoke-btn" on:click={() => toggleAdmin(user)} title="Revoke admin role">
                        <i class="fas fa-shield-alt" />
                        Revoke Admin
                      </button>
                    {:else}
                      <button class="action-btn grant-btn" on:click={() => toggleAdmin(user)} title="Grant admin role">
                        <i class="fas fa-shield-alt" />
                        Grant Admin
                      </button>
                    {/if}
                    <button class="action-btn delete-btn" on:click={() => deleteUser(user)} title="Delete user">
                      <i class="fas fa-trash" />
                    </button>
                  {:else}
                    <span class="self-badge">You</span>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
