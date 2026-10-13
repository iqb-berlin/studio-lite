import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import {
  UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatInput } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';

import { AppService } from '../../services/app.service';
import { BackendService } from '../../services/backend.service';
import { WarningComponent } from '../warning/warning.component';
import { GateRejection, gateRejectionOf } from '../../utils/gate-rejection';
import { AreaTitleComponent } from '../area-title/area-title.component';

/**
 * The login form, for both kinds of login the studio has: an account, and a review link with its
 * password. After it, the page the user was sent away from is opened again.
 *
 * Every login creates a session, so it has to be fired exactly once per attempt -- the note in the
 * class says what a second call would leave behind.
 */
@Component({
  selector: 'studio-lite-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],

  imports: [
    AreaTitleComponent, WarningComponent, FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatButton,
    TranslateModule
  ]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: UntypedFormGroup;
  loginNamePreset = '';
  redirectTo = '';
  errorMessage = '';
  // A login without a sessionId creates a session row, so every extra call creates a
  // second session nobody can reach: the frontend keeps the tokens of the last response
  // and the earlier row lives out the inactivity window without a client that could log
  // it out (#1617). The template disables the submit button while this is true, and the
  // guard in login() catches the click that lands before that rendering does.
  isSubmitting = false;
  private ngUnsubscribe = new Subject<void>();

  constructor(private fb: UntypedFormBuilder,
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
    this.route.queryParams
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(queryParams => {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        this.redirectTo = queryParams['redirectTo'];
      });
    this.route.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        this.loginNamePreset = params['login'];
        if (this.loginNamePreset) {
          this.loginForm.setValue({ name: this.loginNamePreset, pw: '' });
        }
      });
  }

  login(): void {
    if (this.isSubmitting) return;
    this.errorMessage = '';
    this.appService.clearErrorMessages();
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.appService.dataLoading = true;
      this.appService.errorMessagesDisabled = true;
      const initLoginMode = !this.appService.appConfig.hasUsers;
      this.backendService.login(
        this.loginForm.get('name')?.value, this.loginForm.get('pw')?.value, initLoginMode
      )
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: async ok => {
            await this.validLoginCheck(ok, initLoginMode);
          },
          error: async (error: unknown) => {
            await this.validLoginCheck(false, initLoginMode, gateRejectionOf(error));
          }
        });
    }
  }

  /** `rejection`: why the gateway in front did not let the login through, if that was it. */
  async validLoginCheck(ok: boolean, initLoginMode: boolean, rejection: GateRejection | null = null) {
    this.isSubmitting = false;
    this.appService.dataLoading = false;
    // Switched off in login() only so that a failed login is not reported twice -- the snack bar
    // below says it already. The answer is in, so from here on every error is shown again; the page
    // is not reloaded after a login, and nothing else would switch them back on (#1724).
    this.appService.errorMessagesDisabled = false;
    if (ok) {
      if (this.redirectTo) {
        await this.router.navigate([this.redirectTo]);
      } else if (initLoginMode) {
        await this.router.navigate(['/admin']);
      }
    } else {
      this.snackBar.open(
        this.translateService.instant(rejection ? `login.${rejection}` : 'login.no-success'),
        this.translateService.instant('login.error'),
        { duration: 3000 });
    }
  }

  ngOnDestroy(): void {
    // A login still running is cancelled with the page: no answer will switch off what login()
    // switched on, so it is done here.
    if (this.isSubmitting) {
      this.isSubmitting = false;
      this.appService.dataLoading = false;
      this.appService.errorMessagesDisabled = false;
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
