<script>
  import { onDestroy } from 'svelte';

  export let keyboardActivity = false;
  export let keyboardActivityStatus = 'Someone is typing';
  let ellipsis = '';
  let interval;

  function animateEllipsis() {
    clearInterval(interval);
    let c = 0;
    return setInterval(() => {
      ellipsis = '.'.repeat(c >= 3 ? (c = 1) : ++c);
    }, 400);
  }

  $: keyboardActivity
    ? (interval = animateEllipsis())
    : clearInterval(interval);

  onDestroy(() => clearInterval(interval));
</script>

<style>
  .keyboard-activity {
    background: var(--component-secondary-background);
    border-radius: var(--component-border-radius);
    color: var(--component-primary-color);
    font-size: var(--component-small-font);
    font-style: italic;
    padding: var(--chat-controls-padding-x)
      calc(var(--chat-controls-padding-x) * 2);
    position: fixed;
    opacity: 0.75;
    margin-top: calc((1rem + var(--chat-controls-padding-x) * 2) * -1);
    z-index: 99;
  }
</style>

{#if keyboardActivity}
  <span class="keyboard-activity">{keyboardActivityStatus}{ellipsis}</span>
{/if}
