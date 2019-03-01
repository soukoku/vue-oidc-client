import VueRouter from 'vue-router'
import { UserManagerSettings, Logger } from 'oidc-client'

type Dictionary<T> = { [key: string]: T }

/**
 * Indicates the sign in behavior.
 */
export enum SignInType {
  /**
   * Uses the main browser window to do sign-in.
   */
  Window,
  /**
   * Uses a popup window to do sign-in.
   */
  Popup,
  /**
   * Uses a hidden iframe to do sign-in.
   */
  Silent
}

/**
 * Logging level values used by createOidcAuth().
 */
export enum LogLevel {
  /**
   * No logs messages.
   */
  NONE = 0,
  /**
   * Only error messages.
   */
  ERROR = 1,
  /**
   * Error and warning messages.
   */
  WARN = 2,
  /**
   * Error, warning, and info messages.
   */
  INFO = 3,
  /**
   * Everything.
   */
  DEBUG = 4
}

/**
 * Creates an openid-connect auth instance.
 * @param authName - short name (no spaces) that identifies the auth instance for routing purposes.
 * @param defaultSignInType - the signin method to use when `signIn()` and `signOut()` are called.
 * @param appUrl - url to the app using this instance for routing purposes. Something like `https://domain/app/`.
 * @param oidcConfig - config object for oidc-client.
 * @param logger - logger used by oidc-client. Defaults to console.
 */
export function createOidcAuth(
  authName: string,
  defaultSignInType: SignInType,
  appUrl: string,
  oidcConfig: UserManagerSettings,
  logger?: Logger,
  logLevel?: LogLevel
): OidcAuth

/**
 * A wrapper on oidc-client with vue support.
 */
export interface OidcAuth {
  /**
   * Original app url used to create this instance.
   */
  readonly appUrl: string
  /**
   * Name of this oidc authentication instance.
   * Use in a route's meta:{authName} property to protect that route.
   */
  readonly authName: string
  /**
   * Gets whether the user is authenticated.
   */
  readonly isAuthenticated: boolean
  /**
   * Gets the API access token if applicable.
   */
  readonly accessToken: string
  /**
   * Gets the user claims if authenticated.
   */
  readonly userProfile: Dictionary<any>
  /**
   * Required call before all the properties are reliably initialized.
   * Should be called and waited on before starting the root Vue instance.
   */
  startup(): Promise<any>
  /**
   * Hookup this auth instance with a vue-router instance.
   * This will guard routes with meta: { authName: `name of this auth` }
   * and register redirect callback routes.
   * @param router - the vue router instance.
   */
  useRouter(router: VueRouter): void
  /**
   * Starts the login flow explicitly.
   * @param args
   */
  signIn(args?: any): Promise<any>
  /**
   * Starts the logout flow.
   * @param args
   */
  signOut(args?: any): Promise<any>
}
