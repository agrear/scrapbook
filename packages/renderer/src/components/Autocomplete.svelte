<script lang="ts">
  import menuDownIcon from '@iconify/icons-mdi/menu-down';
  import menuUpIcon from '@iconify/icons-mdi/menu-up';
  import Fuse from 'fuse.js';
  import { createEventDispatcher, tick } from 'svelte';

  import Floater from './Floater.svelte';
  import Icon from './Icon.svelte';
  import MenuItem from './MenuItem.svelte';
  import MenuList from './MenuList.svelte';

  type T = $$Generic<string | Record<string, any>>;

  export let options: T[];
  export let multiple = false;
  export let searchOptions: Fuse.IFuseOptions<any> = {};
  export let separator = ',';

  export let getOptionLabel: (option: T) => string = (option: T) => (
    (typeof option !== 'string') && ('label' in option) ? option.label : option
  );

  export let parseValue = (value: string, cursor: number) => {
    // Extract search term based on currently selected entry
    const start = value.substring(0, cursor).lastIndexOf(separator);
    const end = value.indexOf(separator, cursor);

    return value.substring(
      start !== -1 ? start + separator.length : 0,
      end !== -1 ? end : undefined
    ).trimStart();
  };

  export let parseTags = (value: string) => (
    value.split(separator).map(str => str.trimStart()).filter(Boolean)
  );

  export let selectOption = (option: T, value: string, cursor: number) => {
    // Replace currently selected entry
    const start = value.substring(0, cursor).lastIndexOf(separator, cursor);
    let end = value.indexOf(separator, cursor);
    end = end !== -1 ? end + separator.length : value.length;

    const label = getOptionLabel(option);

    return [
      value.substring(0, start),
      label,
      value.substring(end).trim()
    ].filter(Boolean).join(separator + ' ');
  };

  export let freeSolo = false;
  export let filterSelectedOptions = false;
  export let openOnFocus = false;
  export let disableCloseOnSelect = false;
  export let selectOnFocus = !freeSolo;

  export let value: any = undefined;
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let disabled = false;
  export let placeholder: string | undefined = undefined;
  export let border = 2;
  export let width = '100%';
  export let minWidth = '120px';

  export function focus() {
    input?.focus();
  }

  export function blur() {
    input?.blur();
  }

  const dispatch = createEventDispatcher();

  let root: HTMLDivElement | null = null;
  let input: HTMLInputElement | null = null;
  let open = false;
  let visibleOptions: any[] = [];
  let cursor = 0;

  $: fuse = new Fuse(options, searchOptions);

  $: extendedFuse = new Fuse(options, {
    ...searchOptions,
    useExtendedSearch: true
  });

  $: if (open && multiple) {
    const searchTerm = parseValue(String(value ?? ''), cursor);

    let results = options;
    if (searchTerm) {
      results = fuse.search(searchTerm).map(({ item }) => item);
    }

    if (filterSelectedOptions) {
      const tags =  parseTags(String(value ?? ''));
      const pattern = tags.map(tag => `="${tag}"`).join(' | ');
      const excluded = extendedFuse.search(pattern).map(({ item }) => item);
      results = results.filter(item => !excluded.includes(item));
    }

    visibleOptions = results;
  }

  $: if (open && !multiple) {
    const searchTerm = String(value ?? '').trimStart();

    let results = options;
    if (searchTerm) {
      results = fuse.search(searchTerm).map(({ item }) => item);
    }

    if (filterSelectedOptions) {
      const pattern = `="${searchTerm}"`;
      const excluded = extendedFuse.search(pattern).map(({ item }) => item);
      results = results.filter(item => !excluded.includes(item));
    }

    visibleOptions = results;
  }

  function updateCursorPosition() {
    cursor = input?.selectionStart ?? 0;
  }

  function setCursor(position: number) {
    window.setTimeout(function() {
      if (input) {
        input.setSelectionRange(position, position);
        cursor = position;
        // Scroll into view
        const progress = position / input.value.length;
        input.scrollLeft = Math.ceil(progress * input.scrollWidth);
      }
    }, 0);
  }

  function onOptionClick(option: T) {
    if (multiple) {
      value = selectOption(option, String(value ?? ''), cursor);
      value += `${separator} `;  // Append empty entry
    } else {
      value = getOptionLabel(option);
    }

    setCursor(value.length);  // Set cursor to end
  }

  function removeTrailingSeparator(text: string) {
    if (text.trimEnd().endsWith(separator)) {
      return text.trimEnd().slice(0, -separator.length);
    }

    return text;
  }

  async function triggerChange() {
    await tick();  // Prevent race condition with value cahnge
    input?.dispatchEvent(new Event('change', {
      bubbles: true
    }));
  }

  function closeOptions() {
    if (open) {
      open = false;
      dispatch('close');
    }
  }

  function openOptions() {
    if (!open) {
      open = true;
      dispatch('open');

      if (document.activeElement !== input) {  // First focus
        if (typeof value === 'string') {
          const trimmed = value.trimEnd();
          if (trimmed && !trimmed.endsWith(separator)) {
            value += `${separator} `;
          }
        }

        setCursor(value.length);  // Set cursor to end
      }
    }
  }
</script>

<svelte:window
  on:click|capture={event => {
    if (root === null || !open) {
      return;
    }

    const path = event.composedPath();

    if (!path.includes(root) && document.activeElement !== input) {
      open = false;
    }
  }}
/>

<div bind:this={root}>
  <div class="relative" style="width: {width}; min-width: {minWidth}">
    <input
      bind:this={input}
      type="text"
      class="w-full"
      class:pr-6={!freeSolo}
      style="border-width: {border}px;"
      {disabled}
      {id}
      {name}
      {placeholder}
      bind:value
      on:change
      on:blur={() => {
        closeOptions();
      }}
      on:focus={() => {
        if (openOnFocus) {
          openOptions();
        }

        if (selectOnFocus && input) {
          cursor = 0;
          input.setSelectionRange(0, input.value.length);
          input.scrollLeft = input.scrollWidth;  // Scroll into view
        }
      }}
      on:keydown={event => {
        updateCursorPosition();

        if (event.ctrlKey && event.key === ' ') {
          openOptions();
        }
      }}
      on:keyup={updateCursorPosition}
      on:pointerdown={() => {
        updateCursorPosition();

        if (!disabled) {
          openOptions();
        }
      }}
      on:pointerup={updateCursorPosition}
      on:touchstart={updateCursorPosition}
      on:input={updateCursorPosition}
      on:paste={updateCursorPosition}
      on:cut={updateCursorPosition}
      on:select={updateCursorPosition}
    />

    {#if !freeSolo}
      <span
        class="absolute inset-y-0 right-0 cursor-pointer flex items-center"
        on:click={() => {
          if (!open) {
            input?.focus();
            openOptions();
            setCursor(String(value ?? '').length);
          } else {
            closeOptions();
          }
        }}
      >
        <Icon icon={open ? menuUpIcon : menuDownIcon} size="small" />
      </span>
    {/if}
  </div>

  <Floater {open} anchorElement={root}>
    <MenuList
      items={visibleOptions.length !== 0 ? visibleOptions.length : 1}
      maxHeight="inherit"
      on:pointerdown={event => event.preventDefault()}
      let:start
      let:end
    >
      {#each visibleOptions.slice(start, end) as option (option)}
        <MenuItem
          onClick={async () => {
            onOptionClick(option);
            await triggerChange();

            if (!disableCloseOnSelect) {
              closeOptions();
            }

            focus();  // Refocus input
          }}
        >
          {getOptionLabel(option)}
        </MenuItem>
      {/each}

      {#if visibleOptions.length === 0}
        <MenuItem disabled>
          <em>No options</em>
        </MenuItem>
      {/if}
    </MenuList>
  </Floater>
</div>
