<script lang="ts">
  import { Router } from '@roxi/routify';

  import routes from '../../../.routify/routes.default.js';

  const config = {
    useHash: true
  };
</script>

<Router {routes} {config} />

<style>
  :global(body) {
    color: white;
  }
</style>
