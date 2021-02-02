import Vue from 'vue'
import { createOidcAuth, SignInType, LogLevel } from 'vue-oidc-client'

const loco = window.location
const appRootUrl = `${loco.protocol}//${loco.host}${process.env.BASE_URL}`

export async function configureOidc() {
  const runtimeConfig = await fetch('/oidc.json')
  const config = await runtimeConfig.json()

  const clientSetting = {
    authority: config.authority,
    client_id: config.clientId,
    response_type: config.responseType,
    scope: config.scope,
  }

  const mainOidc = createOidcAuth(
    'main',
    SignInType.Popup,
    appRootUrl,
    clientSetting,
    console,
    LogLevel.Debug
  )
 
  Vue.prototype.$oidc = mainOidc
  return mainOidc
}
