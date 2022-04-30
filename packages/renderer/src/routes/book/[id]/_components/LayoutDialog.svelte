<script lang="ts">
  import closeIcon from '@iconify/icons-mdi/close';

  import LayoutPositionPicker from './LayoutPositionPicker.svelte';
  import Dialog from '/@/components/Dialog.svelte';
  import DialogContent from '/@/components/DialogContent.svelte';
  import DialogTitle from '/@/components/DialogTitle.svelte';
  import IconButton from '/@/components/IconButton.svelte';
  import Radio from '/@/components/Radio.svelte';
  import RadioGroup from '/@/components/RadioGroup.svelte';

  export let open: boolean;
  export let objectFit: ObjectFit;
  export let objectPosition: ObjectPosition;
  export let onClose: () => void;
  export let onLayoutChange: (layout: Layout) => void;
</script>

<Dialog {open} maxWidth="xs" fullWidth {onClose}>
  <DialogTitle>Adjust Page Layout</DialogTitle>

  <div class="absolute top-3 right-3">
    <IconButton icon={closeIcon} onClick={onClose} />
  </div>

  <DialogContent>
    <div class="flex my-6 px-2 py-12">
      <RadioGroup
        name="fit"
        bind:value={objectFit}
        onChange={() => onLayoutChange({
          fit: objectFit,
          position: objectPosition
        })}
      >
        <Radio value="none" label="None" />
        <Radio value="contain" label="Contain" />
        <Radio value="cover" label="Cover" />
        <Radio value="fill" label="Fill" />
        <Radio value="scale-down" label="Scale down" />
      </RadioGroup>

      <div class="flex flex-grow items-center justify-center">
        <LayoutPositionPicker
          fit={objectFit}
          bind:position={objectPosition}
          onChange={() => {
            onLayoutChange({
              fit: objectFit,
              position: objectPosition
            });
          }}
        />
      </div>
    </div>
  </DialogContent>
</Dialog>
