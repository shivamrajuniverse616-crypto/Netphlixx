import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Netphlix Streaming',
        short_name: 'Netphlix',
        description: 'Ultimate Netflix-style streaming application',
        theme_color: '#141414',
        background_color: '#141414',
        display: 'standalone',
        icons: [
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
