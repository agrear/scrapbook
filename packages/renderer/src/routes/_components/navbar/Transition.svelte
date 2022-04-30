<script lang="js">
  //import { BaseTransition } from '@roxi/routify';
  import { scale, fly } from 'svelte/transition';

  export let scoped;
  const { width } = scoped;

  const configs = [
    {
      // New and old route are identical, do nothing
      condition: ({ routes }) => routes[0] === routes[1],
      transition: () => {}
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
      condition: c => c.toHigherIndex,
      transition: fly,
      inParams: { opacity: 0.3, y: 32, duration: 300 },
      outParams: { y: -32, duration: 150 }
    },
    {
      condition: c => c.toLowerIndex,
      transition: fly,
      inParams: { opacity: 0.3, y: -32, duration: 300 },
      outParams: { y: 32, duration: 150 }
    },
    {
      // No matching config. We don't want a transition
      condition: () => true,
      transition: () => {}
    }
  ];
</script>

<!--
<BaseTransition {configs}>
  <slot />
</BaseTransition>
-->
