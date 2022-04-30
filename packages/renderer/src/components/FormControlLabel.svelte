<script lang="ts">
  export let label: string;
  export let name: string;
  export let error: string | undefined = undefined;
  export let touched: boolean | undefined = undefined;
  export let margin: string | undefined = undefined;
</script>

<div>
  <label for={name} class="w-full" style="margin: {margin}">
    {label}
  </label>

  <slot />

  {#if error && touched}
    <div class="text-red-400 text-sm">{error}</div>
  {/if}
</div>
