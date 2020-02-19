<script>
  import { onDestroy } from 'svelte';
  import _ from 'lodash';

  export let keyboardActivity = false;
  export let keyboardActivityStatus = 'User is typing';

  let ellipsis = '';
  let intervalId;

  function animateEllipsis() {
    clearInterval(intervalId);
    let dots = 0;
    return setInterval(() => {
      ellipsis = '.'.repeat(dots >= 3 ? (dots = 1) : ++dots);
    }, 400);
  }

  $: keyboardActivity
    ? (intervalId = animateEllipsis())
    : clearInterval(intervalId);

  onDestroy(() => clearInterval(intervalId));
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
