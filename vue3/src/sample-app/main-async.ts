import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { configureOidc } from './idsrvAuth-async'

void (async function() {
  const idsrvAuth = await configureOidc()

  idsrvAuth.startup().then(ok => {
    if (ok) {
      const app = createApp(App).use(router)
      // a little something extra
      app.config.globalProperties.$oidc = idsrvAuth
      app.mount('#app')
    } else {
      console.log('Startup was not ok')
    }
  })
})()
