<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { User } from '../types';

  const dispatch = createEventDispatcher<{ auth: Partial<User> }>();

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

  function switchMode(newMode) {
    mode = newMode;
    error = '';
  }

  function onLoginKeydown(e) {
    if (e.key === 'Enter') handleLogin();
  }

  function onSignupKeydown(e) {
    if (e.key === 'Enter') handleSignup();
  }
</script>

<style>
  .auth-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--bg-app);
    padding: 1.5rem;
  }

  .card {
    background: var(--bg-card);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 22rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .brand-icon {
    width: 2.25rem;
    height: 2.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--bg-input);
    border-radius: var(--border-radius);
    padding: 0.25rem;
    margin-bottom: 1.75rem;
  }

  .tab {
    padding: 0.5rem;
    text-align: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    border-radius: calc(var(--border-radius) - 0.125rem);
    cursor: pointer;
    border: none;
    background: transparent;
    transition: background var(--transition), color var(--transition);
    font-family: inherit;
  }

  .tab.active {
    background: var(--bg-card);
    color: var(--brand-primary);
    box-shadow: var(--shadow-sm);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.625rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  input {
    background: var(--bg-input);
    border: 1.5px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    padding: 0.625rem 0.75rem;
    font-size: 0.9rem;
    font-family: inherit;
    color: var(--text-primary);
    outline: none;
    transition: border-color var(--transition), box-shadow var(--transition);
    width: 100%;
  }

  input::placeholder {
    color: var(--text-muted);
  }

  input:focus {
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px var(--brand-primary-light);
    background: #fff;
  }

  .error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #dc2626;
    font-size: 0.8125rem;
    padding: 0.625rem 0.75rem;
    border-radius: var(--border-radius-sm);
    margin-top: 0.25rem;
  }

  .submit-btn {
    width: 100%;
    padding: 0.75rem;
    background: var(--brand-primary);
    color: #fff;
    border: none;
    border-radius: var(--border-radius);
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: background var(--transition), transform var(--transition), box-shadow var(--transition);
    margin-top: 0.25rem;
    box-shadow: 0 2px 8px rgba(108, 99, 255, 0.35);
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--brand-primary-dark);
    box-shadow: 0 4px 12px rgba(108, 99, 255, 0.45);
  }

  .submit-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .submit-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .spinner-inline {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    vertical-align: middle;
    margin-right: 0.375rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>

<div class="auth-screen">
  <div class="card">
    <div class="brand">
      <div class="brand-icon">
        <img src="/logo.svg" alt="Messenger logo" width="36" height="36" />
      </div>
      <span class="brand-name">Messenger</span>
    </div>

    <div class="tabs">
      <button class="tab" class:active={mode === 'login'} on:click={() => switchMode('login')}>
        Log In
      </button>
      <button class="tab" class:active={mode === 'signup'} on:click={() => switchMode('signup')}>
        Sign Up
      </button>
    </div>

    {#if mode === 'login'}
      <div class="form">
        <div class="field">
          <label for="login-username">Username</label>
          <input
            id="login-username"
            type="text"
            placeholder="Enter your username"
            bind:value={loginUsername}
            on:keydown={onLoginKeydown}
            disabled={loading}
            autocomplete="username"
          />
        </div>
        <div class="field">
          <label for="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            bind:value={loginPassword}
            on:keydown={onLoginKeydown}
            disabled={loading}
            autocomplete="current-password"
          />
        </div>
        {#if error}
          <div class="error">
            <i class="fas fa-exclamation-circle" />
            {error}
          </div>
        {/if}
        <button class="submit-btn" on:click={handleLogin} disabled={loading}>
          {#if loading}<span class="spinner-inline" />{/if}
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </div>
    {:else}
      <div class="form">
        <div class="row">
          <div class="field">
            <label for="signup-first">First name</label>
            <input
              id="signup-first"
              type="text"
              placeholder="Jane"
              bind:value={signupFirst}
              disabled={loading}
              autocomplete="given-name"
            />
          </div>
          <div class="field">
            <label for="signup-last">Last name</label>
            <input
              id="signup-last"
              type="text"
              placeholder="Doe"
              bind:value={signupLast}
              disabled={loading}
              autocomplete="family-name"
            />
          </div>
        </div>
        <div class="field">
          <label for="signup-username">Username</label>
          <input
            id="signup-username"
            type="text"
            placeholder="Choose a username"
            bind:value={signupUsername}
            disabled={loading}
            autocomplete="username"
          />
        </div>
        <div class="field">
          <label for="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="At least 6 characters"
            bind:value={signupPassword}
            disabled={loading}
            autocomplete="new-password"
          />
        </div>
        <div class="field">
          <label for="signup-confirm">Confirm password</label>
          <input
            id="signup-confirm"
            type="password"
            placeholder="Repeat your password"
            bind:value={signupConfirm}
            on:keydown={onSignupKeydown}
            disabled={loading}
            autocomplete="new-password"
          />
        </div>
        {#if error}
          <div class="error">
            <i class="fas fa-exclamation-circle" />
            {error}
          </div>
        {/if}
        <button class="submit-btn" on:click={handleSignup} disabled={loading}>
          {#if loading}<span class="spinner-inline" />{/if}
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </div>
    {/if}
  </div>
</div>
