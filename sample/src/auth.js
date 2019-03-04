import Vue from 'vue'
import {
  createOidcAuth,
  SignInType,
  LogLevel
} from 'vue-oidc-client/src/VueOidcAuth'

const loco = window.location
const appRootUrl = `${loco.protocol}//${loco.host}${process.env.BASE_URL}`

var mainOidc = createOidcAuth(
  'main',
  SignInType.Window,
  appRootUrl,
  {
    authority: 'https://demo.identityserver.io/',
    client_id: 'implicit.shortlived', // 'implicit.shortlived',
    response_type: 'id_token token',
    scope: 'openid profile email api',
    // test use
    prompt: 'login',
    login_hint: 'bob'
  },
  console,
  LogLevel.DEBUG
)
Vue.prototype.$oidc = mainOidc
export default mainOidc
