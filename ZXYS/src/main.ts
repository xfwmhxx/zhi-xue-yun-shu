import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { I18nProvider } from '@/utils/AIYS/common/i18nContext'

const app = createApp(App)
app.use(ElementPlus)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.component('I18nProvider', I18nProvider)

app.mount('#app')
