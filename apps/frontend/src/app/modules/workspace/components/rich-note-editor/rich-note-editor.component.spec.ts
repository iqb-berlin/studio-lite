import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Editor } from '@tiptap/core';
import { RichNoteEditorComponent } from './rich-note-editor.component';

describe('RichNoteEditorComponent', () => {
  let component: RichNoteEditorComponent;
  let fixture: ComponentFixture<RichNoteEditorComponent>;
  let mockEditor: Editor;

  jest.mock('@tiptap/core', () => {
    const actual = jest.requireActual('@tiptap/core');
    return {
      ...actual,
      Editor: jest.fn().mockImplementation(() => mockEditor)
    };
  });

  beforeEach(async () => {
    mockEditor = {
      commands: {
        focus: jest.fn().mockReturnThis(),
        setContent: jest.fn().mockReturnThis(),
        insertContent: jest.fn().mockReturnThis()
      },
      chain: jest.fn().mockReturnValue({
        toggleBold: jest.fn().mockReturnThis(),
        toggleBulletList: jest.fn().mockReturnThis(),
        toggleOrderedList: jest.fn().mockReturnThis(),
        focus: jest.fn().mockReturnThis(),
        run: jest.fn().mockReturnThis(),
        setBulletListStyle: jest.fn().mockReturnThis(),
        setOrderedListStyle: jest.fn().mockReturnThis()
      }),
      on: jest.fn(),
      getHTML: jest.fn().mockReturnValue('<p>test</p>'),
      isActive: jest.fn().mockReturnValue(false),
      destroy: jest.fn()
    } as unknown as Editor;

    await TestBed.configureTestingModule({
      imports: [RichNoteEditorComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RichNoteEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.editor.destroy();
  });

  it('should replace the lists of StarterKit by its own and keep the shared formatting', () => {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const names = component['getExtensions']().map(extension => extension.name);

    expect(names).toEqual([
      'starterKit', 'bulletList', 'orderedList', 'underline', 'superscript', 'subscript', 'textStyle', 'color',
      'image', 'placeholder', 'highlight'
    ]);
  });

  it('should initialize editor with initial content', () => {
    component.initialHTML = '<p>Hello World</p>';
    component.ngOnInit();
    expect(component.editor.getHTML()).toContain('Hello World');
  });
});
