import { NgModule, provideAppInitializer } from '@angular/core';
import { KeycloakAngularModule } from 'keycloak-angular';
import { AuthService } from './service/auth.service';

@NgModule({
  declarations: [],
  imports: [KeycloakAngularModule],
  providers: [
    provideAppInitializer(() =>
      // disable keycloak -> return Promise of true;
      // const initializerFn = (initializer)(inject(KeycloakService));
      // return initializerFn();
      // eslint-disable-next-line implicit-arrow-linebreak
      Promise.resolve(true)
    ),
    AuthService
  ]
})
export class AuthModule { }
