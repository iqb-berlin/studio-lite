import {
  Component, EventEmitter, OnDestroy, OnInit, Output
} from '@angular/core';
import {
  AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UnitRichNoteTagDto, WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { BackendService } from '../../../admin/services/backend.service';
import { WsgAdminService } from '../../services/wsg-admin.service';

@Component({
  selector: 'studio-lite-unit-rich-note-tags-config',
  templateUrl: './unit-rich-note-tags-config.component.html',
  styleUrls: ['./unit-rich-note-tags-config.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatTooltipModule,
    TranslateModule
  ]
})
export class UnitRichNoteTagsConfigComponent implements OnInit, OnDestroy {
  configForm: FormGroup;
  globalTagsJson = '';

  @Output() hasChanged = new EventEmitter<UnitRichNoteTagDto[]>();
  private ngUnsubscribe = new Subject<void>();

  get tagsJsonControl(): AbstractControl | null {
    return this.configForm.get('tagsJson');
  }

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    private wsgAdminService: WsgAdminService
  ) {
    this.configForm = this.fb.group({
      tagsJson: ['', [UnitRichNoteTagsConfigComponent.jsonValidator]]
    });
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
          const jsonValue = this.configForm.get('tagsJson')?.value;
          const tags = jsonValue?.trim() ? JSON.parse(jsonValue) : [];
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

  private static jsonValidator(control: AbstractControl): ValidationErrors | null {
    try {
      if (control.value && control.value.trim()) {
        JSON.parse(control.value);
      }
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
