import { NgModule, inject, provideAppInitializer } from '@angular/core';
import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { initializer } from './keycloak-initializer';
import { AuthService } from './service/auth.service';

@NgModule({
  declarations: [],
  imports: [KeycloakAngularModule],
  providers: [
    provideAppInitializer(() => {
      const initializerFn = (initializer)(inject(KeycloakService));
      return initializerFn();
    }),
    AuthService
  ]
})
export class AuthModule { }
