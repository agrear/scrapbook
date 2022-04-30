<script lang="ts">
  interface $$Slots {
		default: {
			start: number,
      end: number
		}
	}

  const padding = 8;

  export let items: number;
  export let dense = false;
  export let maxHeight: number | string = 400;

  export function scrollToIndex(index: number) {
    window.setTimeout(() => {
      viewport?.scroll({ top: index * itemHeight + padding });
    });
  }

  let viewport: HTMLDivElement | null = null;
  let height: number | null = null;
  let scrollY = 0;
  let start = -1;
  let end = -1;

  $: itemHeight = dense ? 40 : 48;

  $: listHeight = itemHeight * items + 2 * padding;

  $: if (height !== null) {
    start = Math.floor((scrollY / listHeight) * items);
    end = Math.ceil(((scrollY + height) / listHeight) * items);
  }
</script>

<div
  bind:this={viewport}
  bind:clientHeight={height}
  class="overflow-y-auto"
  style="
    max-height: {typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight};
  "
  on:scroll|preventDefault={event => scrollY = event.currentTarget.scrollTop}
  on:pointerdown|capture
>
  <ul
    class="mdc-deprecated-list bg-neutral-700"
    class:mdc-deprecated-list--dense={dense}
    aria-hidden="true"
    aria-orientation="vertical"
    tabindex="-1"
    style="height: {listHeight}px;"
  >
    <div style="height: {start * itemHeight}px" />

    <slot {start} {end} />
  </ul>
</div>
