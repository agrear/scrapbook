<script context="module" lang="ts">
  export enum ToolbarState {
    LayoutDialogOpen,
    Idle,
    MenuOpen
  }
</script>

<script lang="ts">
  import lightbulbOnIcon from '@iconify/icons-mdi/lightbulb-on';
  import magnifyIcon from '@iconify/icons-mdi/magnify';
  import navigationVariantIcon from '@iconify/icons-mdi/navigation-variant';
  import pictureInPictureTopRightIcon from '@iconify/icons-mdi/picture-in-picture-top-right';
  import wrenchIcon from '@iconify/icons-mdi/wrench';

  import BrightnessMenu from './BrightnessMenu.svelte';
  import LayoutDialog from './LayoutDialog.svelte';
  import NavigationMenu from './NavigationMenu.svelte';
  import ZoomMenu from './ZoomMenu.svelte';
  import Button from '/@/components/Button.svelte';
  import Toolbar from '/@/components/Toolbar.svelte';

  enum Menu {
    Brightness,
    Navigation,
    Zoom
  }

  export let title: string;
  export let bookmark: number;
  export let pages: number;
  export let objectFit: ObjectFit;
  export let objectPosition: ObjectPosition;
  export let zoom: number;
  export let brightness: number;
  export let state: ToolbarState = ToolbarState.Idle;

  export let onEdit: () => void;
  export let onNavigate: (page: number) => void;
  export let onZoomChange: (zoom: number) => void;
  export let onBrightnessChange: (brightness: number) => void;
  export let onLayoutChange: (layout: Layout) => void;

  let menuButton: HTMLElement | null = null;
  let menuOpen: Menu | null = null;

  function onMenuButtonClick(event: Event, menu: Menu) {
    menuButton = event.currentTarget as HTMLButtonElement;
    menuOpen = menuOpen !== menu ? menu : null;
    state = menuOpen !== null ? ToolbarState.MenuOpen : ToolbarState.Idle;

    // Prevent menu from being toggled with Enter key
    menuButton.blur();
  }

  function onMenuClose() {
    menuOpen = null;
    state = ToolbarState.Idle;
  }
</script>

<Toolbar justifyContent="flex-end">
  <div class="flex flex-grow items-center justify-center min-w-0 px-4">
    <div
      class="
        whitespace-nowrap
        text-ellipsis
        overflow-hidden
        select-none
        mdc-typography--headline6
      "
    >
      {title}
    </div>
  </div>

  <Button
    startIcon={navigationVariantIcon}
    disabled={pages <= 1}
    tabIndex={-1}
    onClick={event => onMenuButtonClick(event, Menu.Navigation)}
  >
    {bookmark + 1}/{pages}
  </Button>

  <Button
    startIcon={magnifyIcon}
    tabIndex={-1}
    onClick={event => onMenuButtonClick(event, Menu.Zoom)}
  >
    {Math.round(zoom * 100)}%
  </Button>

  <Button
    startIcon={lightbulbOnIcon}
    tabIndex={-1}
    onClick={event => onMenuButtonClick(event, Menu.Brightness)}
  >
    {Math.round(brightness * 100)}%
  </Button>

  <Button
    startIcon={pictureInPictureTopRightIcon}
    tabIndex={-1}
    onClick={() => state = ToolbarState.LayoutDialogOpen}
  >
    Layout
  </Button>

  <Button startIcon={wrenchIcon} tabIndex={-1} onClick={onEdit}>
    Edit
  </Button>

  <NavigationMenu
    anchorElement={menuButton}
    open={menuOpen === Menu.Navigation}
    {bookmark}
    {pages}
    onPageChange={page => {
      onMenuClose();
      onNavigate(page);
    }}
    onClose={onMenuClose}
  />

  <ZoomMenu
    open={menuOpen === Menu.Zoom}
    anchorElement={menuButton}
    zoom={zoom * 100}
    onZoomChange={zoom => onZoomChange(zoom / 100)}
    onClose={onMenuClose}
  />

  <BrightnessMenu
    open={menuOpen === Menu.Brightness}
    anchorElement={menuButton}
    brightness={brightness * 100}
    onBrightnessChange={brighnness => onBrightnessChange(brighnness / 100)}
    onClose={onMenuClose}
  />
</Toolbar>

<LayoutDialog
  open={state === ToolbarState.LayoutDialogOpen}
  {objectFit}
  {objectPosition}
  onClose={() => state = ToolbarState.Idle}
  {onLayoutChange}
/>
