import rollupYaml from '@rollup/plugin-yaml'
import adapter from '@sveltejs/adapter-static'
import path from 'path'
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: preprocess(),

  kit: {
    adapter: adapter(),

    prerender: { default: true },

    vite: {
      plugins: [rollupYaml()],

      ssr: {
        external: [`algoliasearch`],
      },

      build: {
        rollupOptions: {
          output: { manualChunks: undefined },
        },
      },

      resolve: {
        alias: {
          $src: path.resolve(`./src`),
        },
      },
    },

    trailingSlash: `ignore`, // GitHub issue discussing Netlify: https://git.io/JngRL
  },
}
