<script lang="ts">
  import arrowLeftIcon from '@iconify/icons-mdi/arrow-left';
  import logoutIcon from '@iconify/icons-mdi/logout';
  import { goto, isActive } from '@roxi/routify';
  import { onDestroy } from 'svelte';
  import { cubicIn, cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';

  import NavbarButton from './NavbarButton.svelte';
  import routes from './routes';
  import clickOutside from '/@/util/clickOutside';

  const WIDTH_CLOSED = 36;
  const WIDTH_OPEN = 200;

  let open = false;
  const widthOpen = tweened(WIDTH_CLOSED, { duration: 200, easing: cubicOut });
  const widthClosed = tweened(WIDTH_CLOSED, { duration: 80, easing: cubicIn });

  let timer: number | undefined;

  function toggleDrawer() {
    if (open = !open) {
      $widthOpen = WIDTH_OPEN;
      widthClosed.set(WIDTH_OPEN);
    } else {
      $widthClosed = WIDTH_CLOSED;
      widthOpen.set(WIDTH_CLOSED);
    }
	}

  function closeDrawer() {
    if (open) {
      toggleDrawer();
    }
  }

  function openDrawer() {
    if (!open) {
      toggleDrawer();
    }
  }

  onDestroy(() => {
    window.clearTimeout(timer);
  });
</script>

<nav
  use:clickOutside={closeDrawer}
  class="relative w-9 flex-none bg-neutral-700"
  on:pointerenter={() => timer = window.setTimeout(() => {
    timer = undefined;
    openDrawer();
  }, 1000)}
  on:pointerleave={() => {
    if (timer) {
      window.clearTimeout(timer);
      timer = undefined;
    } else {
      closeDrawer();
    }
  }}
>
  <div
    class="
      absolute
      inset-y-0
      left-0
      flex
      flex-col
      items-stretch
      overflow-hidden
      backdrop-blur
      z-drawer
    "
    style="width: {open ? $widthOpen : $widthClosed}px;"
  >
    <NavbarButton
      icon={arrowLeftIcon}
      disabled={routes.some(({ path }) => (
        $isActive(path, undefined, { recursive: false })
      ))}
      on:click={() => {
        history.back();
        closeDrawer();
      }}
    >
      Go back
    </NavbarButton>

    <div class="flex-grow" />

    {#each routes as { name, icon, path }}
      <NavbarButton
        {icon}
        selected={$isActive(path)}
        on:click={() => {
          $goto(path);
          closeDrawer();
        }}
      >
        {name}
      </NavbarButton>
    {/each}

    <NavbarButton
      icon={logoutIcon}
      on:click={async () => await window.scrapbookApi.quit()}
    >
      Exit
    </NavbarButton>
  </div>
</nav>
