import Vue from 'vue';
import { createOidcAuth, SignInType } from '@/lib/VueOidcClient';

var mainClient = createOidcAuth(SignInType.Popup, {
  authority: 'https://demo.identityserver.io/',
  client_id: 'implicit', // 'implicit.shortlived',
  response_type: 'id_token token',
  scope: 'openid profile email api',
  // test use
  prompt: 'login',
  login_hint: 'bob'
  // staleStateAge?: number;
  // clockSkew?: number;
  // stateStore?: StateStore;
  // ResponseValidatorCtor?: ResponseValidatorCtor;
  // MetadataServiceCtor?: MetadataServiceCtor;
});
Vue.use(mainClient);
export default mainClient;
