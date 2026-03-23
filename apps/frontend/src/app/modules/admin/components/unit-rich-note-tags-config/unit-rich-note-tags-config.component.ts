import { Component, OnInit } from '@angular/core';
import {
  FormBuilder, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { takeUntil } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import {
  RichNoteTagsEditorComponent
} from '../../../../components/rich-note-tags-editor/rich-note-tags-editor.component';
import {
  RichNoteTagsConfigDirective
} from '../../../../directives/rich-note-tags-config/rich-note-tags-config.directive';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'studio-lite-unit-rich-note-tags-config',
  templateUrl: './unit-rich-note-tags-config.component.html',
  styleUrls: ['./unit-rich-note-tags-config.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    TranslateModule,
    RichNoteTagsEditorComponent
  ]
})
export class UnitRichNoteTagsConfigComponent extends RichNoteTagsConfigDirective implements OnInit {
  dataChanged = false;
  isFormValid = false;

  constructor(
    fb: FormBuilder,
    private snackBar: MatSnackBar,
    private backendService: BackendService,
    private translateService: TranslateService
  ) {
    super(fb);
    this.configForm.statusChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.isFormValid = this.configForm.valid;
      });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.backendService.getUnitRichNoteTags()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(tags => {
        this.configForm.patchValue({
          tagsJson: JSON.stringify(tags, null, 2)
        });
        this.configForm.valueChanges
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(() => {
            this.dataChanged = true;
          });
        this.dataChanged = false;
        this.isFormValid = this.configForm.valid;
      });
  }

  saveData(): void {
    if (this.configForm.valid) {
      const tags = this.parseTags();
      this.backendService.setUnitRichNoteTags(tags)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(success => {
          if (success) {
            this.snackBar.open(
              this.translateService.instant('workspace.tags-saved-success'),
              '',
              { duration: 3000 }
            );
            this.dataChanged = false;
          } else {
            this.snackBar.open(
              this.translateService.instant('workspace.tags-saved-error'),
              this.translateService.instant('error'),
              { duration: 3000 }
            );
          }
        });
    }
  }
}
