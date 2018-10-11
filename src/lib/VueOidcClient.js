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
  providerName,
  defaultSignInType,
  oidcConfig,
  logger
) {
  if (defaultSignInType === SignInType.Silent) {
    throw new Error('Silent is not a valid default signin type.');
  }

  Log.logger = logger || console;
  Log.level = Log.DEBUG;
  // merge overrides with defaults
  const config = {
    response_type: `id_token`,
    scope: `openid profile`,
    filterProtocolClaims: true,
    loadUserInfo: true,
    popupWindowTarget: providerName,
    automaticSilentRenew: true,
    monitorSession: true, // iframeNavigator?: any;
    userStore: new WebStorageStateStore({
      store: localStorage
    }),
    ...oidcConfig, // fixed paths
    redirect_uri: `http://localhost:8080/auth/${providerName}/signinwin`,
    post_logout_redirect_uri: `http://localhost:8080`,
    popup_post_logout_redirect_uri: `http://localhost:8080/auth/${providerName}/signout`,
    popup_redirect_uri: `http://localhost:8080/auth/${providerName}/signinpop`,
    silent_redirect_uri: `http://localhost:8080/auth/${providerName}/signinsilent`
  };
  // popupWindowFeatures?: string;
  // silentRequestTimeout?: any;

  Log.debug(`Creating new oidc auth for ${providerName}`);
  Log.debug(JSON.stringify(config));

  const mgr = new UserManager(config);

  ///////////////////////////////
  // events
  ///////////////////////////////
  mgr.events.addAccessTokenExpiring(() => {
    Log.debug(`${providerName} token expiring`);
  });

  mgr.events.addAccessTokenExpired(() => {
    Log.debug(`${providerName} token expired`);
    // TODO: try silent before full sign out?
    auth.signOut();
  });

  mgr.events.addSilentRenewError(e => {
    Log.error(`${providerName} silent renew error`, e.message);
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
            Log.debug(`${SignInType[type]} signin callback success`, data);
            // need to manually redirect for window type
            if (type === SignInType.Window) {
              // goto original secure route or root
              const redirect = data.state ? data.state.to : null;
              router.replace(redirect || '/');
            }
          })
          .catch(err => {
            Log.error(`${SignInType[type]} signin callback error`, err);
            if (type === SignInType.Window) {
              router.replace('/');
            }
          });
      }
    };
  }
  const auth = new Vue({
    data() {
      return { user: null, inited: false };
    },
    computed: {
      name() {
        return providerName;
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
      startup() {
        if (this.inited) {
          return Promise.resolve();
        } else {
          // load user from storage then from silent login before using it
          return (
            mgr
              .getUser()
              // .then(test => {
              //   if (!test || test.expired) {
              //     return mgr.signinSilent();
              //   }
              //   return Promise.resolve(test)
              // })
              .then(test => {
                this.inited = true;
                if (test && !test.expired) {
                  this.user = test;
                } else {
                  mgr.removeUser();
                  // return this.signIn(defaultSignInType);
                }
              })
              .catch(() => {
                // silent
                // Log.error(`Auth startup err = ` + err);
              })
          );
        }
      },
      createNavigationGuard() {
        const guard = (to, from, next) => {
          if (to.matched.some(record => record.meta.authName === this.name)) {
            if (this.isAuthenticated) {
              next();
            } else {
              this.signIn(defaultSignInType, { state: { to } })
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
            path: `/auth/${providerName}/signinwin`,
            name: 'signinwin',
            component: createSignInCallbackComponent(router, SignInType.Window)
          },
          {
            path: `/auth/${providerName}/signinpop`,
            name: 'signinpop',
            component: createSignInCallbackComponent(router, SignInType.Popup)
          },
          {
            path: `/auth/${providerName}/signinsilent`,
            name: 'signinsilent',
            component: createSignInCallbackComponent(router, SignInType.Silent)
          },
          {
            path: `/auth/${providerName}/signout`,
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
      signIn(type, args) {
        switch (type) {
          case SignInType.Popup:
            return mgr.signinPopup(args);
          case SignInType.Silent:
            return mgr.signinSilent(args);
        }
        return mgr.signinRedirect(args);
      },
      signOut(args) {
        if (defaultSignInType === SignInType.Popup)
          return mgr.signoutPopup(args);
        return mgr.signoutRedirect(args);
      }
    }
  });

  return auth;
}
