import { Directive, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { AppService } from '../../services/app.service';
import { BackendService } from '../../services/backend.service';

@Directive({
  selector: '[studioLiteLogout]'
})
export class LogoutDirective {
  constructor(
    public appService: AppService,
    public confirmDialog: MatDialog,
    private backendService: BackendService
  ) {}

  @HostListener('click') logout(): void {
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
