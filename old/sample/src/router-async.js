import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import { configureOidc } from './auth-async';

export async function configureRouter(){
  const mainAuth = await configureOidc()
  Vue.use(Router);

  const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home
      },
      {
        path: '/about',
        name: 'about',
        meta: {
          authName: mainAuth.authName
        },
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "about" */ './views/About.vue')
      }
    ]
  });

  mainAuth.useRouter(router);
  return router;
}
