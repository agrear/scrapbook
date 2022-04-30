<script lang="ts">
  export let value: string | null | undefined = '';
  export let name: string | undefined = undefined;
  export let onChange: ((e: Event) => any) | undefined = undefined;
  export let id: string | undefined = undefined;
  export let rows = 1;
  export let placeholder: string | undefined = undefined;
  export let disabled: boolean | undefined = undefined;
  export let width = '100%';
  export let maxWidth: string | number | false = false;

  function getMaxWidth() {
    if (typeof maxWidth === 'number') {
      return `${maxWidth}px`;
    } else if (typeof maxWidth === 'string') {
      return maxWidth;
    } else {
      return 'auto';
    }
  }
</script>

{#if rows === 1}
  <input
    {id}
    {name}
    {placeholder}
    {disabled}
    bind:value
    on:change={onChange}
    style="width: {width}; max-width: {getMaxWidth()}"
  />
{:else}
  <textarea
    {id}
    {name}
    {placeholder}
    {disabled}
    {rows}
    bind:value
    on:change={onChange}
    style="width: {width}; max-width: {maxWidth}"
  />
{/if}
