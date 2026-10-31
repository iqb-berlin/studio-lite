import { RichTextEditorDirective } from './rich-text-editor.directive';
import { RichNoteEditorComponent } from '../modules/workspace/components/rich-note-editor/rich-note-editor.component';

class RealRichTextEditorDirective extends RichTextEditorDirective {
  readonly onEditorUpdate = jest.fn();
}

describe('Studio rich text with the real Tiptap 3 editor', () => {
  let directive: RealRichTextEditorDirective;

  beforeEach(() => {
    directive = new RealRichTextEditorDirective();
    directive.initialHTML = '<p><strong><u>A B&nbsp;C</u></strong></p>';
    directive.ngOnInit();
  });

  afterEach(() => directive.ngOnDestroy());

  it('loads existing formatting and spaces without reporting an authored change', () => {
    expect(directive.editor.getText()).toBe('A B\u00a0C');
    expect(directive.editor.getHTML()).toContain('<u>');
    expect(directive.editor.getHTML()).toContain('<strong>');
    expect(directive.onEditorUpdate).not.toHaveBeenCalled();
  });

  it('registers underline once and keeps the previous link behavior', () => {
    const names = directive.editor.extensionManager.extensions.map(extension => extension.name);
    expect(names.filter(name => name === 'underline')).toHaveLength(1);
    expect(new Set(names).size).toBe(names.length);
    expect(names).not.toContain('link');
  });

  it('preserves the loaded instruction through editing, undo and redo', () => {
    const stored = directive.editor.getHTML();
    directive.editor.commands.insertContentAt(1, 'Added ');
    const edited = directive.editor.getHTML();
    expect(directive.onEditorUpdate).toHaveBeenCalledTimes(1);
    expect(directive.editor.getText()).toBe('Added A B\u00a0C');

    expect(directive.editor.commands.undo()).toBe(true);
    expect(directive.editor.getHTML()).toBe(stored);
    expect(directive.editor.commands.redo()).toBe(true);
    expect(directive.editor.getHTML()).toBe(edited);
  });

  it('destroys the real editor and ProseMirror view', () => {
    const { editor } = directive;
    const { view } = editor;
    directive.ngOnDestroy();
    expect(editor.isDestroyed).toBe(true);
    expect(view.isDestroyed).toBe(true);
  });

  it('keeps pasted numeric and lettered labels in the note editor', () => {
    const note = new RichNoteEditorComponent();
    note.ngOnInit();
    try {
      ['3. Third\n4. Fourth', 'a. Alpha\nb. Beta'].forEach(text => {
        note.editor.commands.clearContent(false);
        const event = new Event('paste');
        Object.defineProperty(event, 'clipboardData', {
          value: { getData: (type: string) => (type === 'text/plain' ? text : '') }
        });

        expect(note.editor.view.pasteText(text, event as ClipboardEvent)).toBe(true);
        expect(note.editor.getText({ blockSeparator: '\n' })).toBe(text);
        expect(note.editor.getHTML()).not.toContain('<ol');
      });
    } finally {
      note.ngOnDestroy();
    }
  });

  // The note dialog marks its text as touched once the editor is left
  it('tells the note editor when the editor loses the focus', () => {
    const note = new RichNoteEditorComponent();
    const blurred = jest.fn();
    note.editorBlur.subscribe(blurred);
    note.ngOnInit();
    try {
      note.editor.view.dom.dispatchEvent(new FocusEvent('blur'));

      expect(blurred).toHaveBeenCalledTimes(1);
    } finally {
      note.ngOnDestroy();
    }
  });

  // what a colour field of the toolbar hands on when a colour is picked
  const pickColour = (colour: string, onInput: (event: Event) => void): void => {
    const field = document.createElement('input');
    field.value = colour;
    field.addEventListener('input', onInput);
    field.dispatchEvent(new Event('input'));
  };

  it('colours the selected text and the button with the font colour picked', () => {
    directive.editor.commands.selectAll();

    pickColour('#ff0000', event => directive.onFontColorInput(event));

    expect(directive.editor.getAttributes('textStyle')).toEqual(expect.objectContaining({ color: '#ff0000' }));
    expect(directive.fontColorButtonStyle).toContain('#ff0000');
  });

  it('highlights the selected text and the button with the highlight colour picked', () => {
    directive.editor.commands.selectAll();

    pickColour('#00ff00', event => directive.onHighlightColorInput(event));

    expect(directive.editor.getAttributes('highlight')).toEqual(expect.objectContaining({ color: '#00ff00' }));
    expect(directive.highlightColorButtonStyle).toContain('#00ff00');
  });

  it('puts a picked image into the text as a data URL', async () => {
    const image = new File(['pixel'], 'pixel.png', { type: 'image/png' });
    const pick = jest.spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(function pickImage(this: HTMLInputElement) {
        Object.defineProperty(this, 'files', { value: [image] });
        this.dispatchEvent(new Event('change'));
      });
    try {
      await directive.addImage();

      expect(directive.editor.getHTML()).toContain('src="data:image/png;base64,cGl4ZWw="');
    } finally {
      pick.mockRestore();
    }
  });

  [
    { name: 'comment', create: () => new RealRichTextEditorDirective() },
    { name: 'note', create: () => new RichNoteEditorComponent() }
  ].forEach(({ name, create }) => {
    [
      { ending: 'a list', html: '<ol><li><p>Stored instruction</p></li></ol>' },
      { ending: 'a heading', html: '<h2>Stored heading</h2>' },
      { ending: 'an image', html: '<img src="data:image/png;base64,cGl4ZWw=" alt="Stored image">' }
    ].forEach(({ ending, html }) => {
      it(`does not change the ${name} document ending in ${ending} when selecting content`, () => {
        const component = create();
        component.initialHTML = html;
        const updated = jest.spyOn(component, 'onEditorUpdate');
        component.ngOnInit();
        try {
          const stored = component.editor.getHTML();
          component.editor.commands.selectAll();
          expect(component.editor.getHTML()).toBe(stored);
          expect(updated).not.toHaveBeenCalled();
        } finally {
          component.ngOnDestroy();
        }
      });
    });
  });
});
