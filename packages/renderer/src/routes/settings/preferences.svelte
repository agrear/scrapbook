<script lang="ts" context="module">
  const layoutFits: { value: ObjectFit, name: string }[] = [
    { value: 'contain', name: 'Contain' },
    { value: 'cover', name: 'Cover' },
    { value: 'fill', name: 'Fill' },
    { value: 'none', name: 'None' },
    { value: 'scale-down', name: 'Scale down' }
  ];

  const layoutPositions: { value: ObjectPosition, name: string }[] = [
    { value: 'left top', name: 'Top left' },
    { value: 'center top', name: 'Top' },
    { value: 'right top', name: 'Top right' },
    { value: 'left center', name: 'Center left' },
    { value: 'center center', name: 'Center' },
    { value: 'right center', name: 'Center right' },
    { value: 'left bottom', name: 'Bottom left' },
    { value: 'center bottom', name: 'Bottom' },
    { value: 'right bottom', name: 'Bottom right' }
  ];

  const load: RoutifyLoad = async ({ route }) => {
    const preferences = await window.scrapbookApi.getPreferences();

    return {
      props: {
        brightness: preferences.brightness * 100,
        layoutFit: layoutFits.find(({ value }) => (
          value === preferences.layout.fit
        )),
        layoutPosition: layoutPositions.find(({ value }) => (
          value === preferences.layout.position
        )),
        zoom: preferences.zoom * 100
      }
    };
  };

  export { load };
</script>

<script lang="ts">
  import Select from '/@/components/Select.svelte';
  import Slider from '/@/components/Slider.svelte';

  export let brightness: number;
  export let layoutFit: typeof layoutFits[0];
  export let layoutPosition: typeof layoutPositions[0];
  export let zoom: number;

  async function onPreferencesChange(preferences: Partial<Preferences>) {
    await window.scrapbookApi.setPreferences(preferences);
  }
</script>

<div class="mdc-typography--headline6">New book presets</div>
<hr class="mb-4" />
<div class="grid grid-cols-2 auto-rows-fr items-center justify-between gap-4">
  <span class="mdc-typography--body2">Brightness</span>
  <Slider
    name="brightness"
    bind:value={brightness}
    step={5}
    min={25}
    max={125}
    onChange={() => onPreferencesChange({
      brightness: Math.min(Math.max(0.25, brightness / 100), 1.25)
    })}
  />

  <span>Layout fit</span>
  <Select
    options={layoutFits}
    bind:value={layoutFit}
    getOptionLabel={option => option.name}
    isOptionEqualToValue={(option, value) => option.value === value.value}
    onChange={async () => await window.scrapbookApi.setPreferences({
      layout: { fit: layoutFit.value, position: layoutPosition.value }
    })}
  />

  <span>Layout position</span>
  <Select
    options={layoutPositions}
    bind:value={layoutPosition}
    getOptionLabel={option => option.name}
    isOptionEqualToValue={(option, value) => option.value === value.value}
    onChange={async () => await window.scrapbookApi.setPreferences({
      layout: { fit: layoutFit.value, position: layoutPosition.value }
    })}
  />

  <span>Zoom</span>
  <Slider
    name="zoom"
    bind:value={zoom}
    step={5}
    min={50}
    max={200}
    onChange={() => onPreferencesChange({
      zoom: Math.min(Math.max(0.5, zoom / 100), 2.0)
    })}
  />
</div>
