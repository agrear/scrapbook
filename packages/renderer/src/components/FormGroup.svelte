<script lang="ts">
  export let header: string | undefined = undefined;
  export let row: boolean | undefined = undefined;
  export let gutterBottom = false;
</script>

<div>
  {#if header}
    <span class="mb-2 mdc-typography--headline6">{header}</span>
  {/if}

  <div
    class="gap-x-12 gap-y-6"
    class:flex={!row}
    class:flex-col={!row}
    class:grid={row}
    class:grid-flow-col={row}
    class:equal-cols={row}
    class:mb-8={gutterBottom}
  >
    <slot />
  </div>
</div>

<style>
  .equal-cols {
    grid-auto-columns: 1fr;
  }
</style>
