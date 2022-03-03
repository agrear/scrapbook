<script context="module" lang="ts">
  const load: RoutifyLoad = async () => {
    return {
      props: {
        books: ['Moby Dick']
      }
    };
  };

  export { load };
</script>

<script lang="ts">
  export let books: string[];
</script>

Books:
<div>
  {#each books as book}
    <div>{book}</div>
  {/each}
</div>
