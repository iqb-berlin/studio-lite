import { AnyExtension, Editor } from '@tiptap/core';
import { RichTextEditorDirective } from './rich-text-editor.directive';

class TestRichTextEditorDirective extends RichTextEditorDirective {
  extensions(): AnyExtension[] {
    return this.getExtensions();
  }
}

const mockEditor = {
  commands: {
    focus: jest.fn().mockReturnThis(),
    setImage: jest.fn().mockReturnThis(),
    toggleStrike: jest.fn().mockReturnThis()
  },
  chain: jest.fn().mockReturnValue({
    toggleBold: jest.fn().mockReturnThis(),
    toggleItalic: jest.fn().mockReturnThis(),
    toggleUnderline: jest.fn().mockReturnThis(),
    toggleSuperscript: jest.fn().mockReturnThis(),
    toggleSubscript: jest.fn().mockReturnThis(),
    toggleBulletList: jest.fn().mockReturnThis(),
    setColor: jest.fn().mockReturnThis(),
    toggleHighlight: jest.fn().mockReturnThis(),
    focus: jest.fn().mockReturnThis(),
    run: jest.fn().mockReturnThis()
  }),
  on: jest.fn(),
  getHTML: jest.fn().mockReturnValue('<p>test</p>'),
  isActive: jest.fn().mockReturnValue(false),
  setOptions: jest.fn().mockReturnThis(),
  options: {
    element: document.createElement('div')
  },
  destroy: jest.fn()
} as unknown as Editor;

jest.mock('@tiptap/core', () => {
  const actual = jest.requireActual('@tiptap/core');
  return {
    ...actual,
    Editor: jest.fn().mockImplementation(() => mockEditor)
  };
});

describe('RichTextEditorDirective', () => {
  let directive: TestRichTextEditorDirective;

  beforeEach(() => {
    jest.clearAllMocks();
    directive = new TestRichTextEditorDirective();
  });

  it('should register StarterKit before the formatting every editor shares', () => {
    directive.placeholder = 'Kommentar';

    const extensions = directive.extensions();

    expect(extensions.map(extension => extension.name)).toEqual([
      'starterKit', 'superscript', 'subscript', 'textStyle', 'color', 'image', 'placeholder', 'highlight'
    ]);
    expect(extensions[0].options).toEqual(expect.objectContaining({ link: false, trailingNode: false }));
    expect(extensions[6].options).toEqual(expect.objectContaining({ placeholder: 'Kommentar' }));
  });

  it('should update color button styles', () => {
    directive.selectedFontColor = '#ff0000';
    directive.selectedHighlightColor = '#00ff00';
    (directive as unknown as { updateColorButtonStyles: () => void }).updateColorButtonStyles();
    expect(directive.fontColorButtonStyle).toContain('#ff0000');
    expect(directive.highlightColorButtonStyle).toContain('#00ff00');
  });

  it('should call destroy on editor in ngOnDestroy', () => {
    directive.ngOnInit();
    directive.ngOnDestroy();
    expect(mockEditor.destroy).toHaveBeenCalled();
  });
});
