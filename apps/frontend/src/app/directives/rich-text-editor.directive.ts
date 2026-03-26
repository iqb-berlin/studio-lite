import {
  Directive,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { AnyExtension, Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { UnitItemDto } from '@studio-lite-lib/api-dto';

@Directive()
export abstract class RichTextEditorDirective implements OnInit, OnDestroy {
  @Input() initialHTML = '';
  @Input() placeholder = '';
  @Input() unitItems: UnitItemDto[] = [];
  @Input() selectedItems: string[] = [];

  editor!: Editor;
  selectedFontColor = 'black';
  selectedHighlightColor = 'black';
  fontColorButtonStyle = '';
  highlightColorButtonStyle = '';
  editorStates = {
    bold: false,
    italic: false,
    underline: false,
    superscript: false,
    subscript: false,
    strike: false,
    bulletList: false,
    orderedList: false
  };

  /**
   * Components extending this base class can override this to provide
   * additional extensions like advanced lists.
   */
  protected getExtensions(): AnyExtension[] {
    return [
      StarterKit,
      Underline,
      Superscript,
      Subscript,
      TextStyle,
      Color,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          style: 'max-width: 500px;'
        }
      }),
      Placeholder.configure({
        placeholder: this.placeholder
      }),
      Highlight.configure({
        multicolor: true
      })
    ];
  }

  ngOnInit() {
    this.editor = new Editor({
      extensions: this.getExtensions(),
      content: this.initialHTML,
      onTransaction: () => {
        this.updateBaseEditorStates();
        // Child classes can implement `updateEditorStates` if needed
        if ('updateEditorStates' in this && typeof this.updateEditorStates === 'function') {
          (this.updateEditorStates as () => void)();
        }
      },
      onUpdate: () => {
        // Child classes can implement `onEditorUpdate` if needed
        if ('onEditorUpdate' in this && typeof this.onEditorUpdate === 'function') {
          (this.onEditorUpdate as () => void)();
        }
      },
      onBlur: () => {
        if ('onEditorBlur' in this && typeof this.onEditorBlur === 'function') {
          (this.onEditorBlur as () => void)();
        }
      }
    });

    // Make sure we update states initially
    this.updateBaseEditorStates();
    if ('updateEditorStates' in this && typeof this.updateEditorStates === 'function') {
      (this.updateEditorStates as () => void)();
    }
    this.updateColorButtonStyles();
  }

  private updateBaseEditorStates(): void {
    this.editorStates = {
      ...this.editorStates,
      bold: this.editor.isActive('bold'),
      italic: this.editor.isActive('italic'),
      underline: this.editor.isActive('underline'),
      superscript: this.editor.isActive('superscript'),
      subscript: this.editor.isActive('subscript'),
      strike: this.editor.isActive('strike'),
      bulletList: this.editor.isActive('bulletList'),
      orderedList: this.editor.isActive('orderedList')
    };
  }

  protected updateColorButtonStyles(): void {
    this.fontColorButtonStyle = `linear-gradient(135deg, white 60%, ${this.selectedFontColor} 60%)`;
    this.highlightColorButtonStyle = `linear-gradient(135deg, white 60%, ${this.selectedHighlightColor} 60%)`;
  }

  async addImage(): Promise<void> {
    const mediaSrc = await RichTextEditorDirective.loadImage(['image/*']);
    this.editor.commands.setImage({ src: mediaSrc });
  }

  protected static async loadImage(fileTypes: string[] = []): Promise<string> {
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
    this.updateColorButtonStyles();
  }

  applyHighlightColor(): void {
    this.editor.chain().focus().toggleHighlight({ color: this.selectedHighlightColor }).run();
    this.updateColorButtonStyles();
  }

  onFontColorInput(event: Event): void {
    this.selectedFontColor = (event.target as HTMLInputElement).value;
    this.applyFontColor();
  }

  onHighlightColorInput(event: Event): void {
    this.selectedHighlightColor = (event.target as HTMLInputElement).value;
    this.applyHighlightColor();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }
}
