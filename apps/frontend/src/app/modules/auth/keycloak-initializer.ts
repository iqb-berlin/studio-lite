import { KeycloakOptions, KeycloakService } from 'keycloak-angular';

export function initializer(keycloak: KeycloakService): () => Promise<boolean> {
  const options: KeycloakOptions = {
    config: {
      url: 'http://localhost:8080',
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
