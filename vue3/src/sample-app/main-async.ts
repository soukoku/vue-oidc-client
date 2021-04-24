import { createApp } from 'vue'
import App from './App.vue'
import { configureRouter } from './router-async'
import { configureOidc } from './idsrvAuth-async'

void (async function() {
  const idsrvAuth = await configureOidc()
  const router = await configureRouter()

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
