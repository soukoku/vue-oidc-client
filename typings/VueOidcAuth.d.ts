import VueRouter from 'vue-router';
import { UserManagerSettings, Logger } from 'oidc-client';

type Dictionary<T> = { [key: string]: T };

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
 * Creates an openid-connect auth instance.
 * @param defaultSignInType - the signin method to use when signIn()/signOut() are called.
 * @param oidcConfig - config object for oidc-client.
 * @param logger - logger used by oidc-client. Defaults to console.
 */
export function createOidcAuth(
  defaultSignInType: SignInType,
  oidcConfig: UserManagerSettings,
  logger?: Logger
): OidcAuth;

/**
 * A wrapper on oidc-client with vue support.
 */
export interface OidcAuth {
  /**
   * Name of this oidc authentication instance.
   * Use in a route's meta:{authName} property to protect that route.
   */
  readonly authName: string;
  /**
   * Gets whether the user is authenticated.
   */
  readonly isAuthenticated: boolean;
  /**
   * Gets the API access token if applicable.
   */
  readonly accessToken: string;
  /**
   * Gets the user claims if authenticated.
   */
  readonly userProfile: Dictionary<any>;
  /**
   * Required call before all the properties are reliably initialized.
   * Should be called and waited on before starting the root Vue instance.
   */
  startup(): Promise<any>;
  /**
   * Hookup this auth instance with a vue-router instance.
   * This will guard routes with meta: { authName: `name of this auth` }
   * and register redirect callback routes.
   * @param router - the vue router instance.
   */
  useRouter(router: VueRouter): void;
  /**
   * Starts the login flow explicitly.
   * @param args
   */
  signIn(args?: any): Promise<any>;
  /**
   * Starts the logout flow.
   * @param router - a vue router instance.
   * @param args
   */
  signOut(router: VueRouter, args?: any): Promise<any>;
}
