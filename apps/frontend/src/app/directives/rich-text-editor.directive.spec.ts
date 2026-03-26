import { Editor } from '@tiptap/core';
import { RichTextEditorDirective } from './rich-text-editor.directive';

class TestRichTextEditorDirective extends RichTextEditorDirective {}

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

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should initialize editor in ngOnInit', () => {
    directive.ngOnInit();
    expect(directive.editor).toBeDefined();
    expect(directive.editorStates).toBeDefined();
  });

  it('should toggle bold', () => {
    directive.ngOnInit();
    directive.toggleBold();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleBold).toHaveBeenCalled();
  });

  it('should toggle italic', () => {
    directive.ngOnInit();
    directive.toggleItalic();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleItalic).toHaveBeenCalled();
  });

  it('should toggle underline', () => {
    directive.ngOnInit();
    directive.toggleUnderline();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleUnderline).toHaveBeenCalled();
  });

  it('should toggle strike', () => {
    directive.ngOnInit();
    directive.toggleStrike();
    expect(mockEditor.commands.toggleStrike).toHaveBeenCalled();
  });

  it('should toggle superscript', () => {
    directive.ngOnInit();
    directive.toggleSuperscript();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleSuperscript).toHaveBeenCalled();
  });

  it('should toggle subscript', () => {
    directive.ngOnInit();
    directive.toggleSubscript();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleSubscript).toHaveBeenCalled();
  });

  it('should toggle bullet list', () => {
    directive.ngOnInit();
    directive.toggleBulletList();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleBulletList).toHaveBeenCalled();
  });

  it('should apply font color', () => {
    directive.ngOnInit();
    directive.selectedFontColor = 'red';
    directive.applyFontColor();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().setColor).toHaveBeenCalledWith('red');
  });

  it('should apply highlight color', () => {
    directive.ngOnInit();
    directive.selectedHighlightColor = 'yellow';
    directive.applyHighlightColor();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleHighlight).toHaveBeenCalledWith({ color: 'yellow' });
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

  it('should call setImage command when adding image', async () => {
    directive.ngOnInit();
    const mockSrc = 'data:image/png;base64,...';

    jest.spyOn(RichTextEditorDirective as unknown as {
      loadImage: (fileTypes?: string[]) => Promise<string>
    }, 'loadImage').mockResolvedValue(mockSrc);

    await directive.addImage();

    expect(mockEditor.commands.setImage).toHaveBeenCalledWith({ src: mockSrc });
  });
});
