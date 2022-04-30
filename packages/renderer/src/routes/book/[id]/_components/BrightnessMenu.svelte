<script lang="ts">
  import Popover from '/@/components/Popover.svelte';
  import Slider from '/@/components/Slider.svelte';

  export let open = false;
  export let anchorElement: Element | null | undefined = undefined;
  export let brightness: number;
  export let onBrightnessChange: (brightness: number) => void;
  export let onClose: () => void;

  const marks = [25, 50, 75, 100, 125].map(value => ({
    value,
    label: `${value}%`
  }));

  let slider: Slider | null = null;

  $: if (open) {
    slider?.focus?.();
  }
</script>

<Popover {open} {anchorElement} anchorOrigin="bottom-start" {onClose}>
  <div class="p-4">
    <Slider
      bind:this={slider}
      bind:value={brightness}
      min={25}
      max={125}
      step={5}
      orientation="vertical"
      {marks}
      height={200}
      onInput={() => onBrightnessChange(brightness)}
    />
  </div>
</Popover>
