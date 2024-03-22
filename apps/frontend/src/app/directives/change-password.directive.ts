import { Directive, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../services/backend.service';
import { ChangePasswordComponent } from '../components/change-password/change-password.component';
import { AppService } from '../services/app.service';
import { AuthService } from '../modules/auth/service/auth.service';

@Directive({
    selector: '[studioLiteChangePassword]',
    standalone: true
})
export class ChangePasswordDirective {
  constructor(
    private changePasswordDialog: MatDialog,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private appService: AppService,
    private authService: AuthService
  ) {
  }

  @HostListener('click')
  async changePassword() {
    if (this.appService.isLoggedInKeycloak) {
      await this.authService.redirectToProfile();
    } else {
      const dialogRef = this.changePasswordDialog.open(ChangePasswordComponent, {
        width: '400px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== false) {
          this.backendService.setUserPassword(result.controls.pw_old.value, result.controls.pw_new1.value).subscribe(
            respOk => {
              this.snackBar.open(
                respOk ?
                  this.translateService.instant('user-profile.new-password') :
                  this.translateService.instant('user-profile.new-password-error'),
                respOk ?
                  this.translateService.instant('user-profile.ok') :
                  this.translateService.instant('user-profile.error'),
                { duration: 3000 }
              );
            }
          );
        }
      });
    }
  }
}
