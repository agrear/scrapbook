<script lang="ts">
  import { MDCRipple } from '@material/ripple';
  import { clamp, snap } from '@popmotion/popcorn';
  import { onDestroy } from 'svelte';

  import Tooltip from './Tooltip.svelte';

  type Orientation = 'horizontal' | 'vertical';

  type Mark = {
    value: number,
    label: string
  };

  export let value: number = 0;
  export let min = 0;
  export let max = 100;
  export let step: number | null = 1;
  export let name: string | undefined = undefined;
  export let disabled = false;
  export let tabIndex = 0;

  export let marks: Mark[] = [];
  export let orientation: Orientation = 'horizontal';
  export let width = orientation === 'horizontal' ? 160 : 20;
  export let height = orientation === 'horizontal' ? 20 : 160;
  export let onChange: ((event: Event) => void) | undefined = undefined;
  export let onInput: ((event: Event) => void) | undefined = undefined;

  export function focus() {
    root?.focus();
  };

  function computeValueFromOffset(value: number, delta: number, length: number) {
    const current = ((value - min) / (max - min)) * length;

    return clamp(
      min,
      max,
      snapTo(min + ((current + delta) / length) * (max - min))
    );
  }

  function setValue(newValue: number) {
    if (newValue !== value) {
      value = newValue;
      input?.dispatchEvent(new Event('input'));
    }
  }

  function stepValue(direction: 'up' | 'down') {
    let newValue = value;

    if (step !== null) {
      newValue = snapTo(value + (direction === 'up' ? step : -step));
    } else {
      const index = marks.findIndex(mark => mark.value === value);
      if (index !== -1) {
        newValue = marks[clamp(
          0,
          marks.length - 1,
          index + (direction === 'up' ? 1 : -1)
        )].value;
      }
    }

    setValue(newValue);
  }

  let root: HTMLDivElement | null = null;
  let input: HTMLInputElement | null = null;
  let thumb: HTMLDivElement | null = null;
  let rippleSurface: HTMLSpanElement | null = null;
  let ripple: MDCRipple | null = null;

  let sliderWidth: number | null = null;
  let sliderHeight: number | null = null;

  let marksContainerWidth = 0;

  let hovering = false;
  let dragging = false;
  let dragStart = { value: 0, x: 0, y: 0 };

  let oldMarks: Mark[] = [];
  let _marks: (Mark & { width: number })[] = [];

  let oldValue = value;

  $: if (oldMarks.length !== marks.length || !oldMarks.every(({ label, value }, i) => (
    label === marks[i].label && value === marks[i].value
  ))) {
    oldMarks = marks.map(mark => ({ ...mark }));
    _marks = marks.map(mark => ({ ...mark, width: 0 })).sort((a, b) => (
      b.value - a.value
    ));
  }

  $: {
    marksContainerWidth = _marks.reduce((acc, { width }) => (
      width > acc ? width : acc
    ), 0);
  }

  $: snapTo = snap(step === null ? marks.map(({ value }) => value) : step);

  $: if (rippleSurface !== null) {
    ripple?.destroy();
    ripple = new MDCRipple(rippleSurface);
  }

  onDestroy(() => ripple?.destroy());
</script>

<svelte:window
  on:pointermove={dragging ? event => {
    event.preventDefault();

    let newValue = value;
    if (orientation === 'horizontal') {
      newValue = computeValueFromOffset(
        dragStart.value,
        event.screenX - dragStart.x,
        sliderWidth ?? 0
      );
    } else {
      newValue = computeValueFromOffset(
        dragStart.value,
        dragStart.y - event.screenY,
        sliderHeight ?? 0
      );
    }

    setValue(newValue);
  } : undefined}
  on:pointerup={() => dragging = false}
/>

<div
  bind:this={root}
  class="outline-none"
  {tabIndex}
  on:blur={() => {
    if (value !== oldValue) {
      input?.dispatchEvent(new Event('change'));
      oldValue = value;
    }
  }}
  on:keydown={event => {
    if (event.key === 'ArrowDown') {
      stepValue('down');
    } else if (event.key === 'ArrowUp') {
      stepValue('up');
    }
  }}
>
  <input
    bind:this={input}
    type="range"
    class="hidden"
    {value}
    {min}
    {max}
    {step}
    {disabled}
    {name}
    on:change={onChange}
    on:input={onInput}
  />

  <div
    class="flex items-stretch gap-4 py-2"
    class:flex-col={orientation === 'horizontal'}
    class:pl-1.5={orientation === 'vertical'}
    class:pt-1.5={orientation === 'horizontal'}
    class:px-2={orientation === 'horizontal'}
    style="min-width: {width}px; min-height: {height}px;"
  >
    <div
      bind:clientWidth={sliderWidth}
      bind:clientHeight={sliderHeight}
      class="relative rounded-full bg-neutral-400"
      class:h-1={orientation === 'horizontal'}
      class:w-1={orientation === 'vertical'}
      on:click={event => {  // Set thumb
        let newValue = value;
        if (orientation === 'horizontal' && sliderWidth !== null) {
          newValue = snapTo(
            min + (event.offsetX / sliderWidth) * (max - min)
          );
        } else if (orientation === 'vertical' && sliderHeight !== null) {
          newValue = snapTo(
            min + (1 - event.offsetY / sliderHeight) * (max - min)
          );
        }

        setValue(newValue);
      }}
    >
      <div
        class="absolute bg-blue-500 pointer-events-none"
        class:left-0={orientation === 'horizontal'}
        class:bottom-0={orientation === 'vertical'}
        style="
          {orientation === 'horizontal' ? 'top' : 'left'}: -1px;
          {orientation === 'horizontal' ? 'bottom' : 'right'}: -1px;
          {orientation === 'horizontal' ? 'width' : 'height'}: {
            ((value - min) / (max - min)) * 100
          }%;
        "
      />

      {#each marks as { value }}
        <div
          class="absolute -inset-x-0.5 h-0.5 bg-white bg-opacity-50"
          class:hidden={value === min || value === max}
          style="
            bottom: {((value - min) / (max - min)) * 100}%;
            transform: translateY(50%);
          "
        />
      {/each}

      <div
        bind:this={thumb}
        class="
          thumb
          absolute
          w-4
          h-4
          cursor-pointer
          shadow-lg
          rounded-full
          bg-blue-500
        "
        style={orientation === 'horizontal' ? `
          left: ${((value - min) / (max - min)) * 100}%;
          transform: translate(-50%, -6px);
        ` : `
          bottom: ${((value - min) / (max - min)) * 100}%;
          transform: translate(-6px, 50%);
        `}
        on:pointerdown={event => {
          dragStart = { value, x: event.screenX, y: event.screenY };
          dragging = true;
        }}
        on:pointerenter={() => hovering = true}
        on:pointerleave={() => hovering = false}
        on:click|stopPropagation={() => {}}
      >
        <span bind:this={rippleSurface} />
      </div>
    </div>

    {#if marks.length > 0}
      <div
        class="relative"
        style="width: {marksContainerWidth}px;"
      >
        {#each _marks as mark, i (mark.value)}
          <div
            bind:clientWidth={_marks[i].width}
            class="absolute right-0 cursor-pointer select-none"
            style="
              bottom: {((mark.value - min) / (max - min)) * 100}%;
              transform: translateY(50%);
            "
            on:click={() => setValue(mark.value)}
          >
            {mark.label}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<Tooltip
  open={hovering || dragging}
  title={String(Math.round(value))}
  anchorElement={thumb}
  arrow
  placement={orientation === 'horizontal' ? 'top' :  'left'}
  offset={16}
/>

<style lang="scss">
  @use "@material/ripple";

  .thumb {
    @include ripple.surface;
    @include ripple.radius-bounded;
    @include ripple.states-base-color(white);
    @include ripple.states-opacities((hover: .1, focus: .3, press: .2));
  }
</style>
