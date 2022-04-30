<script lang="ts">
  import Dialog from '/@/components/Dialog.svelte';

  export let open: boolean;
</script>

<Dialog {open} maxWidth="xs" fullWidth on:close>
  <div class="flex flex-col gap-6">
    <h4 class="mb-2 mdc-typography--headline4">
      Search Help
    </h4>

    <div>
      Use Ctrl + Space to bring up a list of suggestions.
    </div>

    <div class="flex flex-col gap-2">
      <h5 class="mdc-typography--headline5">
        Simple Mode
      </h5>
      <p class="mdc-typography--body">
        Search terms are separated by comma.
        Search terms can be prefixed with '!' for exclusion.
      </p>
      <p>
        <code class="bg-neutral-800" style="font-family: monospace;">
          Drama, !Fiction
        </code>
        => Search for books tagged <em>Drama</em> but not <em>Fiction</em>
      </p>
    </div>
  </div>
</Dialog>
