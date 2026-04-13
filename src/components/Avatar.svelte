<script lang="ts">
  import { colorFor } from '../utils';

  export let first: string = '';
  export let last: string = '';
  export let size: 'sm' | 'md' | 'lg' = 'md';

  $: initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  $: bg = colorFor(`${first}${last}`);
  $: sizeClass =
    size === 'sm' ? 'w-8 h-8 text-[0.6rem]' :
    size === 'lg' ? 'w-12 h-12 text-[0.9rem]' :
    'w-10 h-10 text-xs';
</script>

<div
  class="rounded-full flex items-center justify-center font-bold text-white shrink-0 tracking-wide select-none {sizeClass}"
  style="background: {bg};"
>{initials}</div>
