<script lang="ts">
  import { spring } from 'svelte/motion';

  export let value: number;
  export let max = 100;

  const val = spring(value);

  $: val.set(value);
</script>

<progress value={$val} {max}></progress>
