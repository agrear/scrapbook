<script lang="ts">
  import { MDCChip } from '@material/chips';
  import { onMount } from 'svelte';

  export let id: string;
  export let disabled = false;
  export let href: string | undefined = undefined;

  let chip: HTMLSpanElement;
  let mdcChip: MDCChip | null = null;

  onMount(() => {
    mdcChip = new MDCChip(chip);

    return () => {
      mdcChip?.destroy();
    };
  });
</script>

<span
  bind:this={chip}
  {id}
  role="row"
  class:mdc-evolution-chip={!disabled}
  class:mdc-evolution-chip--disabled={disabled}
>
  <span
    class="mdc-evolution-chip__cell mdc-evolution-chip__cell--primary"
    role="gridcell"
  >
    {#if href}
      <a
        {href}
        tabindex="0"
        class="mdc-evolution-chip__action mdc-evolution-chip__action--primary"
        on:click
      >
        <span
          class="
            mdc-evolution-chip__ripple
            mdc-evolution-chip__ripple--primary
          "
        />
        <span class="mdc-evolution-chip__text-label"><slot/></span>
      </a>
    {:else}
      <button
        type="button"
        tabindex="0"
        {disabled}
        class="mdc-evolution-chip__action mdc-evolution-chip__action--primary"
        on:click
      >
        <span
          class="
            mdc-evolution-chip__ripple
            mdc-evolution-chip__ripple--primary
          "
        />
        <span class="mdc-evolution-chip__text-label"><slot/></span>
      </button>
    {/if}
  </span>
</span>
