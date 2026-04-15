<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { AuthPayload } from '../types';

  const dispatch = createEventDispatcher<{ auth: AuthPayload }>();

  let mode: 'login' | 'signup' = 'login';
  let loading: boolean = false;
  let error: string = '';

  // Login fields
  let loginUsername: string = '';
  let loginPassword: string = '';

  // Signup fields
  let signupFirst: string = '';
  let signupLast: string = '';
  let signupUsername: string = '';
  let signupPassword: string = '';
  let signupConfirm: string = '';

  async function handleLogin() {
    error = '';
    if (!loginUsername.trim() || !loginPassword) {
      error = 'Please fill in all fields.';
      return;
    }
    loading = true;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        error = data.error || 'Login failed.';
        return;
      }
      dispatch('auth', data);
    } catch {
      error = 'Network error. Please try again.';
    } finally {
      loading = false;
    }
  }

  async function handleSignup() {
    error = '';
    if (!signupFirst.trim() || !signupLast.trim() || !signupUsername.trim() || !signupPassword || !signupConfirm) {
      error = 'Please fill in all fields.';
      return;
    }
    if (signupPassword !== signupConfirm) {
      error = 'Passwords do not match.';
      return;
    }
    if (signupPassword.length < 6) {
      error = 'Password must be at least 6 characters.';
      return;
    }
    loading = true;
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first: signupFirst.trim(),
          last: signupLast.trim(),
          username: signupUsername.trim(),
          password: signupPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        error = data.error || 'Registration failed.';
        return;
      }
      dispatch('auth', data);
    } catch {
      error = 'Network error. Please try again.';
    } finally {
      loading = false;
    }
  }

  function switchMode(newMode: 'login' | 'signup') {
    mode = newMode;
    error = '';
  }

  function onLoginKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleLogin();
  }

  function onSignupKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSignup();
  }
</script>

<style>
  /* Tailwind's focus:ring-* handles focus styling; suppress native outline only on non-keyboard focus */
  input:focus-visible { outline: none; }
</style>

<div class="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-8">
  <div class="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">

    <!-- Brand header -->
    <div class="flex items-center justify-center gap-3 pt-8 pb-2 px-8">
      <div class="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm">
        <i class="fas fa-comment-dots text-white text-base" aria-hidden="true" />
      </div>
      <span class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Messenger</span>
    </div>

    <!-- Tabs -->
    <div class="flex mx-6 mt-6 mb-0 gap-1 bg-slate-100 dark:bg-slate-700/60 rounded-xl p-1" role="tablist">
      <button
        class="flex-1 py-2 text-sm font-semibold rounded-lg transition-colors
          {mode === 'login'
            ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}"
        on:click={() => switchMode('login')}
        role="tab"
        aria-selected={mode === 'login'}
      >Log In</button>
      <button
        class="flex-1 py-2 text-sm font-semibold rounded-lg transition-colors
          {mode === 'signup'
            ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}"
        on:click={() => switchMode('signup')}
        role="tab"
        aria-selected={mode === 'signup'}
      >Sign Up</button>
    </div>

    <!-- Forms -->
    <div class="px-8 py-6 space-y-4">
      {#if mode === 'login'}
        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide" for="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              placeholder="Enter your username"
              bind:value={loginUsername}
              on:keydown={onLoginKeydown}
              disabled={loading}
              autocomplete="username"
              spellcheck="false"
              maxlength="30"
              class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide" for="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              bind:value={loginPassword}
              on:keydown={onLoginKeydown}
              disabled={loading}
              autocomplete="current-password"
              maxlength="72"
              class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          {#if error}
            <div class="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs px-3 py-2.5 rounded-lg" role="alert">
              <i class="fas fa-exclamation-circle shrink-0" aria-hidden="true" />
              {error}
            </div>
          {/if}
          <button
            class="w-full py-3 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-semibold rounded-xl transition shadow-[0_2px_8px_theme(colors.brand.500/35%)] hover:shadow-[0_4px_12px_theme(colors.brand.500/45%)] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            on:click={handleLogin}
            disabled={loading}
          >
            {#if loading}<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true" />{/if}
            {loading ? 'Signing in…' : 'Log In'}
          </button>
        </div>

      {:else}
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide" for="signup-first">First name</label>
              <input
                id="signup-first"
                type="text"
                placeholder="Jane"
                bind:value={signupFirst}
                on:keydown={onSignupKeydown}
                disabled={loading}
                autocomplete="given-name"
                maxlength="50"
                class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide" for="signup-last">Last name</label>
              <input
                id="signup-last"
                type="text"
                placeholder="Doe"
                bind:value={signupLast}
                on:keydown={onSignupKeydown}
                disabled={loading}
                autocomplete="family-name"
                maxlength="50"
                class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide" for="signup-username">Username</label>
            <input
              id="signup-username"
              type="text"
              placeholder="Choose a username"
              bind:value={signupUsername}
              on:keydown={onSignupKeydown}
              disabled={loading}
              autocomplete="username"
              spellcheck="false"
              maxlength="30"
              class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide" for="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="At least 6 characters"
              bind:value={signupPassword}
              on:keydown={onSignupKeydown}
              disabled={loading}
              autocomplete="new-password"
              maxlength="72"
              class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide" for="signup-confirm">Confirm password</label>
            <input
              id="signup-confirm"
              type="password"
              placeholder="Repeat your password"
              bind:value={signupConfirm}
              on:keydown={onSignupKeydown}
              disabled={loading}
              autocomplete="new-password"
              maxlength="72"
              class="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          {#if error}
            <div class="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs px-3 py-2.5 rounded-lg" role="alert">
              <i class="fas fa-exclamation-circle shrink-0" aria-hidden="true" />
              {error}
            </div>
          {/if}
          <button
            class="w-full py-3 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-semibold rounded-xl transition shadow-[0_2px_8px_theme(colors.brand.500/35%)] hover:shadow-[0_4px_12px_theme(colors.brand.500/45%)] disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            on:click={handleSignup}
            disabled={loading}
          >
            {#if loading}<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true" />{/if}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>
