import sveltePreprocess from 'svelte-preprocess';

export default {
  preprocess: sveltePreprocess({
    postcss: {
      configFilePath: 'packages/renderer'
    },
    /*scss: {
      prependData: '@use "packages/renderer/src/theme";'
    }*/
  })
};
