import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/toolkit/v1/' : '/',
  plugins: [vue()],
  server: {
    proxy: {
      '/soj': {
        changeOrigin: true,
        rewrite: (path)=>path.replace(/^\/soj/, ''),
        target: 'https://soj.csgrandeur.cn/'
      }
    }
  }
})
