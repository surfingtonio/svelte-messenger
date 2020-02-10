<script>
  import { onDestroy } from 'svelte';

  export let activity = false;
  export let status = 'Someone is typing';
  let ellipsis = '';
  let interval;

  function animateEllipsis() {
    clearInterval(interval);
    let c = 0;
    return setInterval(() => {
      ellipsis = '.'.repeat(c >= 3 ? (c = 1) : ++c);
    }, 400);
  }

  $: activity ? (interval = animateEllipsis()) : clearInterval(interval);

  onDestroy(() => clearInterval(interval));
</script>

<style>
  .keyboard-activity {
    background: var(--component-secondary-background);
    border-radius: var(--component-border-radius);
    bottom: var(--chat-controls-outer-height);
    bottom: var(--chat-controls-padding-y);
    color: var(--component-primary-color);
    font-size: var(--component-small-font);
    font-style: italic;
    left: var(--chat-controls-padding-x);
    padding: var(--chat-controls-padding-x)
      calc(var(--chat-controls-padding-x) * 2);
    position: fixed;
    bottom: calc(
      var(--chat-controls-outer-height) + var(--chat-controls-padding-x)
    );
    opacity: 0.75;
    margin-top: calc((1rem + var(--chat-controls-padding-x) * 2) * -1);
    z-index: 99;
  }
</style>

{#if activity}
  <span class="keyboard-activity">{status}{ellipsis}</span>
{/if}
