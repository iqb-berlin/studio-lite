import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { KeycloakProfile, KeycloakTokenParsed } from 'keycloak-js';
import { CreateKeycloakUserDto } from '@studio-lite-lib/api-dto';
import { AppService } from '../../services/app.service';
import { BackendService } from '../../services/backend.service';
import { AuthService } from '../../modules/auth/service/auth.service';

@Component({
  selector: 'studio-lite-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: UntypedFormGroup;
  loginNamePreset = '';
  redirectTo = '';
  errorMessage = '';
  loggedInKeycloak: boolean = false;
  userProfile: KeycloakProfile = {};
  private routingSubscription: Subscription | null = null;
  private loggedUser: KeycloakTokenParsed | undefined;
  constructor(private fb: UntypedFormBuilder,
              private authService: AuthService,
              private route: ActivatedRoute,
              private router: Router,
              private backendService: BackendService,
              private snackBar: MatSnackBar,
              public appService: AppService) {
    this.loginForm = this.fb.group({
      name: this.fb.control('', [Validators.required, Validators.minLength(1)]),
      pw: this.fb.control('', [Validators.required, Validators.minLength(1)])
    });
  }

  async ngOnInit(): Promise<void> {
    this.routingSubscription = this.route.queryParams.subscribe(queryParams => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      this.redirectTo = queryParams['redirectTo'];
    });
    this.routingSubscription = this.route.params.subscribe(params => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      this.loginNamePreset = params['login'];
      if (this.loginNamePreset) {
        this.loginForm.setValue({ name: this.loginNamePreset, pw: '' });
      }
    });

    this.loggedInKeycloak = await this.authService.isLoggedIn();
    if (this.loggedInKeycloak) {
      if (this.userProfile.id && this.userProfile.username) {
        const keycloakUser:CreateKeycloakUserDto = {
          issuer: this.loggedUser?.iss || '',
          identity: this.userProfile.id,
          username: this.userProfile.username,
          lastName: this.userProfile.lastName || '',
          firstName: this.userProfile.firstName || '',
          email: this.userProfile.email || ''
        };
        this.keycloakLogin(keycloakUser);
      }
    }
  }

  login(): void {
    this.errorMessage = '';
    this.appService.clearErrorMessages();
    if (this.loginForm.valid) {
      this.appService.dataLoading = true;
      this.appService.errorMessagesDisabled = true;
      const initLoginMode = !this.appService.appConfig.hasUsers;
      this.backendService.login(
        this.loginForm.get('name')?.value, this.loginForm.get('pw')?.value, initLoginMode
      ).subscribe(ok => {
        this.appService.dataLoading = false;
        if (ok) {
          if (this.redirectTo) {
            this.router.navigate([this.redirectTo]);
          } else if (initLoginMode) {
            this.router.navigate(['/admin']);
          }
        } else {
          this.snackBar.open('Login nicht erfolgreich', 'Fehler', { duration: 3000 });
        }
        this.appService.errorMessagesDisabled = false;
      });
    }
  }

  keycloakLogin(user:CreateKeycloakUserDto): void {
    this.backendService.keycloakLogin(user);
  }

  loginKeycloak(): void {
    this.authService.login();
  }

  logoutKeycloak(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
  }
}
