import { Directive, HostListener, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormGroup } from '@angular/forms';
import { MyDataDto } from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { EditMyDataComponent } from '../components/edit-my-data/edit-my-data.component';
import { BackendService } from '../services/backend.service';
import { AppService } from '../services/app.service';

@Directive({
  selector: '[studioLiteEditMyData]',
  standalone: true
})
export class EditMyDataDirective implements OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  constructor(
    public appService: AppService,
    private editMyDataDialog: MatDialog,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  @HostListener('click')
  editMyData() {
    this.backendService.getMyData()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(myData => {
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

          dialogRef.afterClosed()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(result => {
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
                  // eslint-disable-next-line max-len
                  if (newEmailApproval !== myData.emailPublishApproved) changedData.emailPublishApproved = newEmailApproval;
                  this.backendService.setMyData(changedData)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe(
                      respOk => {
                        this.appService.dataLoading = false;
                        if (respOk) {
                          this.snackBar.open(
                            this.translateService.instant('user-profile.data-edited'),
                            '',
                            { duration: 1000 });
                        } else {
                          this.snackBar.open(
                            this.translateService.instant('user-profile.data-edit-error'),
                            this.translateService.instant('user-profile.error'),
                            { duration: 3000 }
                          );
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
