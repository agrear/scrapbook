<script lang="ts">
  export let value: number | null | undefined = undefined;
  export let step: number | string = 1;
  export let min: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let width = '100%';
  export let maxWidth = '100px';
  export let disabled = false;
</script>

<style>
  input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>

<input
  {id}
  {name}
  type="number"
  {step}
  {min}
  {max}
  {placeholder}
  bind:value
  {disabled}
  on:change
  style="width: {width}; max-width: {maxWidth}"
/>
