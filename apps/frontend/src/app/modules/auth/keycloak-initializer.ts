import { KeycloakOptions, KeycloakService } from 'keycloak-angular';
import { environment } from '../../../environments/environment';

export function initializer(keycloak: KeycloakService): () => Promise<boolean> {
  if (environment.production) {
    const options: KeycloakOptions = {
      config: {
        url: 'https://www.iqb-login.de',
        realm: 'iqb',
        clientId: 'studio'
      },
      loadUserProfileAtStartUp: true,
      initOptions: {
        onLoad: 'check-sso',
        // onLoad: 'login-required',
        checkLoginIframe: false
      },
      bearerExcludedUrls: []
    };

    return () => keycloak.init(options);
  }
  const options: KeycloakOptions = {
    config: {
      url: 'https://www.iqb-login.de',
      realm: 'iqb',
      clientId: 'studio'
    },
    loadUserProfileAtStartUp: true,
    initOptions: {
      onLoad: 'check-sso',
      // onLoad: 'login-required',
      checkLoginIframe: false
    },
    bearerExcludedUrls: []
  };

  return () => keycloak.init(options);
}
