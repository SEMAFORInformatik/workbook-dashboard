import { defineConfig, splitVendorChunkPlugin } from "vite";
import vue from '@vitejs/plugin-vue2'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), splitVendorChunkPlugin()],
  server: {
    proxy: {
      '/workbook': {
        target: 'http://localhost:8080/',
      }
    }
  },
  base: './'
});
