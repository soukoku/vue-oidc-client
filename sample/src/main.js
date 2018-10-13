import 'babel-polyfill';
// import './lib/polyfill';
import Vue from 'vue';
import App from './App.vue';
import mainAuth from './auth';
import router from './router';

Vue.config.productionTip = false;

mainAuth.startup().then(() => {
  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app');
});
