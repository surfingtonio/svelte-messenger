<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    height: 100vh;
    background: var(--bg-chat, #f0f2f7);
  }

  .spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid rgba(108, 99, 255, 0.15);
    border-top-color: #6c63ff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  .loading-text {
    font-size: 0.875rem;
    color: #8896ab;
    font-weight: 500;
    font-family: 'Inter', -apple-system, sans-serif;
    letter-spacing: 0.02em;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>

<div class="loading">
  <div class="spinner" />
  <span class="loading-text">Connecting…</span>
</div>
