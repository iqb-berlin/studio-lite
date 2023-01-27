import { Router } from '@angular/router';
import {
  Component, Inject, OnInit
} from '@angular/core';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { ReviewDto } from '@studio-lite-lib/api-dto';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { BackendService } from '../backend.service';
import { AppService } from '../app.service';
import { AppConfig } from '../app.classes';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(@Inject('APP_VERSION') readonly appVersion: string,
              @Inject('APP_NAME') readonly appName: string,
              public appService: AppService,
              private backendService: BackendService,
              public confirmDialog: MatDialog,
              private titleService: Title,
              private sanitizer: DomSanitizer,
              private router: Router) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.backendService.getConfig().subscribe(newConfig => {
        if (newConfig) {
          this.appService.appConfig = new AppConfig(this.titleService, newConfig, this.sanitizer);
          this.appService.dataLoading = false;
          this.appService.globalWarning = this.appService.appConfig.globalWarningText();
        }
      });
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

  buttonGotoReview(review: ReviewDto) {
    this.router.navigate([`/review/${review.id}`]);
  }
}
