<script lang="ts">
  import Badge from './Badge.svelte';

  export let src: string | undefined = undefined;
  export let caption: string | undefined = undefined;
  export let badgeContent: any = undefined;
  export let onCaptionClick: ((event: MouseEvent) => void) | undefined = undefined;
</script>

{#if src === undefined}
  Loading
{:else}
  <div class="flex flex-col items-center h-full w-full pointer-events-none">
    <Badge content={badgeContent}>
      <img
        {src}
        alt=""
        draggable={false}
        class="flex-1 min-w-0 min-h-0 pointer-events-auto"
        style="max-height: -webkit-fill-available;"
      />
    </Badge>

    {#if caption}
      <span
        class="
          flex-shrink-0
          max-w-full
          text-opacity-70
          hover:text-opacity-100
          overflow-hidden
          text-ellipsis
          whitespace-nowrap
          pointer-events-auto
          mdc-typography--headline6
        "
        class:cursor-pointer={onCaptionClick !== undefined}
        on:click={onCaptionClick}
        on:pointerdown|stopPropagation={() => {}}
        on:pointerup|stopPropagation={() => {}}
      >
        {caption}
      </span>
    {/if}
  </div>
{/if}
