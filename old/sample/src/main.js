// import 'babel-polyfill';
import 'vue-oidc-client/src/polyfill';
import Vue from 'vue';
import App from './App.vue';
import { configureRouter } from './router-async';
import { configureOidc } from './auth-async';

void (async function() {
  const mainAuth = await configureOidc();
  const router = await configureRouter();
  Vue.config.productionTip = false;

  mainAuth.$on('accessTokenExpiring', function() {
    // eslint-disable-next-line no-console
    console.log('access token expiring');
  });
  
  mainAuth.$on('accessTokenExpired', function() {
    // eslint-disable-next-line no-console
    console.log('access token expired');
  });
  
  mainAuth.$on('silentRenewError', function(err) {
    // eslint-disable-next-line no-console
    console.error('silent renew error', err);
  });
  
  mainAuth.$on('userLoaded', function(user) {
    // eslint-disable-next-line no-console
    console.log('user loaded', user);
  });
  
  mainAuth.$on('userUnloaded', function() {
    // eslint-disable-next-line no-console
    console.log('user unloaded');
  });
  
  mainAuth.$on('userSignedOut', function() {
    // eslint-disable-next-line no-console
    console.log('user signed out');
  });
  
  mainAuth.$on('userSessionChanged', function() {
    // eslint-disable-next-line no-console
    console.log('user session changed');
  });

  mainAuth.startup().then(ok => {
    if (ok) {
      new Vue({
        router,
        render: h => h(App)
      }).$mount('#app');
    }
  });

})()
