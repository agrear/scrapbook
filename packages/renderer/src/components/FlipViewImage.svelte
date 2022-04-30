<script lang="ts">
  import { onMount } from 'svelte';
  import {
    animate,
    Motion,
    MotionValue,
    type Point2D,
    type Spring,
    useMotionValue
  } from 'svelte-motion';

  import type { Size } from '../util';

  const spring: Spring = {
    type: 'spring',
    duration: 0.5,
    bounce: 0.4
  };

  export let src: string | undefined;
  export let position: Point2D;
  export let size: Size;
  export let brightness = 1;
  export let onDoubleClick: () => void;

  const x = useMotionValue<number>(0);
  const y = useMotionValue<number>(0);
  const width = useMotionValue<number>(0);
  const height = useMotionValue<number>(0);

  let mounted = false;

  function animateValue(value: MotionValue, to: number) {
    if (mounted) {
      animate(value, to, spring);
    }
  }

  $: {
    animateValue(x, position.x);
    animateValue(y, position.y);
  }

  $: {
    animateValue(width, size.width);
    animateValue(height, size.height);
  }

  onMount(() => {
    x.set(position.x, false);
    y.set(position.y, false);
    width.set(size.width, false);
    height.set(size.height, false);

    mounted = true;
  })
</script>

<Motion let:motion style={{ x, y, width, height }}>
  <img
    use:motion
    {src}
    alt=""
    draggable={false}
    class="max-w-none"
    style="filter: brightness({brightness});"
    on:dblclick={onDoubleClick}
  />
</Motion>
