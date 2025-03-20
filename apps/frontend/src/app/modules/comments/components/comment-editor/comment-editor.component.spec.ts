// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Pipe, PipeTransform } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgxTiptapModule } from 'ngx-tiptap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommentEditorComponent } from './comment-editor.component';

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
    standalone: false
  })
  class MockIsCommentCommittablePipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(editorHTML: string): boolean {
      return !!editorHTML;
    }
  }
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockIsCommentCommittablePipe
      ],
      imports: [
        TranslateModule.forRoot(),
        MatIconModule,
        MatSelectModule,
        MatTooltipModule,
        NgxTiptapModule
      ]
    }).compileComponents();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).ClipboardEvent = ClipboardEventMock;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).DragEvent = DragEventMock;
    fixture = TestBed.createComponent(CommentEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
