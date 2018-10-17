import Vue from 'vue';
import { UserManager, Log, WebStorageStateStore } from 'oidc-client';

Log.level = Log.DEBUG;

/**
 * Indicates the sign in behavior.
 */
export const SignInType = {
  /**
   * Uses the main browser window to do sign-in.
   */
  Window: 0,
  /**
   * Uses a popup window to do sign-in.
   */
  Popup: 1,
  /**
   * Uses a hidden iframe to do sign-in.
   */
  Silent: 2,
  /**
   * String value map for Window.
   */
  0: 'Window',
  /**
   * String value map for Popup.
   */
  1: 'Popup',
  /**
   * String value map for Silent.
   */
  2: 'Silent'
};

export function createOidcAuth(
  authName,
  defaultSignInType,
  appUrl,
  oidcConfig,
  logger = console
) {
  if (!authName) {
    throw new Error('Auth name is required.');
  }
  if (
    defaultSignInType !== SignInType.Window &&
    defaultSignInType !== SignInType.Popup
  ) {
    throw new Error('Only window or popup are valid default signin types.');
  }
  if (!appUrl) {
    throw new Error('App base url is required.');
  }
  if (!oidcConfig) {
    throw new Error('No config provided to oidc auth.');
  }

  Log.logger = logger;

  // merge config with defaults
  const config = {
    response_type: 'id_token',
    scope: 'openid profile',
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({
      store: localStorage
    }),
    post_logout_redirect_uri: appUrl,
    ...oidcConfig, // all properties after this are not user configurable
    redirect_uri: `${appUrl}auth/signinwin/${authName}`,
    popup_post_logout_redirect_uri: `${appUrl}auth/signoutpop/${authName}`,
    popup_redirect_uri: `${appUrl}auth/signinpop/${authName}`,
    silent_redirect_uri: `${appUrl}auth/signinsilent/${authName}`
  };

  Log.debug(`Creating new oidc auth as ${authName}`);

  const mgr = new UserManager(config);

  ///////////////////////////////
  // events
  ///////////////////////////////
  mgr.events.addAccessTokenExpiring(() => {
    Log.debug(`${authName} auth token expiring`);
  });

  mgr.events.addAccessTokenExpired(() => {
    Log.debug(`${authName} auth token expired`);
    if (auth.isAuthenticated) {
      mgr
        .signinSilent()
        .then(() => {
          Log.debug(`${authName} auth silent renew after token expiration`);
        })
        .catch(() => {
          Log.debug(`${authName} auth silent renew error token expiration`);
          auth.signOut();
        });
    }
  });

  mgr.events.addSilentRenewError(e => {
    Log.error(`${authName} auth silent renew error`, e.message);
    // TODO: need to restart renew manually?
    // if (auth.isAuthenticated) {
    //   setTimeout(() => {
    //     mgr.signinSilent();
    //   }, 5000);
    // }
  });

  mgr.events.addUserLoaded(user => {
    auth.user = user;
  });

  mgr.events.addUserUnloaded(() => {
    auth.user = undefined;

    // redirect if on protected route (best method here?)
    Log.debug(`${authName} auth user unloaded`);
    if (auth.myRouter) {
      const current = auth.myRouter.currentRoute;
      if (current && current.meta.authName === authName) {
        auth.myRouter.replace('/');
      }
    }
  });

  mgr.events.addUserSignedOut(() => {
    Log.debug(`${authName} auth user signed out`);
    auth.user = undefined;
  });

  function signIn(type, args) {
    switch (type) {
      case SignInType.Popup:
        return mgr.signinPopup(args);
      case SignInType.Silent:
        return mgr.signinSilent(args);
    }
    return mgr.signinRedirect(args);
  }

  function redirectAfterSignout(router) {
    if (router) {
      const current = router.currentRoute;
      if (current && current.meta.authName === authName) {
        router.replace('/');
        return;
      }
    }
    //   window.location.reload(true);
    if (appUrl) window.location = appUrl;
  }

  let _inited = false;
  const auth = new Vue({
    data() {
      return { user: undefined };
    },
    computed: {
      appUrl() {
        return appUrl;
      },
      authName() {
        return authName;
      },
      isAuthenticated() {
        return !!this.user && !this.user.expired;
      },
      accessToken() {
        return !!this.user && !this.user.expired ? this.user.access_token : '';
      },
      userProfile() {
        return !!this.user && !this.user.expired ? this.user.profile : {};
      }
    },
    methods: {
      startup() {
        var path = window.location.pathname;
        if (path.indexOf('/signinpop/') > -1) {
          mgr.signinPopupCallback();
          return Promise.resolve(false);
        } else if (path.indexOf('/signinsilent/') > -1) {
          mgr.signinSilentCallback();
          return Promise.resolve(false);
        } else if (path.indexOf('/signoutpop/') > -1) {
          mgr.signoutPopupCallback();
          return Promise.resolve(false);
        }

        if (_inited) {
          return Promise.resolve(true);
        } else {
          // load user from storage
          return mgr
            .getUser()
            .then(test => {
              _inited = true;
              if (test && !test.expired) {
                this.user = test;
              }
              return true;
            })
            .catch(err => {
              Log.warn(`Auth startup err = ${err}`);
              return false;
            });
        }
      },
      useRouter(router) {
        this.myRouter = router;
        const guard = (to, from, next) => {
          if (
            to.matched.some(record => record.meta.authName === this.authName)
          ) {
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
        router.beforeEach(guard);

        router.addRoutes([
          {
            path: `/auth/signinwin/${authName}`,
            name: 'signinwin',
            component: {
              render: h => h('div'),
              created() {
                mgr
                  .signinRedirectCallback()
                  .then(data => {
                    Log.debug(
                      `${authName} Window signin callback success`,
                      data
                    );
                    // need to manually redirect for window type
                    // goto original secure route or root
                    const redirect = data.state ? data.state.to : null;
                    if (router) router.replace(redirect || '/');
                    else window.location = appUrl;
                  })
                  .catch(err => {
                    Log.error(`${authName} Window signin callback error`, err);
                    if (router) router.replace('/');
                    else window.location = appUrl;
                  });
              }
            }
          }
        ]);
      },
      signIn(args) {
        return signIn(defaultSignInType, args);
      },
      signOut(args) {
        if (defaultSignInType === SignInType.Popup) {
          const router = this.myRouter;
          return mgr
            .signoutPopup(args)
            .then(() => {
              redirectAfterSignout(router);
            })
            .catch(() => {
              // could be window closed
              redirectAfterSignout(router);
            });
        }
        return mgr.signoutRedirect(args);
      }
    }
  });

  return auth;
}
