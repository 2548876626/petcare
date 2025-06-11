import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    basicSsl()  // <-- 看，我们的SSL酱油在这里
  ],
  resolve: {
    alias: {
      '@': '/src' // 这个别名设定很有用，我们保留它
    }
  },
  server: {
    // 这段是为了让手机能访问
    host: true
  }
})