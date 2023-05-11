import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { prismjsPlugin } from 'vite-plugin-prismjs'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? (process.env.AQUA_BASE ?? '/') : '/',
  plugins: [
    vue(),
    prismjsPlugin({
      languages: ['ts'],
      theme: 'tomorrow.min',
      css: true
    })
  ],
  server: {
    port: 65000,
    proxy: {
      '/soj': {
        changeOrigin: true,
        rewrite: (path)=>path.replace(/^\/soj/, ''),
        target: 'https://soj.csgrandeur.cn/'
      }
    }
  }
})
