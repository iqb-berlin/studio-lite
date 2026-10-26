import { Directive, HostListener, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BackendService } from '../services/backend.service';
import { ChangePasswordComponent } from '../components/change-password/change-password.component';

/**
 * Makes whatever it sits on open the change-password dialog and carry the change through to the
 * server. The whole action hangs on a directive so that a menu entry or a button only has to
 * declare what it does, not how.
 */
@Directive({
  selector: '[studioLiteChangePassword]',
  standalone: true
})
export class ChangePasswordDirective implements OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private changePasswordDialog: MatDialog,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private router: Router
  ) {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  @HostListener('click')
  changePassword() {
    const dialogRef = this.changePasswordDialog.open(ChangePasswordComponent, {
      width: '400px'
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        // only the save button hands back the form; Esc, a click beside the dialog or navigation give undefined
        if (result) {
          this.backendService.setUserPassword(result.controls.pw_old.value, result.controls.pw_new1.value)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
              respOk => {
                // The server has ended every session of the account, this one included (#1901). Leaving
                // first, as LogoutDirective does, keeps the open page from firing requests without a token.
                if (respOk) {
                  this.router.navigate(['/']).then(done => {
                    if (done) this.backendService.logout();
                  });
                }
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
