import './assets/application.css'

import { createApp } from 'vue'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import App from '@/App.vue'
import 'element-plus/theme-chalk/src/message.scss'
import 'element-plus/theme-chalk/src/message-box.scss'
import 'element-plus/theme-chalk/el-loading.css'
import router from '@/router'

import 'moment/dist/locale/zh-cn'
import '@/helpers/axios'

import store from './store'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VueQrcode from '@chenfengyuan/vue-qrcode'

import '@/helpers/fontawesome'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

const app = createApp(App).use(router).use(store)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.component('font-awesome-icon', FontAwesomeIcon)
app.component(VueQrcode.name, VueQrcode)
app.mount('#app')
