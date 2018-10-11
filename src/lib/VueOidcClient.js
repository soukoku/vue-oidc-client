import Vue from 'vue';
import { UserManager, Log, WebStorageStateStore } from 'oidc-client';

export const SignInType = {
  Window: 0,
  Popup: 1,
  Silent: 2,
  0: 'Window',
  1: 'Popup',
  2: 'Silent'
};

export function createOidcAuth(
  defaultSignInType,
  baseUrl,
  oidcConfig,
  logger = console
) {
  if (
    defaultSignInType !== SignInType.Window &&
    defaultSignInType !== SignInType.Popup
  ) {
    throw new Error('Only window or popup are valid default signin types.');
  }
  if (!oidcConfig) {
    throw new Error('No config provided to oidc auth.');
  }

  Log.logger = logger;
  Log.level = Log.DEBUG;
  const providerId = oidcConfig.client_id;
  // merge overrides with defaults
  const config = {
    response_type: `id_token`,
    scope: `openid profile`,
    filterProtocolClaims: true,
    loadUserInfo: true,
    // popupWindowTarget: providerId,
    automaticSilentRenew: true,
    monitorSession: true, // iframeNavigator?: any;
    userStore: new WebStorageStateStore({
      store: localStorage
    }),
    ...oidcConfig, // fixed paths
    redirect_uri: `${baseUrl}auth/${providerId}/signinwin`,
    post_logout_redirect_uri: `http://localhost:8080`,
    popup_post_logout_redirect_uri: `${baseUrl}auth/${providerId}/signout`,
    popup_redirect_uri: `${baseUrl}auth/${providerId}/signinpop`,
    silent_redirect_uri: `${baseUrl}auth/${providerId}/signinsilent`
  };
  // popupWindowFeatures?: string;
  // silentRequestTimeout?: any;

  Log.debug(`Creating new oidc auth for ${providerId}`);
  //   Log.debug(JSON.stringify(config));

  const mgr = new UserManager(config);

  ///////////////////////////////
  // events
  ///////////////////////////////
  mgr.events.addAccessTokenExpiring(() => {
    Log.debug(`${providerId} token expiring`);
  });

  mgr.events.addAccessTokenExpired(() => {
    Log.debug(`${providerId} token expired`);
    // TODO: try silent before full sign out?
    auth.signOut();
  });

  mgr.events.addSilentRenewError(e => {
    Log.error(`${providerId} silent renew error`, e.message);
    // TODO: need to restart renew manually?
    if (auth.isAuthenticated) {
      setTimeout(() => {
        mgr.signinSilent();
      }, 5000);
    }
  });

  mgr.events.addUserLoaded(user => {
    auth.user = user;
  });

  mgr.events.addUserUnloaded(() => {
    auth.user = null;
  });

  mgr.events.addUserSignedOut(() => {
    auth.user = null;
  });

  //   handleSignIn() {
  //     if (window.location.href.match(/silent/i)) {
  //       handleSignInCalback(SignInType.Silent);
  //     } else if (window.location.href.match(/popup/i)) {
  //       handleSignInCalback(SignInType.Popup);
  //     } else {
  //       handleSignInCalback(SignInType.Window).then(data => {
  //         // need to manually redirect for window type
  //         // goto original secure route or root
  //         let redirect = data.state ? data.state.to : null;
  //         if (redirect && redirect.fullPath) {
  //           redirect = redirect.fullPath;
  //         } else {
  //           redirect = '/';
  //         }
  //         window.location.replace(redirect);
  //       });
  //     }
  //   },

  function signIn(type, args) {
    switch (type) {
      case SignInType.Popup:
        return mgr.signinPopup(args);
      case SignInType.Silent:
        return mgr.signinSilent(args);
    }
    return mgr.signinRedirect(args);
  }
  function handleSignInCalback(type, url) {
    switch (type) {
      case SignInType.Popup:
        return mgr.signinPopupCallback(url);
      case SignInType.Silent:
        return mgr.signinSilentCallback(url);
    }
    return mgr.signinRedirectCallback(url);
  }

  function createSignInCallbackComponent(router, type) {
    return {
      render: h => h('div'),
      created() {
        handleSignInCalback(type)
          .then(data => {
            Log.debug(
              `${providerId} ${SignInType[type]} signin callback success`,
              data
            );
            // need to manually redirect for window type
            if (type === SignInType.Window) {
              // goto original secure route or root
              const redirect = data.state ? data.state.to : null;
              router.replace(redirect || '/');
            }
          })
          .catch(err => {
            Log.error(
              `${providerId} ${SignInType[type]} signin callback error`,
              err
            );
            if (type === SignInType.Window) {
              router.replace('/');
            }
          });
      }
    };
  }

  let _inited = false;
  const auth = new Vue({
    data() {
      return { user: null };
    },
    computed: {
      name() {
        return providerId;
      },
      isAuthenticated() {
        return !!this.user && !this.user.expired;
      },
      accessToken() {
        return !!this.user && !this.user.expired
          ? this.user.access_token
          : null;
      },
      userProfile() {
        return !!this.user && !this.user.expired ? this.user.profile : {};
      }
    },
    methods: {
      install() {
        Vue.prototype.$oidc = this;
      },
      startup() {
        if (_inited) {
          return Promise.resolve();
        } else {
          // load user from storage
          return mgr
            .getUser()
            .then(test => {
              _inited = true;
              if (test && !test.expired) {
                this.user = test;
              } else {
                mgr.removeUser();
                // return mgr.signinSilent();
                // return this.signIn(defaultSignInType);
              }
            })
            .catch(() => {
              // silent
              // Log.error(`Auth startup err = ` + err);
            });
        }
      },
      createNavigationGuard() {
        const guard = (to, from, next) => {
          if (to.matched.some(record => record.meta.authName === this.name)) {
            if (this.isAuthenticated) {
              next();
            } else {
              signIn(defaultSignInType, { state: { to } })
                .then(() => {
                  if (defaultSignInType === SignInType.Window) {
                    next(false);
                  } else {
                    next();
                  }
                })
                .catch(() => next(false));
            }
          } else {
            next();
          }
        };
        return guard;
      },
      createCallbackRoutes(router) {
        return [
          {
            path: `/auth/${providerId}/signinwin`,
            name: 'signinwin',
            component: createSignInCallbackComponent(router, SignInType.Window)
          },
          {
            path: `/auth/${providerId}/signinpop`,
            name: 'signinpop',
            component: createSignInCallbackComponent(router, SignInType.Popup)
          },
          {
            path: `/auth/${providerId}/signinsilent`,
            name: 'signinsilent',
            component: createSignInCallbackComponent(router, SignInType.Silent)
          },
          {
            path: `/auth/${providerId}/signout`,
            name: 'signout',
            component: Vue.extend({
              render: h => h('div'),
              created() {
                if (defaultSignInType === SignInType.Popup)
                  return mgr.signoutPopupCallback(null, false);
                return mgr.signoutRedirectCallback(null);
              }
            })
          }
        ];
      },
      signOut(args) {
        if (defaultSignInType === SignInType.Popup) {
          return mgr.signoutPopup(args).then(() => {
            if (!this.isAuthenticated) {
              // TODO: check if current route is protected and redirect away
            }
          });
        }
        return mgr.signoutRedirect(args);
      }
    }
  });

  return auth;
}
