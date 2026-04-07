import {
  Component, EventEmitter, OnInit, Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { UnitRichNoteTagDto, WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import {
  RichNoteTagsEditorComponent
} from '../../../../components/rich-note-tags-editor/rich-note-tags-editor.component';
import {
  RichNoteTagsConfigDirective
} from '../../../../directives/rich-note-tags-config.directive';
import { BackendService } from '../../../admin/services/backend.service';
import { WsgAdminService } from '../../services/wsg-admin.service';

@Component({
  selector: 'studio-lite-unit-rich-note-tags-config',
  templateUrl: './unit-rich-note-tags-config.component.html',
  styleUrls: ['./unit-rich-note-tags-config.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTooltipModule,
    MatExpansionModule,
    TranslateModule,
    RichNoteTagsEditorComponent
  ]
})
export class UnitRichNoteTagsConfigComponent extends RichNoteTagsConfigDirective implements OnInit {
  globalTagsJson = '';

  @Output() hasChanged = new EventEmitter<UnitRichNoteTagDto[]>();

  constructor(
    fb: FormBuilder,
    private backendService: BackendService,
    private wsgAdminService: WsgAdminService
  ) {
    super(fb);
  }

  ngOnInit(): void {
    this.wsgAdminService.selectedWorkspaceGroupSettings
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((settings: WorkspaceGroupSettingsDto) => {
        const initialTags = settings.richNoteTags || [];
        this.configForm.patchValue({
          tagsJson: initialTags.length > 0 ? JSON.stringify(initialTags, null, 2) : ''
        }, { emitEvent: false });
      });

    this.configForm.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (this.configForm.valid) {
          const tags = this.parseTags();
          this.hasChanged.emit(tags);
        }
      });

    this.loadGlobalTags();
  }

  loadGlobalTags(): void {
    this.backendService.getUnitRichNoteTags()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(tags => {
        this.globalTagsJson = JSON.stringify(tags, null, 2);
      });
  }

  copyFromGlobal(): void {
    this.configForm.patchValue({
      tagsJson: this.globalTagsJson
    });
  }
}
