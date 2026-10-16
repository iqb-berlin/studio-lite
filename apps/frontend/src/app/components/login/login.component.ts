import {
  Component, OnDestroy, OnInit, signal
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
  private readonly destroyed = signal(false);

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
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(queryParams => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      this.redirectTo = queryParams['redirectTo'];
    });
    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
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
      // Not given up with the page (no takeUntil): its answer holds tokens and a session on the
      // server, which have to arrive to be kept or cleaned up (#1617). A page left meanwhile only
      // skips its own part.
      ).subscribe({
        next: async ok => {
          if (!this.destroyed()) await this.validLoginCheck(ok, initLoginMode);
        },
        // Only the gateway's refusal comes as an error, and its library has said why already
        error: () => {
          if (!this.destroyed()) this.endLoginAttempt();
        }
      });
    }
  }

  async validLoginCheck(ok: boolean, initLoginMode: boolean) {
    this.endLoginAttempt();
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

  private endLoginAttempt(): void {
    this.isSubmitting = false;
    this.appService.dataLoading = false;
    // Switched off in login() only so that a failed login is not reported twice -- the snack bar
    // in validLoginCheck says it already. The answer is in, so from here on every error is shown
    // again; the page is not reloaded after a login, and nothing else would switch them back on (#1724).
    this.appService.errorMessagesDisabled = false;
  }

  ngOnDestroy(): void {
    // A login still waiting for its answer, as behind the gateway's challenge, goes on without the
    // page: what the page switched on for it would otherwise stay on
    if (this.isSubmitting) this.endLoginAttempt();
    this.destroyed.set(true);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
