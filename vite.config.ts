import { defineConfig, splitVendorChunkPlugin } from "vite";
import vue from '@vitejs/plugin-vue2'


// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    supported: {
      'top-level-await': true //browsers can handle top-level-await features
    },
  },

  plugins: [vue(), splitVendorChunkPlugin()],
  server: {
    proxy: {
      '/workbook': {
        target: 'http://localhost:8080/',
      },
      '/properties': {
        target: 'http://localhost:8080/workbook',
      }
    }
  },
  base: './'
});
