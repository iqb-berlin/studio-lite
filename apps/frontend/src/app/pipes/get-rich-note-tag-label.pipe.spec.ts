import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GetRichNoteTagLabelPipe } from './get-rich-note-tag-label.pipe';
import { WorkspaceService } from '../modules/workspace/services/workspace.service';

describe('GetRichNoteTagLabelPipe', () => {
  let pipe: GetRichNoteTagLabelPipe;
  let workspaceServiceMock: Partial<WorkspaceService>;

  beforeEach(() => {
    workspaceServiceMock = {
      richNoteTags$: of([]),
      getRichNoteTagLabel: jest.fn().mockReturnValue([{ lang: 'de', value: 'Test' }])
    };

    TestBed.configureTestingModule({
      providers: [
        GetRichNoteTagLabelPipe,
        { provide: WorkspaceService, useValue: workspaceServiceMock }
      ]
    });

    pipe = TestBed.inject(GetRichNoteTagLabelPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should call workspaceService.getRichNoteTagLabel', done => {
    pipe.transform('path.to.tag').subscribe(result => {
      expect(workspaceServiceMock.getRichNoteTagLabel).toHaveBeenCalledWith('path.to.tag');
      expect(result).toEqual([{ lang: 'de', value: 'Test' }]);
      done();
    });
  });
});
