<script lang="ts">
  export let leading = false;
  export let padding = false;
  export let trailing = false;
</script>

<li
  role="separator"
  class="mdc-deprecated-list-divider"
  class:mdc-deprecated-list-divider--inset-leading={leading}
  class:mdc-deprecated-list-divider--inset-trailing={trailing}
  class:mdc-deprecated-list-divider--inset-padding={padding}
/>
