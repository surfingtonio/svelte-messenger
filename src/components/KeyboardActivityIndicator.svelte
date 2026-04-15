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
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-3px); }
  }
  @media (prefers-reduced-motion: no-preference) {
    .dot { animation: bounce 1.2s ease-in-out infinite; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
  }
</style>

{#if keyboardActivity}
  <div class="flex items-center gap-2 px-4 py-1.5 min-h-7" aria-live="polite" role="status">
    <div class="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 rounded-full px-3 py-1.5 shadow-sm text-xs text-slate-500 italic">
      <span>{keyboardActivityStatus}</span>
      <div class="flex gap-1 items-center" aria-hidden="true">
        <div class="dot w-1.5 h-1.5 bg-slate-400 rounded-full" />
        <div class="dot w-1.5 h-1.5 bg-slate-400 rounded-full" />
        <div class="dot w-1.5 h-1.5 bg-slate-400 rounded-full" />
      </div>
    </div>
  </div>
{/if}
