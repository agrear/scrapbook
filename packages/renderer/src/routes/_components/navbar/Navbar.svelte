<script lang="ts">
  import { goto, isActive, activeRoute } from '@roxi/routify';

  import routes from './routes';
</script>

<nav>
  <button on:click={() => history.back()}>
    {'<-'}
  </button>

  <button on:click={() => history.forward()}>
    {'->'}
  </button>

  {#each routes as { name, path }}
    <button on:click={() => $goto(path)}>
      {name}
    </button>
  {/each}

  <button on:click={async () => await window.scrapbookApi.quit()}>
    Exit
  </button>
</nav>
