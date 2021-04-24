import Router from 'vue-router';
import { UserManagerSettings, Logger, User, Profile, UserManagerEvents } from 'oidc-client';
/**
 * Indicates the sign in behavior.
 */
export declare enum SignInType {
    /**
     * Uses the main browser window to do sign-in.
     */
    Window = 0,
    /**
     * Uses a popup window to do sign-in.
     */
    Popup = 1
}
/**
 * Logging level values used by createOidcAuth().
 */
export declare enum LogLevel {
    /**
     * No logs messages.
     */
    None = 0,
    /**
     * Only error messages.
     */
    Error = 1,
    /**
     * Error and warning messages.
     */
    Warn = 2,
    /**
     * Error, warning, and info messages.
     */
    Info = 3,
    /**
     * Everything.
     */
    Debug = 4
}
/**
 * A wrapper on oidc-client with vue support.
 */
export interface OidcAuth {
    /**
     * Original app url used to create this instance.
     */
    readonly appUrl: string;
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
    readonly userProfile: Profile;
    /**
     * Gets the auth events provided by oidc-client.
     */
    readonly events: UserManagerEvents;
    /**
     * Required call before all the properties are reliably initialized.
     * Should be called and waited on before starting the root Vue instance.
     */
    startup(): Promise<boolean>;
    /**
     * Hookup this auth instance with a vue-router instance.
     * This will guard routes with meta: { authName: `name of this auth` }
     * and register redirect callback routes.
     * @param router - the vue router instance.
     */
    useRouter(router: Router): void;
    /**
     * Starts the login flow explicitly.
     * @param args
     */
    signIn(args?: any): Promise<User | void>;
    /**
     * Starts the logout flow.
     * @param args
     */
    signOut(args?: any): Promise<void>;
    /**
     * Enables silent renew.
     */
    startSilentRenew(): void;
    /**
     * Disables silent renew.
     */
    stopSilentRenew(): void;
}
/**
 * Creates an openid-connect auth instance.
 * @param authName - short alpha-numeric name that identifies the auth instance for routing purposes.
 * This is used to generate default redirect urls (slugified) and identifying routes that needs auth.
 * @param defaultSignInType - the signin behavior when `signIn()` and `signOut()` are called.
 * @param appUrl - url to the app using this instance for routing purposes. Something like `https://domain/app/`.
 * @param oidcConfig - config object for oidc-client.
 * See https://github.com/IdentityModel/oidc-client-js/wiki#configuration for details.
 * @param logger - logger used by oidc-client. Defaults to console.
 * @param logLevel - minimum level to log. Defaults to LogLevel.Error.
 */
export declare function createOidcAuth(authName: string, defaultSignInType: SignInType, appUrl: string, oidcConfig: UserManagerSettings, logger?: Logger, logLevel?: LogLevel): OidcAuth;
