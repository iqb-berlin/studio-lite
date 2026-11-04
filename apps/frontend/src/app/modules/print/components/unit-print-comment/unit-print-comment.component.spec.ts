import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { createMock } from '@golevelup/ts-jest';
import { UnitPrintCommentComponent } from './unit-print-comment.component';
import { Comment } from '../../../comments/models/comment.interface';

describe('UnitPrintCommentComponent', () => {
  it('should create', () => {
    TestBed.configureTestingModule({ imports: [UnitPrintCommentComponent, TranslateModule.forRoot()] });
    const fixture = TestBed.createComponent(UnitPrintCommentComponent);
    fixture.componentRef.setInput('comment', createMock<Comment>({ itemUuids: [], changedAt: new Date() }));

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
