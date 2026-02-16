import { Directive, HostListener, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BackendService } from '../services/backend.service';

@Directive({
  selector: '[studioLiteLogout]',
  standalone: true
})
export class LogoutDirective implements OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  constructor(
    public confirmDialog: MatDialog,
    private backendService: BackendService,
    private translateService: TranslateService,
    private router: Router
  ) {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        if (result) {
          this.router.navigate(['/']).then(done => {
            if (done) this.backendService.logout();
          });
        }
      });
  }
}
