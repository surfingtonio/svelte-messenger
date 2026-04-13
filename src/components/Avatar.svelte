<script lang="ts">
  export let first: string = '';
  export let last: string = '';
  export let size: 'sm' | 'md' | 'lg' = 'md';

  const palette = [
    '#6c63ff', '#f59e0b', '#10b981', '#ef4444', '#3b82f6',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'
  ];

  function colorFor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = name.charCodeAt(i) + ((h << 5) - h);
    }
    return palette[Math.abs(h) % palette.length];
  }

  $: initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  $: bg = colorFor(`${first}${last}`);
</script>

<style>
  .av {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
    letter-spacing: 0.04em;
    user-select: none;
  }

  .av.sm {
    width: var(--avatar-sm);
    height: var(--avatar-sm);
    font-size: 0.6rem;
  }

  .av.md {
    width: var(--avatar-md);
    height: var(--avatar-md);
    font-size: 0.75rem;
  }

  .av.lg {
    width: var(--avatar-lg);
    height: var(--avatar-lg);
    font-size: 0.9rem;
  }
</style>

<div class="av {size}" style="background: {bg};">{initials}</div>
