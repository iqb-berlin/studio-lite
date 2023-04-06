import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { InputTextComponent } from '../../../../app/components/input-text/input-text.component';
import { BackendService } from '../../services/backend.service';
import { CheckForChangesDirective } from '../../directives/check-for-changes.directive';

@Component({
  selector: 'studio-lite-add-review-button',
  templateUrl: './add-review-button.component.html',
  styleUrls: ['./add-review-button.component.scss']
})
export class AddReviewButtonComponent extends CheckForChangesDirective {
  @Input() selectedReviewId!: number;
  @Input() changed!: boolean;
  @Input() workspaceId!: number;
  @Output() added: EventEmitter<number> = new EventEmitter<number>();
  @Output() changedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private inputTextDialog: MatDialog,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    protected translateService: TranslateService,
    protected confirmDiscardChangesDialog: MatDialog
  ) {
    super();
  }

  addReview() {
    this.checkForChangesAndContinue(this.changed).then(go => {
      if (go) {
        this.changedChange.emit(false);
        const dialogRef = this.inputTextDialog.open(InputTextComponent, {
          width: '500px',
          data: {
            title: this.translateService.instant('workspace.new-review'),
            default: '',
            okButtonLabel: this.translateService.instant('workspace.save'),
            prompt: this.translateService.instant('workspace.new-review-name')
          }
        });

        dialogRef.afterClosed()
          .subscribe(result => {
            if (typeof result === 'string') {
              if (result.length) {
                this.backendService.addReview(
                  this.workspaceId,
                  {
                    workspaceId: this.workspaceId,
                    name: result
                  }
                )
                  .subscribe(isOK => {
                    if (typeof isOK === 'number') {
                      this.added.emit(isOK);
                    } else {
                      this.snackBar
                        .open(this.translateService.instant('workspace.review-not-added'),
                          '',
                          { duration: 3000 });
                    }
                  });
              }
            }
          });
      }
    });
  }
}
