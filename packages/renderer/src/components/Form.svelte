<script lang="ts">
  export let id: string | undefined = undefined;
  export let onSubmit: (event: Event) => any;
</script>

<form {id} on:submit={onSubmit}>
  <slot />
</form>
