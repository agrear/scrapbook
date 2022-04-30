<script lang="ts">
  import { nanoid } from 'nanoid';
  import { createEventDispatcher, setContext } from 'svelte';
  import { writable } from 'svelte/store';

  import { key, type RadioGroupContext } from './_radioGroup';

  const dispatch = createEventDispatcher();

  export let defaultValue: any | undefined = undefined;
  export let name: string = nanoid();
  export let row = false;
  export let value: any | undefined = undefined;
  export let onChange: ((event: Event & {
    currentTarget: EventTarget & HTMLInputElement;
  }) => void) | undefined = undefined;

  const radioGroup = writable<RadioGroupContext>({
    name,
    group: value ?? defaultValue,
    onChange: event => {
      value = $radioGroup.group;
      onChange?.(event);
    }
  });

  setContext(key, radioGroup);
</script>

<div
  class="flex"
  class:gap-4={row}
  class:flex-col={!row}
>
  <slot />
</div>
