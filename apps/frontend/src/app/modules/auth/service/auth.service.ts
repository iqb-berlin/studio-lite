import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile, KeycloakTokenParsed } from 'keycloak-js';

@Injectable()
export class AuthService {
  constructor(private keycloakService: KeycloakService) {}

  getLoggedUser(): KeycloakTokenParsed | undefined {
    try {
      return this.keycloakService.getKeycloakInstance()
        .idTokenParsed;
    } catch (e) {
      console.error('Exception', e);
      return undefined;
    }
  }

  getToken() {
    return this.keycloakService.getToken();
  }

  isLoggedIn() : Promise<boolean> {
    return this.keycloakService.isLoggedIn();
  }

  loadUserProfile() : Promise<KeycloakProfile> {
    return this.keycloakService.loadUserProfile();
  }

  login() : void {
    this.keycloakService.login();
  }

  logout() : void {
    this.keycloakService.logout(window.location.origin);
  }

  redirectToProfile(): void {
    this.keycloakService.getKeycloakInstance().accountManagement();
  }

  getRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }
}
