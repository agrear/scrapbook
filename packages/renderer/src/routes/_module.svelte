<script lang="ts">
  import Navbar from './_components/navbar/Navbar.svelte';
  //import Transition from './_components/navbar/Transition.svelte';
</script>

<div class="relative flex h-full bg-neutral-800">
  <Navbar />

  <div class="relative flex-grow overflow-hidden">
    <!--<slot decorator={Transition} />-->
    <slot />
  </div>
</div>

<style>
  :global(.transition) {
    overflow: hidden;
  }
</style>
