<script lang="ts">
  import Icon from '@iconify/svelte';
  import type { IconifyIcon } from '@iconify/svelte/dist/iconify';

  type Color = 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

  export let color: Color = 'default';
  export let icon: IconifyIcon;
  export let inline = false;
  export let size: 'small' | 'medium' | 'large' = 'medium';

  function getIconSize() {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 32;
      case 'large':
        return 40;
      default:
        throw new Error('Unknown size');
    }
  }
</script>

<Icon
  {icon}
  {inline}
  style="width: {getIconSize()}px; height: {getIconSize()}px"
/>

<style lang="scss">
  @use "../theme";
</style>
