<script lang="ts">
  import imageIcon from '@iconify/icons-mdi/image';
  import IconifyIcon from '@iconify/svelte';
  import { Motion, type MotionStyle } from 'svelte-motion';

  import {
    fitObjectSize,
    getHorizontalAlignment,
    getVerticalAlignment
  } from '/@/util';

  type Position = {
    value: ObjectPosition,
    style: MotionStyle
  };

  function getPositionStyle(pos?: string | number) {
    if (pos === undefined) {
      return 'auto';
    }

    return typeof pos === 'number' ? `${pos}px` : pos;
  }

  export let fit: ObjectFit;
  export let position: ObjectPosition;
  export let onChange: () => void;

  const pointOverlap = 8;

  const positionPoints: Position[] = [
    { value: 'left top', style: { top: 0, left: 0 } },
    { value: 'center top', style: { top: 0, left: '50%' } },
    { value: 'right top', style: { top: 0, left: '100%' } },
    { value: 'left center', style: { top: '50%', left: 0 } },
    { value: 'center center', style: { top: '50%', left: '50%' } },
    { value: 'right center', style: { top: '50%', left: '100%' } },
    { value: 'left bottom', style: { top: '100%', left: 0 } },
    { value: 'center bottom', style: { top: '100%', left: '50%' } },
    { value: 'right bottom', style: { top: '100%', left: '100%' } }
  ];

  const container = { width: 180, height: 140 };
  const image = { width: 80, height: 100 };
  $: size = fitObjectSize(fit, container, image);
</script>

<Motion let:motion layout>
  <div
    class="relative flex box-content border-2 mt-2"
    style="
      width: {container.width}px;
      height: {container.height}px;
      align-items: {getVerticalAlignment(position)};
      justify-content: {getHorizontalAlignment(position)};
    "
  >
    <div
      use:motion
      class="
        flex
        w-full
        h-full
        items-center
        justify-center
        opacity-50
        z-10
        border
        pointer-events-none
      "
      style="
        width: {size.width}px;
        height: {size.height}px;
      "
    >
      <IconifyIcon icon={imageIcon} width={48} />
    </div>

    {#each positionPoints as { value, style } (value)}
      <Motion
        let:motion
        style={{ translateX: '-50%', translateY: '-50%' }}
        whileHover={{ scale: 1.2 }}
      >
        <div
          use:motion
          class="absolute w-4 h-4 rounded-full"
          style="
            background-color: {value === position ? 'red' : 'white'};
            cursor: {value === position ? 'default' : 'pointer'};
            top: {style.top};
            left: {style.left};
          "
          on:click={() => {
            position = value;
            onChange();
          }}
        />
      </Motion>
    {/each}
  </div>
</Motion>
