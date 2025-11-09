import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles/main.css'
import '@mdi/font/css/materialdesignicons.css'
import router from './router'
import { createPinia } from 'pinia'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#1976d2',
                    secondary: '#424242',
                    accent: '#82b1ff',
                    error: '#ff5252',
                    info: '#2196f3',
                    success: '#4caf50',
                    warning: '#fb8c00'
                }
            }
        }
    }
})
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(vuetify)
app.use(router)

app.mount('#app')