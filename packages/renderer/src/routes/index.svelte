<script context="module" lang="ts">
  const load: RoutifyLoad = () => {
    history.replaceState(undefined, '', '/book/index');

    return {
      redirect: '/book/index'
    }
  };

  export { load };
</script>
