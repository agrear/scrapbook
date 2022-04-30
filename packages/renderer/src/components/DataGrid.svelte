<script context="module" lang="ts">
  export type GridAlignment = 'left' | 'right' | 'center';

  export type GridCellValue = string | number | boolean | Date | null | undefined | object;

  export type GridNativeColTypes = 'string' | 'number' | 'date' | 'dateTime' | 'boolean';

  export type GridColDef<T> = {
    field: string,
    headerName?: string,
    description?: string,
    type?: GridNativeColTypes,
    minWidth?: number,
    maxWidth?: number,
    width?: number,
    sortable?: boolean,
    headerAlign?: GridAlignment,
    align?: GridAlignment,
    sortComparator?: GridComparatorFn,
    sortingOrder?: GridSortDirection[],
    valueGetter?: (row: T) => any
  };

  export type GridRowModel<T = { [key: string]: any }> = T;

  export type GridSortDirection = 'asc' | 'desc' | null | undefined;

  export interface GridSortCellParams {
    id: string;
    field: string;
    value: GridCellValue;
  }

  export type GridComparatorFn = (
    v1: GridCellValue,
    v2: GridCellValue
  ) => number;

  export interface GridSortItem {
    field: string;
    sort: GridSortDirection;
    type: GridNativeColTypes;
  }

  export type GridSortModel = GridSortItem[];

  export type GridDensity = 'comfortable' | 'compact' | 'standard';

  export const COMPACT_DENSITY_FACTOR = 0.7;
  export const COMFORTABLE_DENSITY_FACTOR = 1.3;

  function getCellHeight(density: GridDensity, height: number) {
    switch (density) {
      case 'comfortable':
        return height * COMFORTABLE_DENSITY_FACTOR;
      case 'compact':
        return height * COMPACT_DENSITY_FACTOR;
      default:
        return height;
    }
  }

  function getTextAlign(align?: GridAlignment, type?: GridNativeColTypes) {
    return align ?? (type === 'string' ? 'left' : 'right');
  }
</script>

<script lang="ts">
  import deleteIcon from '@iconify/icons-mdi/delete';
  import editIcon from '@iconify/icons-mdi/edit';
  import { flip } from 'svelte/animate';

  import Checkbox from './Checkbox.svelte';
  import DataGridSortButton from './DataGridSortButton.svelte';
  import IconButton from './IconButton.svelte';

  type T = $$Generic<GridRowModel>;

  const defaultGridColDef = {
    type: 'string' as GridNativeColTypes,
    minWidth: 50,
    maxWidth: Infinity,
    width: 100,
    sortable: true,
    sortingOrder: [null, 'asc', 'desc'] as GridSortDirection[],
    sortingIndex: 0
  };

  export let columns: GridColDef<T>[];
  export let rows: T[];

  export let checkboxSelection = false;
  export let deletable = false;
  export let editable = false;
  export let headerHeight = 56;
  export let rowHeight = 52;
  export let density: GridDensity = 'standard';

  export let getRowId: (row: T) => string = row => row.id;
  export let onEdit: ((row: T) => void) | undefined = undefined;
  export let onDelete: ((row: T) => void) | undefined = undefined;
  export let onMasterToggle: ((checked: boolean) => void) | undefined = undefined;
  export let onToggle: (() => void) | undefined = undefined;
  export let onRowClick: ((row: T) => void) | undefined = undefined;

  let sortingItem: GridSortItem | null = null;

  function getComparatorFn(
    sort: GridSortDirection,
    type: GridNativeColTypes
  ): (v1: any, v2: any) => number {
    switch (sort) {
      case 'asc':
        switch (type) {
          case 'string':
            return (v1: string, v2: string) => v1.localeCompare(v2);
          case 'number':
            return (v1: number, v2: number) => v1 - v2;
        }
      case 'desc':
        switch (type) {
          case 'string':
            return (v1: string, v2: string) => v2.localeCompare(v1);
          case 'number':
            return (v1: number, v2: number) => v2 - v1;
        }
      default:
        return (v1: GridCellValue, v2: GridCellValue) => 0;
    }
  }

  $: _columns = columns.map(column => ({
    ...defaultGridColDef,
    ...column
  }));

  $: _rows = [...rows];

  $: if (sortingItem) {
    const { field, sort, type } = sortingItem;

    if (sort === null || sort === undefined) {
      _rows = [...rows];
    } else {
      const comparatorFn = getComparatorFn(sort, type);
      _rows = [...rows].sort((a, b) => comparatorFn(a[field], b[field]));
    }
  }

  $: masterChecked = rows.every(row => row.checked);
  $: masterIndeterminate = !masterChecked && rows.some(row => row.checked);
</script>

<div class="px-4 overflow-auto">
  <table class="border-collapse">
    <thead class="sticky top-0 z-10 backdrop-blur-md">
      <tr
        class="select-none mdc-typography--headline6"
        style="height: {getCellHeight(density, headerHeight)}px;"
      >
        {#if checkboxSelection}
          <th>
            <Checkbox
              bind:checked={masterChecked}
              indeterminate={masterIndeterminate}
              onChange={() => onMasterToggle?.(masterChecked)}
            />
          </th>
        {/if}

        {#each _columns as {
          field,
          headerAlign,
          headerName,
          type,
          width,
          minWidth,
          maxWidth,
          sortable,
          sortingOrder,
          sortingIndex
        }, i}
          <th
            class:cursor-pointer={sortable}
            style="
              width: {width}px;
              min-width: {minWidth}px;
              {maxWidth ? `max-width: ${maxWidth}px;` : ''}
            "
            on:click={() => {
              _columns[i].sortingIndex = (sortingIndex + 1) % sortingOrder.length;
              sortingItem = {
                field,
                sort: sortingOrder[_columns[i].sortingIndex],
                type
              }
            }}
          >
            <div
              class="flex gap-2 items-center overflow-hidden"
              class:justify-end={getTextAlign(headerAlign, type) === 'right'}
            >
              {#if sortable && getTextAlign(headerAlign, type) === 'right'}
                <div class="sort-button hidden">
                  <DataGridSortButton
                    sortingOrder={sortingOrder[sortingIndex]}
                    {type}
                  />
                </div>
              {/if}

              <span class="text-ellipsis whitespace-nowrap">
                {headerName ?? field}
              </span>

              {#if sortable && getTextAlign(headerAlign, type) === 'left'}
                <div class="sort-button hidden">
                  <DataGridSortButton
                    sortingOrder={sortingOrder[sortingIndex]}
                    {type}
                  />
                </div>
              {/if}
            </div>
          </th>
        {/each}

        {#if editable}
          <th class="w-14" />
        {/if}

        {#if deletable}
          <th class="w-8" />
        {/if}
      </tr>
    </thead>

    <tbody>
      {#each _rows as row (getRowId(row))}
        <tr
          animate:flip|local={{ duration: 400 }}
          class="
            select-none
            cursor-pointer
            hover:bg-neutral-700
            mdc-typography--body
          "
          style="height: {getCellHeight(density, rowHeight)}px;"
          on:click={() => onRowClick?.(row)}
        >
          {#if row.checked !== undefined}
            <td>
              <Checkbox
                checked={row.checked}
                onChange={onToggle}
              />
            </td>
          {/if}

          {#each _columns as { align, field, type, valueGetter }}
            <td style="text-align: {getTextAlign(align, type)};">
              {valueGetter?.(row) ?? row[field]}
            </td>
          {/each}

          {#if editable}
            <td on:click|stopPropagation={() => {}}>
              <div class="flex items-center justify-end">
                <IconButton
                  icon={editIcon}
                  size="small"
                  onClick={() => onEdit?.(row)}
                />
              </div>
            </td>
          {/if}

          {#if deletable}
            <td on:click|stopPropagation={() => {}}>
              <div class="flex items-center justify-end">
                <IconButton
                  icon={deleteIcon}
                  size="small"
                  onClick={() => onDelete?.(row)}
                />
              </div>
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  td, th {
    padding: 0;
  }

  th:hover .sort-button {
    display: flex;
  }

  thead:after {
    content:'';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    border-bottom: 2px solid white;
  }
</style>
