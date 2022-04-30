<script lang="ts">
  import menuDownIcon from '@iconify/icons-mdi/menu-down';
  import menuUpIcon from '@iconify/icons-mdi/menu-up';
  import { onDestroy } from 'svelte';

  import Icon from './Icon.svelte';
  import Menu from './Menu.svelte';
  import MenuItem from './MenuItem.svelte';

  type T = $$Generic<string | Record<string, any>>;

  interface $$Slots {
		default: {
			option: T,
      selected: boolean
		}
	}

  const searchResetTime = 1000;

  export let options: T[];
  export let value: T | T[] | undefined = undefined;
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let dense = false;
  export let multiple = false;
  export let onChange: ((event: Event) => void) | undefined = undefined;

  export let getOptionLabel: (option: T) => string = option => (
    typeof option === 'string' ? option : option.label
  );

  export let isOptionEqualToValue: (
    option: T,
    value: T
  ) => boolean = (option, value) => option === value;

  export let renderValue: (selected: T[]) => string = selected => (
    selected.join(', ')
  );

  export let width = '100%';
  export let minWidth = '120px';

  let root: HTMLDivElement | null = null;
  let input: HTMLInputElement | null = null;
  let inputValue = '';
  let open = false;

  let selectedIndex = -1;

  let searchTimeout: number | undefined = undefined;
  let searchValue = '';

  function selectOption(option: T) {
    if (multiple) {
      if (Array.isArray(value)) {
        const index = value.indexOf(option);
        if (index !== -1) {  // Remove value
          value = [
            ...value.slice(0, index),
            ...value.slice(index + 1)
          ];
        } else {  // Add value
          value = [...value, option];
        }

        // Update selected index
        selectedIndex = options.findIndex(o => (
          isOptionEqualToValue(o, option)
        ));
      }
    } else {
      value = option;
      open = false;
    }

    input?.dispatchEvent(new Event('change'));
  }

  $: {
    if (Array.isArray(value)) {
      inputValue = renderValue(value);
    } else if (value !== undefined) {
      inputValue = getOptionLabel(value);
    } else {
      inputValue = '';
    }
  }

  $: if (open) {
    selectedIndex = value !== undefined ? options.findIndex(option => {
      if (value !== undefined) {
        return isOptionEqualToValue(
          option,
          Array.isArray(value) ? value[0] : value
        );
      }

      return false;
    }) : -1;
  }

  onDestroy(() => window.clearTimeout(searchTimeout));
</script>

<div
  bind:this={root}
  class="relative"
  style="width: {width}; min-width: {minWidth};"
>
  <input
    bind:this={input}
    type="select"
    class="w-full cursor-pointer"
    {id}
    {name}
    {placeholder}
    readonly
    value={inputValue}
    on:click={() => open = !open}
    on:change={onChange}
    on:keydown|preventDefault={event => {
      window.clearTimeout(searchTimeout);

      if (event.key.length === 1) {
        searchTimeout = window.setTimeout(() => {
          searchValue = '';
          searchTimeout = undefined;
        }, searchResetTime);

        searchValue += event.key.toLowerCase();
      }

      if (searchValue) {
        const index = options.findIndex(option => (
          getOptionLabel(option).toLowerCase().startsWith(searchValue)
        ));

        if (index !== -1) {
          selectedIndex = index;
        }
      }

      if (event.key === 'ArrowUp') {
        selectedIndex = Math.max(0, selectedIndex - 1);
      } else if (event.key === 'ArrowDown') {
        selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
      } else if (event.key === 'Enter') {
        if (selectedIndex !== -1) {
          selectOption(options[selectedIndex]);
        }
      }
    }}
  />

  <span
    class="absolute inset-y-0 right-0 flex items-center pointer-events-none"
  >
    <Icon icon={open ? menuUpIcon : menuDownIcon} size="small" />
  </span>

  <Menu
    {open}
    items={options}
    {dense}
    {selectedIndex}
    anchorElement={root}
    onClose={() => open = false}
    let:item={option}
    let:selected
  >
    <MenuItem
      activated={
        Array.isArray(value) ? value.indexOf(option) !== -1 : option === value
      }
      {selected}
      onClick={() => selectOption(option)}
    >
      {getOptionLabel(option)}
    </MenuItem>
  </Menu>
</div>
