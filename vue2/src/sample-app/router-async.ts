import Vue from 'vue'
import Router, { RouteConfig } from 'vue-router'
import Home from './views/Home.vue'
import { configureOidc } from './idsrvAuth-async'

let routerObj = null as Router | null

export async function configureRouter() {
  if (routerObj) return Promise.resolve(routerObj)

  const idsrvAuth = await configureOidc()
  Vue.use(Router)

  const routes: Array<RouteConfig> = [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/about',
      name: 'About',
      meta: {
        authName: idsrvAuth.authName
      },
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ './views/About.vue')
    }
  ]

  routerObj = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
  })

  idsrvAuth.useRouter(routerObj)

  return routerObj
}
