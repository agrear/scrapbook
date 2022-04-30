<script lang="ts">
  import { activeRoute, goto, isActive, url } from '@roxi/routify';

  import Tab from '/@/components/Tab.svelte';
  import Tabs from '/@/components/Tabs.svelte';

  const tabs = [
    { label: 'General', path: './index' },
    { label: 'Preferences', path: './preferences' }
  ];
</script>

<Tabs
  selected={tabs.findIndex(({ path }) => (
    $isActive($url(path).slice(1), undefined, { recursive: false })
  ))}
>
  {#each tabs as tab (tab.path)}
    <Tab label={tab.label} href={$url(tab.path)} />
  {/each}
</Tabs>

<div class="flex justify-center mt-8 h-full px-4">
  <div class="max-w-screen-sm flex-grow select-none">
    <slot />
  </div>
</div>
