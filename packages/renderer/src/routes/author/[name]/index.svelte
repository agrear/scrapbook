<script context="module" lang="ts">
  const load: RoutifyLoad = async ({ route }) => {
    const { name } = route.params;
    
    return {
      props: {
        name
      }
    };
  };

  export { load };
</script>

<script lang="ts">
  export let name: string;
</script>

<div>
  {name}
</div>
