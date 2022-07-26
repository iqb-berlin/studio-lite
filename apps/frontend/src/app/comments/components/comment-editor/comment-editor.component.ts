import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';

@Component({
  selector: 'studio-lite-comment-editor',
  templateUrl: './comment-editor.component.html',
  styleUrls: ['./comment-editor.component.scss']
})
export class CommentEditorComponent {
  @Input() submitLabel!: string;
  @Input() initialText: string = '';

  @Output() handleSubmit = new EventEmitter<string>();
  @Output() handleCancel = new EventEmitter<void>();

  form!: FormGroup;
  editor!: Editor;
  selectedFontSize: string = '20px';
  selectedFontColor: string = 'lightgrey';
  selectedHighlightColor: string = 'lightgrey';
  bulletListStyle: string = 'disc';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      comment: [this.initialText, Validators.required]
    });
    this.editor = new Editor({
      extensions: [StarterKit, Underline, Superscript, Subscript,
        TextStyle, Color,
        Image.configure({
          inline: false,
          allowBase64: true,
          HTMLAttributes: {
            style: 'max-width: 500px;'
          }
        }),
        Highlight.configure({
          multicolor: true
        })]
    });
  }

  onReset(): void {
    this.handleCancel.emit();
    this.editor.commands.setContent('');
    this.form.reset();
  }

  onSubmit(): void {
    this.handleSubmit.emit(this.form.value.comment);
    this.editor.commands.setContent('');
    this.form.reset();
  }

  async addImage(): Promise<void> {
    const mediaSrc = await CommentEditorComponent.loadImage(['image/*']);
    this.editor.commands.setImage({ src: mediaSrc });
  }

  private static async loadImage(fileTypes: string[] = []): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const fileUploadElement = document.createElement('input');
      fileUploadElement.type = 'file';
      fileUploadElement.accept = fileTypes.toString();
      fileUploadElement.addEventListener('change', event => {
        const uploadedFile = (event.target as HTMLInputElement).files?.[0];
        const reader = new FileReader();
        reader.onload = loadEvent => resolve(loadEvent.target?.result as string);
        reader.onerror = errorEvent => reject(errorEvent);
        if (uploadedFile) {
          reader.readAsDataURL(uploadedFile);
        }
      });
      fileUploadElement.click();
    });
  }

  toggleBold(): void {
    this.editor.chain().toggleBold().focus().run();
  }

  toggleItalic(): void {
    this.editor.chain().toggleItalic().focus().run();
  }

  toggleUnderline(): void {
    this.editor.chain().toggleUnderline().focus().run();
  }

  toggleStrike(): void {
    this.editor.commands.toggleStrike();
  }

  toggleSuperscript(): void {
    this.editor.chain().toggleSuperscript().focus().run();
  }

  toggleSubscript(): void {
    this.editor.chain().toggleSubscript().focus().run();
  }

  toggleBulletList(): void {
    this.editor.chain().toggleBulletList().focus().run();
  }

  applyFontColor(): void {
    this.editor.chain().focus().setColor(this.selectedFontColor).run();
  }

  applyHighlightColor(): void {
    this.editor.chain().focus().toggleHighlight({ color: this.selectedHighlightColor }).run();
  }
}
