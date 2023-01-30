import {
  Component, OnDestroy, OnInit
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppService } from '../../app.service';
import { BackendService } from '../../backend.service';

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
  private routingSubscription: Subscription | null = null;
  constructor(private fb: UntypedFormBuilder,
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

  ngOnInit(): void {
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

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
  }
}
