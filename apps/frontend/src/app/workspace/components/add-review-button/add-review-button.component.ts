import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InputTextComponent } from '../../../components/input-text.component';
import { BackendService } from '../../backend.service';
import { WorkspaceService } from '../../workspace.service';
import { CheckForChangesDirective } from '../../directives/check-for-changes.directive';

@Component({
  selector: 'studio-lite-add-review-button',
  templateUrl: './add-review-button.component.html',
  styleUrls: ['./add-review-button.component.scss']
})
export class AddReviewButtonComponent extends CheckForChangesDirective {
  @Input() selectedReviewId!: number;
  @Input() changed!: boolean;
  @Output() added: EventEmitter<number> = new EventEmitter<number>();
  @Output() changedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private inputTextDialog: MatDialog,
    private backendService: BackendService,
    public workspaceService: WorkspaceService,
    private snackBar: MatSnackBar,
    protected confirmDiscardChangesDialog: MatDialog
  ) {
    super();
  }

  addReview() {
    this.checkForChangesAndContinue(this.changed).then(go => {
      if (go) {
        // this.changed = false;
        this.changedChange.emit(false);
        const dialogRef = this.inputTextDialog.open(InputTextComponent, {
          width: '500px',
          data: {
            title: 'Neue Aufgabenfolge',
            default: '',
            okButtonLabel: 'Speichern',
            prompt: 'Name der Aufgabenfolge'
          }
        });

        dialogRef.afterClosed()
          .subscribe(result => {
            if (typeof result === 'string') {
              if (result.length > 1) {
                this.backendService.addReview(
                  this.workspaceService.selectedWorkspaceId,
                  {
                    workspaceId: this.workspaceService.selectedWorkspaceId,
                    name: result
                  }
                )
                  .subscribe(isOK => {
                    if (typeof isOK === 'number') {
                      // this.loadReviewList(isOK);
                      this.added.emit(isOK);
                    } else {
                      this.snackBar.open('Konnte neue Aufgabenfolge nicht anlegen.', '', { duration: 3000 });
                    }
                  });
              }
            }
          });
      }
    });
  }
}