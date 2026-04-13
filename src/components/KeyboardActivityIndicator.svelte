<script lang="ts">
  import { onDestroy } from 'svelte';

  export let keyboardActivity: boolean = false;
  export let keyboardActivityStatus: string = 'User is typing';

  let intervalId: ReturnType<typeof setInterval> | undefined;
  let dotCount: number = 1;

  function startAnimation() {
    clearInterval(intervalId);
    dotCount = 1;
    intervalId = setInterval(() => {
      dotCount = dotCount >= 3 ? 1 : dotCount + 1;
    }, 400);
  }

  $: if (keyboardActivity) {
    startAnimation();
  } else {
    clearInterval(intervalId);
  }

  onDestroy(() => clearInterval(intervalId));

  $: dots = '.'.repeat(dotCount);
</script>

<style>
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 1rem 0.5rem;
    min-height: 1.75rem;
  }

  .typing-bubble {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    background: white;
    border-radius: var(--border-radius-full, 9999px);
    padding: 0.375rem 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    font-size: 0.75rem;
    color: #8896ab;
    font-style: italic;
  }

  .dots {
    display: flex;
    gap: 0.2rem;
    align-items: center;
  }

  .dot {
    width: 0.3rem;
    height: 0.3rem;
    background: #8896ab;
    border-radius: 50%;
    animation: bounce 1.2s ease-in-out infinite;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%,
    60%,
    100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-3px);
    }
  }
</style>

{#if keyboardActivity}
  <div class="typing-indicator">
    <div class="typing-bubble">
      <span>{keyboardActivityStatus}</span>
      <div class="dots">
        <div class="dot" />
        <div class="dot" />
        <div class="dot" />
      </div>
    </div>
  </div>
{/if}
