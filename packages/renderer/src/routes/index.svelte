<script context="module" lang="ts">
  const load: RoutifyLoad = async context => {
    const { bookId } = await window.scrapbookApi.getHistory();

    if (bookId !== null) {
      await context.route.router.url.push('#/book/index');
    }

    return {
      redirect: bookId ? `#/book/${bookId}` : '#/book/index'
    };
  };

  export { load };
</script>
