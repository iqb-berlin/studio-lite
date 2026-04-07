import { Directive, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { UnitRichNoteTagDto } from '@studio-lite-lib/api-dto';
import { StudioValidators } from '../validators/studio-validators.validator';

@Directive()
export abstract class RichNoteTagsConfigDirective implements OnDestroy {
  configForm: FormGroup;
  tagsJsonControl: FormControl;
  protected ngUnsubscribe = new Subject<void>();

  constructor(protected fb: FormBuilder) {
    this.configForm = this.fb.group({
      tagsJson: ['', [StudioValidators.jsonValidator]]
    });
    this.tagsJsonControl = this.configForm.get('tagsJson') as FormControl;
  }

  protected parseTags(): UnitRichNoteTagDto[] {
    const value = this.tagsJsonControl.value;
    return value?.trim() ? JSON.parse(value) : [];
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
