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
      return { message: 'Parsing id token failed', err: e };
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

  async login() : Promise<void> {
    await this.keycloakService.login();
  }

  async logout() : Promise<void> {
    await this.keycloakService.logout(window.location.origin);
  }

  async redirectToProfile(): Promise<void> {
    await this.keycloakService.getKeycloakInstance().accountManagement();
  }

  getRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }
}
