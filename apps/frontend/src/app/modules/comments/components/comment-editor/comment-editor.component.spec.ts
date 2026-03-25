// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import {
  RichTextEditorDirective
} from '../../../../directives/rich-text-editor.directive';
import { CommentEditorComponent } from './comment-editor.component';

const mockEditor = {
  commands: {
    focus: jest.fn().mockReturnThis(),
    clearContent: jest.fn().mockReturnThis(),
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
};

jest.mock('@tiptap/core', () => {
  const actual = jest.requireActual('@tiptap/core');
  return {
    ...actual,
    Editor: jest.fn().mockImplementation(() => mockEditor)
  };
});
@Component({
  selector: 'studio-lite-wrapped-icon',
  template: '',
  standalone: true
})
class MockWrappedIconComponent {
  @Input() icon!: string;
}

@Component({
  selector: 'studio-lite-item-selection',
  template: '',
  standalone: true
})
class MockItemSelectionComponent {
  @Input() selectedItems: string[] = [];
  @Input() unitItems: UnitItemDto[] = [];
  @Input() label: string = '';
  @Input() disabled: boolean = false;
}

describe('CommentEditorComponent', () => {
  let component: CommentEditorComponent;
  let fixture: ComponentFixture<CommentEditorComponent>;

  class ClipboardDataMock {
    getData: jest.Mock<string, [string]>;
    setData: jest.Mock<void, [string, string]>;

    constructor() {
      this.getData = jest.fn();
      this.setData = jest.fn();
    }
  }

  class ClipboardEventMock extends Event {
    clipboardData: ClipboardDataMock;

    constructor(type: string, options?: EventInit) {
      super(type, options);
      this.clipboardData = new ClipboardDataMock();
    }
  }

  class DataTransferMock {
    data: { [key: string]: string };

    constructor() {
      this.data = {};
    }

    setData(format: string, data: string): void {
      this.data[format] = data;
    }

    getData(format: string): string {
      return this.data[format] || '';
    }
  }

  class DragEventMock extends Event {
    dataTransfer: DataTransferMock;

    constructor(type: string, options?: EventInit) {
      super(type, options);
      this.dataTransfer = new DataTransferMock();
    }
  }

  @Pipe({
    name: 'isCommentCommittable',
    standalone: true
  })
  class MockIsCommentCommittablePipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(editorHTML: string): boolean {
      return !!editorHTML && editorHTML !== '<p></p>';
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        TiptapEditorDirective,
        CommentEditorComponent,
        MockIsCommentCommittablePipe,
        MockWrappedIconComponent,
        MockItemSelectionComponent
      ]
    }).compileComponents();

    Object.defineProperty(window, 'ClipboardEvent', {
      writable: true,
      value: ClipboardEventMock
    });
    Object.defineProperty(window, 'DragEvent', {
      writable: true,
      value: DragEventMock
    });

    fixture = TestBed.createComponent(CommentEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize specialization in ngAfterViewInit', () => {
    component.ngAfterViewInit();
    expect(mockEditor.on).toHaveBeenCalledWith('update', expect.any(Function));
    expect(mockEditor.commands.focus).toHaveBeenCalled();
  });

  it('should emit handleCancel and clear content onReset', () => {
    const cancelSpy = jest.spyOn(component.handleCancel, 'emit');
    component.onReset();
    expect(cancelSpy).toHaveBeenCalled();
    expect(mockEditor.commands.clearContent).toHaveBeenCalledWith(true);
    expect(mockEditor.commands.focus).toHaveBeenCalled();
  });

  it('should emit handleSubmit and clear content onSubmit if content is not empty', () => {
    const submitSpy = jest.spyOn(component.handleSubmit, 'emit');
    mockEditor.getHTML.mockReturnValue('<p>content</p>');
    component.selectedItems = ['item1'];

    component.onSubmit();

    expect(submitSpy).toHaveBeenCalledWith({ text: '<p>content</p>', items: ['item1'] });
    expect(mockEditor.commands.clearContent).toHaveBeenCalledWith(true);
    expect(mockEditor.commands.focus).toHaveBeenCalled();
    expect(component.selectedItems).toEqual([]);
  });

  it('should emit handleCancel if onSubmit is called with empty content', () => {
    const cancelSpy = jest.spyOn(component.handleCancel, 'emit');
    mockEditor.getHTML.mockReturnValue('<p></p>');

    component.onSubmit();

    expect(cancelSpy).toHaveBeenCalled();
    expect(mockEditor.commands.clearContent).toHaveBeenCalledWith(true);
  });

  it('should toggle bold', () => {
    component.toggleBold();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleBold).toHaveBeenCalled();
    expect(mockEditor.chain().run).toHaveBeenCalled();
  });

  it('should toggle italic', () => {
    component.toggleItalic();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleItalic).toHaveBeenCalled();
    expect(mockEditor.chain().run).toHaveBeenCalled();
  });

  it('should toggle underline', () => {
    component.toggleUnderline();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleUnderline).toHaveBeenCalled();
    expect(mockEditor.chain().run).toHaveBeenCalled();
  });

  it('should toggle strike', () => {
    component.toggleStrike();
    expect(mockEditor.commands.toggleStrike).toHaveBeenCalled();
  });

  it('should toggle superscript', () => {
    component.toggleSuperscript();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleSuperscript).toHaveBeenCalled();
    expect(mockEditor.chain().run).toHaveBeenCalled();
  });

  it('should toggle subscript', () => {
    component.toggleSubscript();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleSubscript).toHaveBeenCalled();
    expect(mockEditor.chain().run).toHaveBeenCalled();
  });

  it('should toggle bullet list', () => {
    component.toggleBulletList();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleBulletList).toHaveBeenCalled();
    expect(mockEditor.chain().run).toHaveBeenCalled();
  });

  it('should apply font color', () => {
    component.selectedFontColor = 'red';
    component.applyFontColor();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().setColor).toHaveBeenCalledWith('red');
    expect(mockEditor.chain().run).toHaveBeenCalled();
  });

  it('should apply highlight color', () => {
    component.selectedHighlightColor = 'yellow';
    component.applyHighlightColor();
    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.chain().toggleHighlight).toHaveBeenCalledWith({ color: 'yellow' });
    expect(mockEditor.chain().run).toHaveBeenCalled();
  });

  it('should update editorHTML onSelectedItemChange if content is not empty', () => {
    mockEditor.getHTML.mockReturnValue('<p>some content</p>');
    component.onSelectedItemChange();
    expect(component.editorHTML).toBe('<p>some content</p>');
  });

  it('should not update editorHTML onSelectedItemChange if content is empty', () => {
    mockEditor.getHTML.mockReturnValue('<p></p>');
    component.editorHTML = 'initial';
    component.onSelectedItemChange();
    expect(component.editorHTML).toBe('initial');
  });

  it('should call setImage command when adding image', async () => {
    const mockSrc = 'data:image/png;base64,...';
    jest.spyOn(RichTextEditorDirective as unknown as {
      loadImage: (fileTypes?: string[]) => Promise<string>
    }, 'loadImage').mockResolvedValue(mockSrc);

    await component.addImage();

    expect(mockEditor.commands.setImage).toHaveBeenCalledWith({ src: mockSrc });
  });
});
