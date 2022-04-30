<script lang="ts">
  import { Router } from '@roxi/routify';

  import routes from '../../../.routify/routes.default.js';

  const urlRewrite: RoutifyRuntimeOptions['urlRewrite'] = {
    toInternal: url => {
      const hashIndex = url.indexOf('#');
      return hashIndex !== -1 ? url.slice(hashIndex + 1) : '/';
    },
    toExternal: url => `#${url}`
  };
</script>

<Router {routes} {urlRewrite} />
