<script lang="ts">
  import { MDCCheckbox } from '@material/checkbox';
  import { getContext, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';

  import { key, type FormFieldContext } from './_formField';

  export let checked = false;
  export let density: 0 | -1 | -2 | -3 = 0;
  export let disabled = false;
  export let id: string | undefined = undefined;
  export let indeterminate = false;
  export let name: string | undefined = undefined;
  export let onChange: (() => void) | undefined = undefined;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let tabIndex: number | undefined = undefined;

  const context = getContext<Writable<FormFieldContext>>(key);

  let checkbox: HTMLDivElement;
  let mdcCheckbox: MDCCheckbox | null = null;

  function getSize() {
    switch (size) {
      case 'small':
        return '20px';
      case 'small':
        return '40px';
      case 'small':
        return '56px';
      default:
        return '';
    }
  }

  $: if (mdcCheckbox !== null) {
    mdcCheckbox.disabled = disabled;
  }

  $: if (mdcCheckbox !== null) {
    mdcCheckbox.indeterminate = indeterminate;
  }

  $: if (mdcCheckbox !== null) {
    mdcCheckbox.value = String(checked);
  }

  $: if ($context) {
    $context.id = id
  };

  onMount(() => {
    mdcCheckbox = new MDCCheckbox(checkbox);
    if ($context) {
      $context.input = mdcCheckbox;
    }

    return () => {
      mdcCheckbox?.destroy();
    };
  });
</script>

<div
  bind:this={checkbox}
  class="mdc-checkbox"
  class:-density-1={density === -1}
  class:-density-2={density === -2}
  class:-density-3={density === -3}
>
  <input
    type="checkbox"
    {id}
    {name}
    {disabled}
    tabindex={tabIndex}
    bind:checked={checked}
    on:change={onChange}
    class="mdc-checkbox__native-control"
  />
  <div class="mdc-checkbox__background">
    <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
      <path
        class="mdc-checkbox__checkmark-path"
        fill="none"
        d="M1.73,12.91 8.1,19.28 22.79,4.59"
      />
    </svg>
    <div class="mdc-checkbox__mixedmark" />
  </div>
  <div class="mdc-checkbox__ripple"/>
</div>

<style lang="scss">
  @use "../theme";
  @use "@material/checkbox";
  @use "@material/ripple";

  .mdc-checkbox {
    @include checkbox.container-colors(white, white, white, white, true);
    //@include ripple.surface;
    //@include ripple.radius-bounded(24px);
    //@include ripple.states-base-color(gold);
    //@include ripple.states-opacities((hover: 1.1, focus: .3, press: .4));
  }

  .mdc-checkbox__ripple {
    @include ripple.radius-unbounded(24px);
    @include ripple.states-base-color(white);
    @include ripple.states-opacities((hover: 1.8, focus: 0, press: .4));

    &--activated {
      @include ripple.states-base-color(white);
      @include ripple.states-opacities((hover: 1.8, focus: 0, press: .4));
    }

    &--selected {
      @include ripple.states-base-color(white);
      @include ripple.states-opacities((hover: 1.8, focus: 0, press: .4));
    }
  }

  .-density-1 {
    @include checkbox.ripple-size(40px);
    @include checkbox.density(-1);
  }

  .-density-2 {
    //@include checkbox.ripple-size(36px);
    @include checkbox.density(-2);
  }

  .-density-3 {
    @include checkbox.density(-3);
    @include checkbox.ripple-size(32px);
  }
</style>
