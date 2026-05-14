import {
  Component, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter, SimpleChanges
} from '@angular/core';
import {
  FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators
} from '@angular/forms';
import { takeUntil, Subject } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { UnitRichNoteTagDto } from '@studio-lite-lib/api-dto';

import { BackendService } from '../../services/backend.service';

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
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    TranslateModule
  ]
})
export class UnitRichNoteTagsConfigComponent implements OnInit, OnDestroy, OnChanges {
  @Input() config?: UnitRichNoteTagDto[] | string[] | null;
  @Input() showSaveButton = true;
  @Input() isGlobal = false;
  @Output() configChange = new EventEmitter<string[]>();

  configForm: FormGroup;
  dataChanged = false;
  private ngUnsubscribe = new Subject<void>();
  private isUpdatingForm = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private backendService: BackendService,
    private translateService: TranslateService
  ) {
    this.configForm = this.fb.group({
      urls: this.fb.array([])
    });

    this.configForm.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        if (!this.isUpdatingForm) {
          this.dataChanged = true;
          const validUrls = this.urls.value.filter((u: string) => u.trim() !== '');
          this.configChange.emit(validUrls);
        }
      });
  }

  get urls(): FormArray {
    return this.configForm.get('urls') as FormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    if (changes['config'] && !changes['config'].firstChange) {
      if (this.config !== undefined) {
        this.updateForm(this.config);
      } else if (this.isGlobal) {
        this.loadData();
      }
    }
  }

  ngOnInit(): void {
    if (this.config !== undefined) {
      this.updateForm(this.config);
    } else if (this.isGlobal) {
      this.loadData();
    }
  }

  loadData(): void {
    this.backendService.getUnitRichNoteTagsConfig()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(config => {
        this.updateForm(config);
      });
  }

  private updateForm(config: UnitRichNoteTagDto[] | string[] | unknown): void {
    this.isUpdatingForm = true;
    this.urls.clear();

    if (Array.isArray(config)) {
      if (config.length > 0 && typeof config[0] === 'string') {
        (config as unknown as string[]).forEach(url => {
          if (url && url.trim() !== '') this.addUrl(url);
        });
      } else if (config.length > 0) {
        this.addUrl(JSON.stringify(config));
      }
    } else if (typeof config === 'string' && config.startsWith('http')) {
      this.addUrl(config);
    } else if (config) {
      this.addUrl(String(config));
    }

    if (this.urls.length === 0 && this.isGlobal) {
      this.addUrl('');
    }

    this.dataChanged = false;
    this.isUpdatingForm = false;
  }

  addUrl(url = ''): void {
    const wasUpdating = this.isUpdatingForm;
    this.isUpdatingForm = true;
    const urlPattern = /^(https?:\/\/).+/;
    this.urls.push(this.fb.control(url, [Validators.required, Validators.pattern(urlPattern)]));

    if (!wasUpdating) {
      this.isUpdatingForm = false;
      this.dataChanged = true;
      const validUrls = this.urls.value.filter((u: string) => u.trim() !== '');
      this.configChange.emit(validUrls);
    }
  }

  removeUrl(index: number): void {
    this.urls.removeAt(index);
    this.dataChanged = true;
    const validUrls = this.urls.value.filter((u: string) => u.trim() !== '');
    this.configChange.emit(validUrls);
  }

  saveData(): void {
    if (this.configForm.valid) {
      const urls = this.urls.value;
      this.backendService.setUnitRichNoteTags(urls)
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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
