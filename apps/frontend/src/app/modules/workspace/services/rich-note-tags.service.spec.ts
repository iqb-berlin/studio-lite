import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { createMock } from '@golevelup/ts-jest';
import { UnitRichNoteTagDto } from '@studio-lite-lib/api-dto';
import { RichNoteTagsService } from './rich-note-tags.service';
import { WorkspaceBackendService } from './workspace-backend.service';

describe('RichNoteTagsService', () => {
  let service: RichNoteTagsService;
  let backendServiceMock: jest.Mocked<WorkspaceBackendService>;

  const mockTags: UnitRichNoteTagDto[] = [
    {
      id: 'tag1',
      label: [{ lang: 'de', value: 'Label 1' }],
      children: [
        {
          id: 'child1',
          label: [{ lang: 'de', value: 'Label 1.1' }],
          children: []
        }
      ]
    }
  ];

  beforeEach(() => {
    backendServiceMock = createMock<WorkspaceBackendService>({
      getUnitRichNoteTags: jest.fn().mockReturnValue(of(mockTags))
    });

    TestBed.configureTestingModule({
      providers: [
        RichNoteTagsService,
        { provide: WorkspaceBackendService, useValue: backendServiceMock }
      ]
    });
    service = TestBed.inject(RichNoteTagsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load tags on initialization', done => {
    service.tags$.subscribe(tags => {
      expect(tags).toEqual(mockTags);
      expect(backendServiceMock.getUnitRichNoteTags).toHaveBeenCalled();
      done();
    });
  });

  it('should get tag label by ID (recursive)', done => {
    service.tags$.subscribe(() => {
      const label = service.getTagLabel('child1');
      expect(label).toEqual([{ lang: 'de', value: 'Label 1.1' }]);
      done();
    });
  });

  it('should handle legacy dot-separated paths for labels', done => {
    service.tags$.subscribe(() => {
      const label = service.getTagLabel('tag1.child1');
      expect(label).toEqual([{ lang: 'de', value: 'Label 1.1' }]);
      done();
    });
  });

  it('should return empty array for non-existent tag', done => {
    service.tags$.subscribe(() => {
      const label = service.getTagLabel('non-existent');
      expect(label).toEqual([]);
      done();
    });
  });
});
