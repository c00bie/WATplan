import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

const getCache = ({ name, pattern }: any) => ({
  urlPattern: pattern,
  handler: "CacheFirst" as const,
  options: {
    cacheName: name,
    expiration: {
      maxEntries: 500,
      maxAgeSeconds: 60
    },
    cacheableResponse: {
      statuses: [200]
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({ 
      registerType: 'autoUpdate',
      manifest: {
        name: 'WAT Plan',
        short_name: 'WATPlan',
        lang: 'pl',
        theme_color: '#2a937c',
        description: 'Plan zajęć dla Wydziału Cybernetyki WAT',
        icons: [
          {
            src: 'icons/watplan-icon-192px.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/watplan-icon-512px.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        scope: '/'
      },
      workbox: {
        cleanupOutdatedCaches: false,
        runtimeCaching: [
          getCache({
            name: "data",
            pattern: /^https:\/\/watplan\.coobie\.dev\/.*\.json$/
          })
        ]
      }
    }),
    AutoImport({
      imports: [
        'vue',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar'
          ]
        }
      ]
    }),
    Components({
      resolvers: [NaiveUiResolver()]
    })
  ]
})
