import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatError } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'studio-lite-rich-note-tags-editor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslateModule,
    MatError
  ],
  templateUrl: './rich-note-tags-editor.component.html',
  styleUrls: ['./rich-note-tags-editor.component.scss']
})
export class RichNoteTagsEditorComponent {
  @Input() control!: FormControl;
  @Input() label!: string;
  @Input() globalTagsJson = '';
  @Input() showGlobalPreview = false;
  @Input() globalPreviewLabel = '';
  @Input() rows = 15;

  @Output() copyFromGlobalRequested = new EventEmitter<void>();

  copyFromGlobal(): void {
    this.copyFromGlobalRequested.emit();
  }
}
