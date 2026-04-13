<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Avatar from './Avatar.svelte';
  import { formatDate } from '../utils';

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

  const dispatch = createEventDispatcher<{ sessionexpired: void; back: void }>();

  let users: AdminUser[] = [];
  let loading = true;
  let error = '';
  let actionError = '';

  async function handleResponse(res: Response): Promise<boolean> {
    if (res.status === 401) {
      dispatch('sessionexpired');
      return false;
    }
    return res.ok;
  }

  async function loadUsers() {
    loading = true;
    error = '';
    actionError = '';
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (res.status === 401) { dispatch('sessionexpired'); return; }
      if (!res.ok) throw new Error('Failed to load users');
      users = await res.json();
    } catch {
      error = 'Failed to load users. Please try again.';
    } finally {
      loading = false;
    }
  }

  async function toggleAdmin(user: AdminUser) {
    actionError = '';
    const newRoles = user.roles.includes('admin')
      ? user.roles.filter((r) => r !== 'admin')
      : [...user.roles, 'admin'];
    try {
      const res = await fetch(`/api/admin/users/${user.id}/roles`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ roles: newRoles }),
      });
      if (await handleResponse(res)) {
        await loadUsers();
      } else if (res.status !== 401) {
        const data = await res.json().catch(() => ({}));
        actionError = (data as { error?: string }).error ?? 'Failed to update roles.';
      }
    } catch {
      actionError = 'Network error. Please try again.';
    }
  }

  async function deleteUser(user: AdminUser) {
    if (!confirm(`Delete "${user.username}"? This cannot be undone.`)) return;
    actionError = '';
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (await handleResponse(res)) {
        await loadUsers();
      } else if (res.status !== 401) {
        const data = await res.json().catch(() => ({}));
        actionError = (data as { error?: string }).error ?? 'Failed to delete user.';
      }
    } catch {
      actionError = 'Network error. Please try again.';
    }
  }

  loadUsers();
</script>

<div class="flex flex-col h-full bg-slate-100 dark:bg-slate-900 overflow-hidden">

  <!-- Toolbar -->
  <div class="flex items-center justify-between px-4 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0">
    <div class="flex items-center gap-3">
      <!-- Mobile back button -->
      <button
        class="md:hidden w-8 h-8 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm font-[inherit] -ml-1"
        on:click={() => dispatch('back')}
        aria-label="Back to contacts"
      >
        <i class="fas fa-arrow-left" />
      </button>
      <div class="w-8 h-8 bg-brand-100 dark:bg-brand-900/30 text-brand-500 dark:text-brand-400 rounded-md flex items-center justify-center text-sm">
        <i class="fas fa-users-cog" />
      </div>
      <span class="font-semibold text-[0.9375rem] text-slate-900 dark:text-slate-100">User Management</span>
      {#if !loading}
        <span class="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded-full">
          {users.length} {users.length === 1 ? 'user' : 'users'}
        </span>
      {/if}
    </div>
    <button
      class="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:border-brand-300 dark:hover:border-brand-600 hover:text-brand-500 transition text-xs font-[inherit]"
      on:click={loadUsers}
      title="Refresh"
    >
      <i class="fas fa-sync" />
    </button>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
    {#if actionError}
      <div class="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm">
        <i class="fas fa-exclamation-triangle shrink-0" />
        <span class="flex-1">{actionError}</span>
        <button
          class="ml-auto text-red-500 hover:text-red-700 text-xs font-[inherit] bg-transparent border-none cursor-pointer"
          on:click={() => (actionError = '')}
          aria-label="Dismiss"
        >
          <i class="fas fa-times" />
        </button>
      </div>
    {/if}

    {#if loading}
      <div class="flex items-center justify-center h-40 text-slate-400 dark:text-slate-500 text-sm gap-2">
        <i class="fas fa-spinner fa-spin" />
        Loading users...
      </div>
    {:else if error}
      <div class="flex items-center justify-center h-40 text-red-500 text-sm gap-2">
        <i class="fas fa-exclamation-circle" />
        {error}
      </div>
    {:else}
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <!-- Desktop table -->
        <table class="w-full border-collapse hidden sm:table">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-700/60 border-b border-slate-200 dark:border-slate-700">
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">User</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Roles</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Joined</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each users as user (user.id)}
              <tr
                class="border-b border-slate-100 dark:border-slate-700 last:border-0 transition
                  {user.id === selfId ? 'bg-brand-50/50 dark:bg-brand-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}"
              >
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-3">
                    <Avatar first={user.first} last={user.last} size="sm" />
                    <div class="min-w-0">
                      <div class="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{user.first} {user.last}</div>
                      <div class="text-xs text-slate-400 dark:text-slate-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3.5">
                  <div class="flex gap-1.5 flex-wrap">
                    {#each user.roles as role}
                      <span class="text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full capitalize tracking-wide
                        {role === 'admin'
                          ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-700/50'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/50'}"
                      >{role}</span>
                    {/each}
                  </div>
                </td>
                <td class="px-4 py-3.5 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-2">
                    {#if user.id !== selfId}
                      {#if user.roles.includes('admin')}
                        <button
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50 hover:bg-red-500 hover:text-white hover:border-red-500 transition whitespace-nowrap font-[inherit] cursor-pointer"
                          on:click={() => toggleAdmin(user)}
                        >
                          <i class="fas fa-shield-alt" />
                          Revoke Admin
                        </button>
                      {:else}
                        <button
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-700/50 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition whitespace-nowrap font-[inherit] cursor-pointer"
                          on:click={() => toggleAdmin(user)}
                        >
                          <i class="fas fa-shield-alt" />
                          Grant Admin
                        </button>
                      {/if}
                      <button
                        class="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition font-[inherit] cursor-pointer text-xs"
                        on:click={() => deleteUser(user)}
                        title="Delete user"
                      >
                        <i class="fas fa-trash" />
                      </button>
                    {:else}
                      <span class="text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-600">You</span>
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

        <!-- Mobile card list -->
        <div class="sm:hidden divide-y divide-slate-100 dark:divide-slate-700">
          {#each users as user (user.id)}
            <div class="px-4 py-4 {user.id === selfId ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}">
              <div class="flex items-center gap-3 mb-3">
                <Avatar first={user.first} last={user.last} size="sm" />
                <div class="min-w-0 flex-1">
                  <div class="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{user.first} {user.last}</div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">@{user.username} · {formatDate(user.createdAt)}</div>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                {#each user.roles as role}
                  <span class="text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full capitalize
                    {role === 'admin'
                      ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}"
                  >{role}</span>
                {/each}
                {#if user.id !== selfId}
                  {#if user.roles.includes('admin')}
                    <button
                      class="ml-auto text-xs font-medium px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 font-[inherit] cursor-pointer"
                      on:click={() => toggleAdmin(user)}
                    >Revoke</button>
                  {:else}
                    <button
                      class="ml-auto text-xs font-medium px-2.5 py-1 rounded-md bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-700/50 font-[inherit] cursor-pointer"
                      on:click={() => toggleAdmin(user)}
                    >Grant Admin</button>
                  {/if}
                  <button
                    class="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-red-500 transition font-[inherit] cursor-pointer text-xs"
                    on:click={() => deleteUser(user)}
                  ><i class="fas fa-trash" /></button>
                {:else}
                  <span class="ml-auto text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600">You</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
