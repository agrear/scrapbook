<script lang="ts">
  export let value: string | null | undefined = undefined;
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let width = '100%';
  export let maxWidth = 'auto';
</script>

<input
  {id}
  {name}
  type="date"
  bind:value
  on:change
  style="width: {width}; max-width: {maxWidth}"
/>
