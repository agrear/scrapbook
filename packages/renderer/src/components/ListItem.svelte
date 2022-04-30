<li class="mdc-deprecated-list-item">
  <slot />

  {#if $$slots.secondaryAction}
    <span class="mdc-deprecated-list-item__meta">
      <slot name="secondaryAction" />
    </span>
  {/if}
</li>
