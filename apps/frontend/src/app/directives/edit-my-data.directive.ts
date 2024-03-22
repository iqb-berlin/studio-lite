import { Directive, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormGroup } from '@angular/forms';
import { MyDataDto } from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';
import { EditMyDataComponent } from '../components/edit-my-data/edit-my-data.component';
import { BackendService } from '../services/backend.service';
import { AppService } from '../services/app.service';
import { AuthService } from '../modules/auth/service/auth.service';

@Directive({
    selector: '[studioLiteEditMyData]',
    standalone: true
})
export class EditMyDataDirective {
  constructor(
    public appService: AppService,
    private editMyDataDialog: MatDialog,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private authService: AuthService
  ) {
  }

  @HostListener('click')
  async editMyData() {
    if (this.appService.isLoggedInKeycloak) {
      await this.authService.redirectToProfile();
    } else {
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
                      this.snackBar.open(
                        this.translateService.instant(this.translateService.instant('user-profile.data-edited')),
                        '',
                        { duration: 1000 });
                    } else {
                      this.snackBar.open(
                        this.translateService.instant(this.translateService.instant('user-profile.new-password')),
                        this.translateService.instant('user-profile.error'),
                        { duration: 3000 });
                    }
                  }
                );
              }
            }
          });
        }
      });
    }
  }
}
