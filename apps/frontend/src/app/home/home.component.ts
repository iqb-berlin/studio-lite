import { ActivatedRoute, Router } from '@angular/router';
import {
  Component, Inject, OnDestroy, OnInit
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MyDataDto, WorkspaceDto } from '@studio-lite-lib/api-dto';
import { Subscription } from 'rxjs';
import { BackendService } from '../backend.service';
import { AppService } from '../app.service';
import { ChangePasswordComponent } from './change-password.component';
import { EditMyDataComponent } from './edit-my-data.component';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  loginForm: UntypedFormGroup;
  isError = false;
  errorMessage = '';
  private routingSubscription: Subscription | null = null;
  redirectTo = '';

  constructor(private fb: UntypedFormBuilder,
              @Inject('APP_VERSION') readonly appVersion: string,
              @Inject('APP_NAME') readonly appName: string,
              public appService: AppService,
              private backendService: BackendService,
              public confirmDialog: MatDialog,
              private changePasswordDialog: MatDialog,
              private editMyDataDialog: MatDialog,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private router: Router) {
    this.loginForm = this.fb.group({
      name: this.fb.control('', [Validators.required, Validators.minLength(1)]),
      pw: this.fb.control('', [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit(): void {
    this.routingSubscription = this.route.queryParams.subscribe(queryParams => {
      this.redirectTo = queryParams['redirectTo'];
    });
    setTimeout(() => {
      this.appService.appConfig.setPageTitle('Willkommen!');
      this.appService.dataLoading = false;
      const token = localStorage.getItem('id_token');
      if (token) {
        this.backendService.getAuthData().subscribe(authData => {
          this.appService.authData = authData;
        });
      }
    });
  }

  login(): void {
    this.isError = false;
    this.errorMessage = '';
    this.appService.dataLoading = true;
    if (this.loginForm && this.loginForm.valid) {
      this.backendService.login(
        this.loginForm.get('name')?.value, this.loginForm.get('pw')?.value
      ).subscribe(ok => {
        this.appService.dataLoading = false;
        if (ok) {
          if (this.redirectTo) {
            this.router.navigate([this.redirectTo]);
          }
        } else {
          this.snackBar.open('Login nicht erfolgreich', 'Fehler', { duration: 3000 });
        }
      });
    }
  }

  logout(): void {
    const dialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      height: '300px',
      data: <ConfirmDialogData>{
        title: 'Abmelden',
        content: 'Möchten Sie sich abmelden?',
        confirmButtonLabel: 'Abmelden',
        showCancel: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.backendService.logout();
      }
    });
  }

  changePassword() : void {
    const dialogRef = this.changePasswordDialog.open(ChangePasswordComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.backendService.setUserPassword(result.controls.pw_old.value, result.controls.pw_new1.value).subscribe(
          respOk => {
            this.snackBar.open(
              respOk ? 'Neues Kennwort gespeichert' : 'Konnte Kennwort nicht ändern.',
              respOk ? 'OK' : 'Fehler', { duration: 3000 }
            );
          }
        );
      }
    });
  }

  buttonGotoWorkspace(selectedWorkspace: WorkspaceDto): void {
    this.router.navigate([`/a/${selectedWorkspace.id}`]);
  }

  ngOnDestroy(): void {
    if (this.routingSubscription !== null) {
      this.routingSubscription.unsubscribe();
    }
  }

  changeUserData() {
    this.backendService.getMyData().subscribe(myData => {
      const dialogRef = this.editMyDataDialog.open(EditMyDataComponent, {
        width: '600px',
        data: {
          description: myData.description,
          firstName: myData.firstName,
          lastName: myData.lastName,
          email: myData.email
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.appService.dataLoading = true;
            const newFirstName: string = (<UntypedFormGroup>result).get('firstName')?.value;
            const newLastName: string = (<UntypedFormGroup>result).get('lastName')?.value;
            const newEmail: string = (<UntypedFormGroup>result).get('email')?.value;
            const newDescription: string = (<UntypedFormGroup>result).get('description')?.value;
            const changedData: MyDataDto = { id: this.appService.authData.userId };
            if (newDescription !== myData.description) changedData.description = newDescription;
            if (newFirstName !== myData.firstName) changedData.firstName = newFirstName;
            if (newLastName !== myData.lastName) changedData.lastName = newLastName;
            if (newEmail !== myData.email) changedData.email = newEmail;
            this.appService.dataLoading = true;
            this.backendService.setMyData(changedData).subscribe(
              respOk => {
                this.appService.dataLoading = false;
                if (respOk) {
                  this.snackBar.open('Nutzerdaten geändert', '', { duration: 1000 });
                } else {
                  this.snackBar.open('Konnte Nutzerdaten nicht ändern', 'Fehler', { duration: 3000 });
                }
              }
            );
          }
        }
      });
    });
  }
}
