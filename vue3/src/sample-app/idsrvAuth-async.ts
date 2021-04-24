import { User } from 'oidc-client'
import {
  createOidcAuth,
  SignInType,
  LogLevel,
  OidcAuth
} from '../vue-oidc-client'

const loco = window.location
const appRootUrl = `${loco.protocol}//${loco.host}${process.env.BASE_URL}`

let authObj = null as OidcAuth | null

export async function configureOidc() {
  if (authObj) return Promise.resolve(authObj)

  const configFetch = await fetch('/idsrv-config.json')
  const config = await configFetch.json()

  authObj = createOidcAuth(
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
  authObj.events.addAccessTokenExpiring(function() {
    // eslint-disable-next-line no-console
    console.log('access token expiring')
  })

  authObj.events.addAccessTokenExpired(function() {
    // eslint-disable-next-line no-console
    console.log('access token expired')
  })

  authObj.events.addSilentRenewError(function(err: Error) {
    // eslint-disable-next-line no-console
    console.error('silent renew error', err)
  })

  authObj.events.addUserLoaded(function(user: User) {
    // eslint-disable-next-line no-console
    console.log('user loaded', user)
  })

  authObj.events.addUserUnloaded(function() {
    // eslint-disable-next-line no-console
    console.log('user unloaded')
  })

  authObj.events.addUserSignedOut(function() {
    // eslint-disable-next-line no-console
    console.log('user signed out')
  })

  authObj.events.addUserSessionChanged(function() {
    // eslint-disable-next-line no-console
    console.log('user session changed')
  })

  return authObj
}
