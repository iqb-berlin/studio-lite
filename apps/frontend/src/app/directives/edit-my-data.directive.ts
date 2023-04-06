import { Directive, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntypedFormGroup } from '@angular/forms';
import { MyDataDto } from '@studio-lite-lib/api-dto';
import { EditMyDataComponent } from '../components/edit-my-data.component';
import { BackendService } from '../services/backend.service';
import { AppService } from '../services/app.service';

@Directive({
  selector: '[studioLiteEditMyData]'
})
export class EditMyDataDirective {
  constructor(
    public appService: AppService,
    private editMyDataDialog: MatDialog,
    private backendService: BackendService,
    private snackBar: MatSnackBar
  ) {}

  @HostListener('click') editMyData() {
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
}
