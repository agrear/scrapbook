<script lang="ts">
  type Alignment = 'center' | 'inherit' | 'justify' | 'left' | 'right';

  type Variant = 'body1' |
    'body2' |
    'button' |
    'caption' |
    'h1' |
    'h2' |
    'h3' |
    'h4' |
    'h5' |
    'h6' |
    'inherit' |
    'overline' |
    'subtitle1' |
    'subtitle2';

  const variantMapping = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    subtitle1: 'h6',
    subtitle2: 'h6',
    body1: 'p',
    body2: 'p',
    inherit: 'p',
    button: 'span',
    caption: 'span',
    overline: 'span'
  };

  export let align: Alignment = 'inherit';
  export let gutterBottom = false;
  export let noWrap = false;
  export let paragraph = false;
  export let variant: Variant = 'body1';

</script>

{#if variantMapping[variant] === 'h1' && !paragraph}
  <h1
    class:mdc-typography--headline1={true}
    class:overflow-hidden={noWrap}
    class:text-ellipsis={noWrap}
    class:whitespace-nowrap={noWrap}
    class:gutter-bottom={gutterBottom}
    class:paragraph
    style="text-align: {align};"
  >
    <slot />
  </h1>
{/if}

<style>
  .gutter-bottom {
    margin-bottom: 0.35em;
  }

  .paragraph {
    margin-bottom: 16px;
  }
</style>
