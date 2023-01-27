import { Component } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MyDataDto } from '@studio-lite-lib/api-dto';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from '../change-password.component';
import { EditMyDataComponent } from '../edit-my-data.component';
import { BackendService } from '../../backend.service';
import { AppService } from '../../app.service';

@Component({
  selector: 'studio-lite-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent {
  constructor(
    public appService: AppService,
    public confirmDialog: MatDialog,
    private changePasswordDialog: MatDialog,
    private editMyDataDialog: MatDialog,
    private backendService: BackendService,
    private snackBar: MatSnackBar
  ) {}

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
              respOk ? 'OK' : 'Fehler',
              { duration: 3000 }
            );
          }
        );
      }
    });
  }

  changeUserData() {
    this.backendService.getMyData().subscribe(myData => {
      if (myData) {
        const dialogRef = this.editMyDataDialog.open(EditMyDataComponent, {
          width: '600px',
          data: {
            description: myData.description,
            firstName: myData.firstName,
            lastName: myData.lastName,
            email: myData.email,
            emailPublishApproved: myData.emailPublishApproved
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (typeof result !== 'undefined') {
            if (result !== false) {
              this.appService.dataLoading = true;
              const newFirstName: string = (<UntypedFormGroup>result).get('firstName')?.value;
              const newLastName: string = (<UntypedFormGroup>result).get('lastName')?.value;
              const newEmail: string = (<UntypedFormGroup>result).get('email')?.value;
              const newEmailApproval: boolean = (<UntypedFormGroup>result).get('emailPublishApproval')?.value;
              const newDescription: string = (<UntypedFormGroup>result).get('description')?.value;
              const changedData: MyDataDto = { id: this.appService.authData.userId };
              if (newDescription !== myData.description) changedData.description = newDescription;
              if (newFirstName !== myData.firstName) changedData.firstName = newFirstName;
              if (newLastName !== myData.lastName) changedData.lastName = newLastName;
              if (newEmail !== myData.email) changedData.email = newEmail;
              if (newEmailApproval !== myData.emailPublishApproved) changedData.emailPublishApproved = newEmailApproval;
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
      }
    });
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
}
