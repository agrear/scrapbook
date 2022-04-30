<script lang="ts">
  import closeIcon from '@iconify/icons-mdi/close';
  import helpIcon from '@iconify/icons-mdi/help-circle-outline';
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';

  import SearchHelpDialog from './SearchHelpDialog.svelte';
  import { SearchMode } from './SearchMode';
  import Icon from '/@/components/Icon.svelte';
  import Radio from '/@/components/Radio.svelte';
  import RadioGroup from '/@/components/RadioGroup.svelte';

  const dispatch = createEventDispatcher();

  export let mode: SearchMode;

  let open = false;
  let helpOpen = false;

  $: if (open) {
    dispatch('open');
  }

  $: if (!open) {
    dispatch('close');
  }
</script>

<svelte:window
  on:keydown={event => {
    if (event.ctrlKey) {
      if (event.key === 'f') {
        event.stopPropagation();

        if (!open) {
          open = true;
        } else {
          dispatch('open');
        }
      }
    } else if (event.key === 'Escape') {
      open = false;
    }
  }}
/>

{#if open}
  <div
    in:fly|local={{ y: -40, duration: 300 }}
    out:fly|local={{ y: -40, duration: 300 }}
    class="
      absolute
      top-0
      right-0
      w-80
      max-w-xs
      bg-neutral-800
      z-app-bar
    "
    style="filter: drop-shadow(4px 4px 4px rgb(0 0 0 / 0.5));"
  >
    <div class="flex justify-stretch">
      <div class="flex-grow h-full min-w-0 bg-neutral-700">
        <slot />
      </div>

      <div
        class="
          flex
          items-center
          justify-center
          bg-neutral-800
          hover:bg-neutral-600
          cursor-pointer
          px-1.5
        "
        on:click={() => open = false}
      >
        <Icon icon={closeIcon} size="small" />
      </div>
    </div>

    <div class="flex items-center gap-4 h-6 mx-1 my-2">
      <div>
        <RadioGroup row value={mode}>
          <Radio label="Simple" value={SearchMode.Simple} density={-3} />
          <Radio label="Extended" value={SearchMode.Extended} density={-3} />
        </RadioGroup>
      </div>

      <div
        class="flex gap-1.5 cursor-pointer mdc-typography--body"
        on:click={() => helpOpen = true}
      >
        <Icon icon={helpIcon} inline size="small" />
        <span>Help</span>
      </div>
    </div>
  </div>
{/if}

<SearchHelpDialog
  open={helpOpen}
  on:close={() => helpOpen = false}
/>
