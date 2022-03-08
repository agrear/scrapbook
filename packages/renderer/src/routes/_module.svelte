<script lang="ts">
  import { activeRoute } from '@roxi/routify';

  import Navbar from './_components/navbar/Navbar.svelte';
</script>

<div>
  <Navbar />

  <div style="margin-top: 1rem;">
    Location: {$activeRoute.url}
    <br /><br />
    Internal: {$activeRoute.router.url.internal()}
    <br /><br />
    External: {$activeRoute.router.url.external()}
  </div>

  <div style="margin-top: 2rem;">
    <slot />
  </div>
</div>
