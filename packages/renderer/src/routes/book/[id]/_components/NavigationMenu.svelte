<script lang="ts">
  import backspaceIcon from '@iconify/icons-mdi/backspace';
  import sendIcon from '@iconify/icons-mdi/send';
  import IconifyIcon from '@iconify/svelte';

  import Button from '/@/components/Button.svelte';
  import Popover from '/@/components/Popover.svelte';
  import TextField from '/@/components/TextField.svelte';

  export let anchorElement: Element | null | undefined = undefined;
  export let open = false;
  export let bookmark: number;
  export let pages: number;
  export let onPageChange: (page: number) => void;
  export let onClose: () => void;

  let page = '';

  $: isValid = (digit: number) => Number(page + digit) <= pages;
</script>

<svelte:window
  on:keydown={event => {
    if (!open) {
      return;
    }

    switch (event.key) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        if (isValid(Number(event.key))) {
          page += event.key;
        }

        break;
      case '0':
      if (page.length > 0 && isValid(Number(event.key))) {
          page += event.key;
        }

        break;
      case 'Backspace':
        if (page.length > 0) {
          page = page.slice(0, -1);
        }

        break;
      case 'Enter':
        if (page.length > 0) {
          onPageChange(Number(page) - 1);
          page = '';
        }

        break;
      default:
        break;
    }
  }}
/>

<Popover
  {open}
  {anchorElement}
  anchorOrigin="bottom-start"
  {onClose}
>
  <div class="flex flex-col gap-2 p-4">
    <TextField
      name="page"
      value={page}
      placeholder={String(bookmark + 1)}
      maxWidth="fit-content"
      disabled
    />

    <div
      class="grid gap-2 items-stretch justify-items-stretch"
      style="grid-template-columns: repeat(3, 40px);"
    >
      {#each [7, 8, 9, 4, 5, 6, 1, 2, 3] as digit}
        <Button
          variant="outlined"
          disabled={!isValid(digit)}
          onClick={() => page += digit}
          minWidth="initial"
        >
          {digit}
        </Button>
      {/each}

      <Button
        variant="outlined"
        disabled={page.length === 0}
        onClick={() => page = page.slice(0, page.length - 1)}
        minWidth="initial"
      >
        <IconifyIcon icon={backspaceIcon} height={24} />
      </Button>

      <Button
        variant="outlined"
        disabled={page.length === 0 || !isValid(0)}
        onClick={() => page += '0'}
        minWidth="initial"
      >
        0
      </Button>

      <Button
        variant="outlined"
        disabled={page.length === 0}
        onClick={() => {
          onPageChange(Number(page) - 1);
          page = '';
        }}
        minWidth="initial"
      >
        <IconifyIcon icon={sendIcon} height={24} />
      </Button>
    </div>
  </div>
</Popover>
