import Vue from 'vue'
import App from './App.vue'
import { configureRouter } from './router-async'
import { configureOidc } from './idsrvAuth-async'

void (async function() {
  const idsrvAuth = await configureOidc()
  const router = await configureRouter()
  Vue.config.productionTip = false

  idsrvAuth.startup().then(ok => {
    if (ok) {
      new Vue({
        router,
        render: h => h(App)
      }).$mount('#app')
    } else {
      console.log('Startup was not ok')
    }
  })
})()
