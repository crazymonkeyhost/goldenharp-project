import { defineConfig, loadEnv, type Plugin, type ResolvedConfig } from 'vite';
import path from 'path';
import checker from 'vite-plugin-checker';

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');


  return {
    publicDir:'public',

    build : {
      assetsDir:'lib',
    },

    esbuild: {
      target: "es2020"
    },

    plugins: [
      checker({
        typescript: true,
      }),
    ],
    resolve: {
      alias: {

        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});

