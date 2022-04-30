<script lang="ts">
  import { MDCFormField, type MDCFormFieldInput } from '@material/form-field';
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';

  import { key, type FormFieldContext } from './_formField';

  export let label: string | undefined = undefined;

  const context = writable<FormFieldContext>();

  let formField: HTMLDivElement;
  let mdcFormField: MDCFormField | null = null;

  $: if (mdcFormField !== null) {
    mdcFormField.input = $context.input;
  }

  setContext(key, context);

  onMount(() => {
    mdcFormField = new MDCFormField(formField);

    return () => {
      mdcFormField?.destroy();
    };
  });
</script>

<div bind:this={formField} class="mdc-form-field">
  <slot />
  <label for={$context.id}>{label}</label>
</div>
