<script lang="ts">
</script>

<span class="mdc-deprecated-list-item__text">
  {#if !$$slots.default}
    <slot />
  {/if}

  {#if $$slots.primary}
    <span class="mdc-deprecated-list-item__primary-text">
      <slot name="primary" />
    </span>
  {/if}

  {#if $$slots.secondary}
    <span class="mdc-deprecated-list-item__secondary-text">
      <slot name="secondary" />
    </span>
  {/if}
</span>
