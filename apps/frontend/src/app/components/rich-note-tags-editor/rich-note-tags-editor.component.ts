import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-rich-note-tags-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './rich-note-tags-editor.component.html',
  styleUrl: './rich-note-tags-editor.component.scss'
})
export class RichNoteTagsEditorComponent {
  @Input() control!: FormControl;
  @Input() label = '';
  @Input() globalTagsJson = '';
  @Input() showGlobalPreview = false;
  @Input() globalPreviewLabel = '';
  @Input() rows = 15;

  @Output() copyFromGlobalRequested = new EventEmitter<void>();

  copyFromGlobal(): void {
    this.copyFromGlobalRequested.emit();
  }
}
