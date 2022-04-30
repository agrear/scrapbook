<script lang="ts">
  import sortIcon from '@iconify/icons-mdi/sort';
  import sortAlphabeticalAscendingIcon from '@iconify/icons-mdi/sort-alphabetical-ascending';
  import sortAlphabeticalDescendingIcon from '@iconify/icons-mdi/sort-alphabetical-descending';
  import sortNumbericAscendingIcon from '@iconify/icons-mdi/sort-numeric-ascending';
  import sortNumbericDescendingIcon from '@iconify/icons-mdi/sort-numeric-descending';

  import type { GridNativeColTypes, GridSortDirection } from './DataGrid.svelte';
  import IconButton from './IconButton.svelte';

  export let sortingOrder: GridSortDirection;
  export let type: GridNativeColTypes;

  function getIcon(
    sortingOrder: GridSortDirection,
    type: GridNativeColTypes
  ) {
    switch (sortingOrder) {
      case 'asc':
        switch (type) {
          case 'string':
            return sortAlphabeticalAscendingIcon;
          case 'number':
            return sortNumbericAscendingIcon;
        }
      case 'desc':
        switch (type) {
          case 'string':
            return sortAlphabeticalDescendingIcon;
          case 'number':
            return sortNumbericDescendingIcon;
        }
      default:
        return sortIcon;
    }
  }

  $: icon = getIcon(sortingOrder, type);
</script>

<IconButton {icon} size="small" />
