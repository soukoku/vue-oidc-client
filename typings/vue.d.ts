/**
 * Augment the typings of Vue.js
 */

import Vue from 'vue';
import { OidcAuth } from './index';

declare module 'vue/types/vue' {
  interface Vue {
    $oidc: OidcAuth;
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    oidc?: OidcAuth;
  }
}
