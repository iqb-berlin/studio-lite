import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import {
  UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { Subscription } from 'rxjs';
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

@Component({
  selector: 'studio-lite-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  // eslint-disable-next-line max-len
  imports: [AreaTitleComponent, WarningComponent, FormsModule, ReactiveFormsModule, MatFormField, MatInput, MatButton, TranslateModule]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: UntypedFormGroup;
  loginNamePreset = '';
  redirectTo = '';
  errorMessage = '';
  private routingSubscription: Subscription | null = null;

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

  async validLoginCheck(ok: boolean, initLoginMode: boolean) {
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

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
  }
}
