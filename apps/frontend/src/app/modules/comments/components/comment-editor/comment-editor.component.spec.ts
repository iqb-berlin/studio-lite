import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Pipe, PipeTransform } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NgxTiptapModule } from 'ngx-tiptap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommentEditorComponent } from './comment-editor.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

describe('CommentEditorComponent', () => {
  let component: CommentEditorComponent;
  let fixture: ComponentFixture<CommentEditorComponent>;

  @Pipe({
    name: 'isCommentCommittable'
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
        CommentEditorComponent,
        MockIsCommentCommittablePipe,
        WrappedIconComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        MatIconModule,
        MatSelectModule,
        MatTooltipModule,
        NgxTiptapModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
