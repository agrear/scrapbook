<script lang="js">
  import BaseTransition from '@roxi/routify/runtime/decorators/BaseTransition.svelte';
  import { fly, scale } from 'svelte/transition';

  export let scoped;

  const configs = [
    {
      // New and old route are identical, do nothing
      condition: ({ routes }) => routes[0] === routes[1],
      transition: () => {}
    },
    {
      condition: c => c.toHigherIndex,
      transition: fly,
      inParams: { duration: 300, opacity: 0.3, x: 32 },
      outParams: { duration: 150, x: -32 }
    },
    {
      condition: c => c.toLowerIndex,
      transition: fly,
      inParams: { duration: 300, opacity: 0.3, x: -32 },
      outParams: { duration: 150, x: 32 }
    },
    {
      condition: c => c.toAncestor,
      transition: scale,
      inParams: { start: 1.2 },
      outParams: { start: 0.8 }
    },
    {
      condition: c => c.toDescendant,
      transition: scale,
      inParams: { start: 0.8 },
      outParams: { start: 1.2 }
    },
    {
      // No matching config. We don't want a transition
      condition: () => true,
      transition: () => {}
    }
  ];
</script>

<BaseTransition {configs}>
  <slot />
</BaseTransition>
