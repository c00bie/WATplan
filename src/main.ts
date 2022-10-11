import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import { createPinia } from 'pinia'
import { setDefaultOptions } from 'date-fns'
import plPL from 'date-fns/locale/pl'

setDefaultOptions({ locale: plPL, weekStartsOn: 1 })

createApp(App).use(createPinia()).mount('#app')
