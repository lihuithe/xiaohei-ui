import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { i18n } from './locales'
import { performanceMonitor } from './performance'

const app = createApp(App)

performanceMonitor.start()

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
