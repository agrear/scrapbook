<script lang="ts">
  export let onClick: (
    svelte.JSX.MouseEventHandler<HTMLButtonElement>
  ) | undefined = undefined;
</script>

<button on:click={onClick}>
  <span><slot /></span>
</button>
