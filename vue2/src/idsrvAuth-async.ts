import { User } from 'oidc-client'
import Vue from 'vue'
import { createOidcAuth, SignInType, LogLevel } from './lib/oidc-auth'

const loco = window.location
const appRootUrl = `${loco.protocol}//${loco.host}${process.env.BASE_URL}`

export async function configureOidc() {
  const configFetch = await fetch('/idsrv-config.json')
  const config = await configFetch.json()

  const idsrvAuth = createOidcAuth(
    'main',
    SignInType.Popup,
    appRootUrl,
    {
      ...config,
      // test use
      prompt: 'login'
    },
    console,
    LogLevel.Debug
  )

  // handle events

  idsrvAuth.$on('accessTokenExpiring', function() {
    // eslint-disable-next-line no-console
    console.log('access token expiring')
  })

  idsrvAuth.$on('accessTokenExpired', function() {
    // eslint-disable-next-line no-console
    console.log('access token expired')
  })

  idsrvAuth.$on('silentRenewError', function(err: Error) {
    // eslint-disable-next-line no-console
    console.error('silent renew error', err)
  })

  idsrvAuth.$on('userLoaded', function(user: User) {
    // eslint-disable-next-line no-console
    console.log('user loaded', user)
  })

  idsrvAuth.$on('userUnloaded', function() {
    // eslint-disable-next-line no-console
    console.log('user unloaded')
  })

  idsrvAuth.$on('userSignedOut', function() {
    // eslint-disable-next-line no-console
    console.log('user signed out')
  })

  idsrvAuth.$on('userSessionChanged', function() {
    // eslint-disable-next-line no-console
    console.log('user session changed')
  })

  // a little something extra
  Vue.prototype.$oidc = idsrvAuth

  return idsrvAuth
}
