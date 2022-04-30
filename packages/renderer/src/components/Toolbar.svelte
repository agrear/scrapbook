<script lang="ts">
  export let justifyContent = 'flex-start';
</script>

<div
  class="flex items-stretch bg-neutral-700 z-app-bar"
  style="
    justify-content: {justifyContent};
    filter: drop-shadow(0 4px 4px rgb(0 0 0 / 0.5));
  "
>
  <slot />
</div>
