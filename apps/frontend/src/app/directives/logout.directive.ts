import { Directive, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../services/app.service';
import { BackendService } from '../services/backend.service';
import { AuthService } from '../modules/auth/service/auth.service';

@Directive({
  selector: '[studioLiteLogout]',
  standalone: true
})
export class LogoutDirective {
  constructor(
    public appService: AppService,
    public confirmDialog: MatDialog,
    private backendService: BackendService,
    private translateService: TranslateService,
    private authService: AuthService
  ) {
  }

  @HostListener('click') logout(): void {
    const dialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: this.translateService.instant('home.logout'),
        content: this.translateService.instant('home.confirm-logout'),
        confirmButtonLabel: this.translateService.instant('home.logout'),
        showCancel: true
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.logout();
        this.backendService.logout();
      }
    });
  }
}
