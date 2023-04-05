import { Directive, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService } from '../services/backend.service';
import { ChangePasswordComponent } from '../components/change-password/change-password.component';

@Directive({
  selector: '[studioLiteChangePassword]'
})
export class ChangePasswordDirective {
  constructor(
    private changePasswordDialog: MatDialog,
    private backendService: BackendService,
    private snackBar: MatSnackBar
  ) {}

  @HostListener('click') changePassword() : void {
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
}
