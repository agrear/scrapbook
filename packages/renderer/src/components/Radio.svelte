<script lang="ts">
  import { MDCFormField } from '@material/form-field';
  import { MDCRadio } from '@material/radio';
  import { getContext, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';

  import { key, type RadioGroupContext } from './_radioGroup';

  const radioGroup = getContext<Writable<RadioGroupContext>>(key);

  export let checked = false;
  export let density: 0 | -1 | -2 | -3 = 0;
  export let disabled = false;
  export let disableRipple = false;
  export let id: string | undefined = undefined;
  export let name: string | undefined = undefined;

  export let label: string | undefined = undefined;
  export let value: any | undefined = undefined;

  let formField: HTMLDivElement;
  let radio: HTMLDivElement;
  let mdcFormField: MDCFormField | null = null;
  let mdcRadio: MDCRadio | null = null;

  $: if (mdcRadio !== null) {
    mdcRadio.ripple.disabled = disableRipple;
  }

  $: if (mdcRadio !== null) {
    mdcRadio.checked = $radioGroup.group === value;
  }

  $: if (mdcRadio !== null) {
    mdcRadio.disabled = disabled;
  }

  $: if (mdcRadio !== null) {
    mdcRadio.value = value ?? '';
  }

  onMount(() => {
    mdcRadio = MDCRadio.attachTo(radio);
    mdcFormField = MDCFormField.attachTo(formField);
    mdcFormField.input = mdcRadio;

    return () => {
      mdcFormField?.destroy();
      mdcRadio?.destroy();

      mdcFormField = null;
      mdcRadio = null;
    };
  });
</script>

<div bind:this={formField} class="mdc-form-field">
  <div
    bind:this={radio}
    class="mdc-radio"
    class:mdc-radio--disabled={disabled}
    class:-density-1={density === -1}
    class:-density-2={density === -2}
    class:-density-3={density === -3}
  >
    <input
      class="mdc-radio__native-control"
      type="radio"
      id={id ?? value}
      name={$radioGroup.name}
      {disabled}
      bind:group={$radioGroup.group}
      {value}
      on:change={$radioGroup.onChange}
    />
    <div class="mdc-radio__background">
      <div class="mdc-radio__outer-circle" />
      <div class="mdc-radio__inner-circle" />
    </div>
    <div class="mdc-radio__ripple" />
    <div class="mdc-radio__focus-ring" />
  </div>
  <label for={id ?? value}>{label}</label>
</div>

<style lang="scss">
  @use "../theme";
  @use "@material/radio";
  @use "@material/ripple";

  .mdc-radio {
    --mdc-radio-selected-focus-state-layer-opacity: 0;

    @include ripple.states-opacities((
      "focus": 0,
      "hover": 0,
      "press": 0
    ));
  }

  .-density-1 {
    @include radio.density(-1);
  }

  .-density-2 {
    @include radio.density(-2);
  }

  .-density-3 {
    @include radio.density(-3);
  }
</style>
