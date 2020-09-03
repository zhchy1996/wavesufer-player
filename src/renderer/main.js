import Vue from 'vue'
import axios from 'axios'
import {
    Button,
    Input,
    InputNumber,
    Drawer,
    Spin,
    Icon,
    Slider,
    Col,
    Row
} from 'ant-design-vue';

import App from './App'
import router from './router'
import store from './store'

import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'
import vueElectron from 'vue-electron';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

const plugins = [
    Button,
    Input,
    InputNumber,
    Drawer,
    Spin,
    Icon,
    Slider,
    Col,
    Row
];

plugins.forEach(plugin => Vue.use(plugin));

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
