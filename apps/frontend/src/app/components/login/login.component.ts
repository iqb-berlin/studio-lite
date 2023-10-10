import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { KeycloakProfile, KeycloakTokenParsed } from 'keycloak-js';
import { CreateUserDto } from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';
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
  userProfile: KeycloakProfile = {};
  loggedInKeycloak: boolean = false;
  private routingSubscription: Subscription | null = null;
  private loggedUser: KeycloakTokenParsed | undefined;
  constructor(private fb: UntypedFormBuilder,
              public authService: AuthService,
              private route: ActivatedRoute,
              private router: Router,
              private backendService: BackendService,
              private snackBar: MatSnackBar,
              private translateService: TranslateService,
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

    if (await this.authService.isLoggedIn()) {
      this.loggedInKeycloak = true;
      this.loggedUser = this.authService.getLoggedUser();
      this.userProfile = await this.authService.loadUserProfile();
      if (this.userProfile.id && this.userProfile.username) {
        const keycloakUser:CreateUserDto = {
          issuer: this.loggedUser?.iss || '',
          identity: this.userProfile.id,
          name: this.userProfile.username,
          lastName: this.userProfile.lastName || '',
          firstName: this.userProfile.firstName || '',
          email: this.userProfile.email || '',
          password: '',
          description: '',
          isAdmin: false
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
      ).subscribe(async ok => {
        await this.validLoginCheck(ok, initLoginMode);
      });
    }
  }

  keycloakLogin(user:CreateUserDto): void {
    this.errorMessage = '';
    this.appService.clearErrorMessages();
    this.appService.dataLoading = true;
    this.appService.errorMessagesDisabled = true;
    const initLoginMode = !this.appService.appConfig.hasUsers;
    this.backendService.keycloakLogin(user).subscribe(async ok => {
      await this.validLoginCheck(ok, initLoginMode);
    });
  }

  async validLoginCheck(ok:boolean, initLoginMode:boolean) {
    this.appService.dataLoading = false;
    if (ok) {
      if (this.redirectTo) {
        await this.router.navigate([this.redirectTo]);
      } else if (initLoginMode) {
        await this.router.navigate(['/admin']);
      }
    } else {
      this.snackBar.open(
        this.translateService.instant('login.no-success'),
        this.translateService.instant('login.error'),
        { duration: 3000 });
    }
  }

  async loginKeycloak(): Promise<void> {
    await this.authService.login();
  }

  async logoutKeycloak(): Promise<void> {
    await this.authService.logout();
    this.loggedInKeycloak = false;
  }

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
  }
}
