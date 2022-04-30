<script lang="ts">
  import { MDCChipSet } from '@material/chips';
  import { onMount } from 'svelte';

  let chipset: HTMLSpanElement;
  let mdcChipset: MDCChipSet | null = null;

  onMount(() => {
    mdcChipset = new MDCChipSet(chipset);

    return () => {
      mdcChipset?.destroy();
    };
  });
</script>

<span bind:this={chipset} class="mdc-evolution-chip-set" role="grid">
  <span class="mdc-evolution-chip-set__chips" role="presentation">
    <slot />
  </span>
</span>
