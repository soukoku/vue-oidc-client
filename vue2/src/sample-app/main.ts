import Vue from 'vue'
import App from './App.vue'
import router from './router'
import idsrvAuth from './idsrvAuth'

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
