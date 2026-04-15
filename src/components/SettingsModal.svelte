<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { theme, type Theme } from '../theme';
  import Icon from './Icon.svelte';

  const dispatch = createEventDispatcher<{ close: void }>();

  const options: { value: Theme; label: string; icon: string }[] = [
    { value: 'light',  label: 'Light',  icon: 'sun' },
    { value: 'dark',   label: 'Dark',   icon: 'moon' },
    { value: 'system', label: 'System', icon: 'monitor' },
  ];

  let modalEl: HTMLDivElement;

  function closeModal() {
    dispatch('close');
  }

  function getFocusable(): HTMLElement[] {
    return Array.from(
      modalEl.querySelectorAll<HTMLElement>(
        'button:not([tabindex="-1"]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled'));
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab' || !modalEl) return;
    if (!modalEl.contains(document.activeElement)) return;
    const focusable = getFocusable();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  onMount(() => {
    const focusable = getFocusable();
    if (focusable.length) focusable[0].focus();
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Backdrop -->
<div
  data-testid="settings-modal"
  class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
  role="dialog"
  aria-modal="true"
  aria-label="Settings"
>
  <button
    type="button"
    class="absolute inset-0 bg-black/40 backdrop-blur-sm"
    aria-label="Dismiss modal backdrop"
    tabindex="-1"
    on:click={closeModal}
  />

  <!-- Modal card -->
  <div bind:this={modalEl} class="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-2.5">
        <Icon name="sliders" size={16} className="text-brand-500" />
        <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Settings</h2>
      </div>
      <button
        class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        on:click={closeModal}
        aria-label="Close settings"
      >
        <Icon name="x" size={16} />
      </button>
    </div>

    <!-- Body -->
    <div class="px-6 py-5 space-y-5">
      <!-- Theme selector -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Appearance
        </p>
        <div class="grid grid-cols-3 gap-2">
          {#each options as opt}
            <button
              class="flex flex-col items-center gap-2.5 py-3.5 px-2 rounded-xl border-2 transition-[color,background-color,border-color] font-medium text-sm
                {$theme === opt.value
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50/50 dark:hover:bg-brand-900/20'}"
              on:click={() => theme.set(opt.value)}
              aria-pressed={$theme === opt.value}
            >
              <Icon name={opt.icon} size={20} />
              <span>{opt.label}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
      <button
        class="px-5 py-2 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-[color,background-color,transform] shadow-sm"
        on:click={closeModal}
      >
        Done
      </button>
    </div>
  </div>
</div>
