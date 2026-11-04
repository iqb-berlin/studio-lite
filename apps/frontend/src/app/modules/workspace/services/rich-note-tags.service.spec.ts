import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
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

  it('should load the tags once and then hand out those it holds', () => {
    service.tags$.subscribe();
    const tags = jest.fn();

    service.tags$.subscribe(tags);

    expect(backendServiceMock.getUnitRichNoteTags).toHaveBeenCalledTimes(1);
    expect(tags).toHaveBeenCalledWith(mockTags);
  });

  it('should give an empty list while the tags are on their way', () => {
    backendServiceMock.getUnitRichNoteTags.mockReturnValue(new Subject<UnitRichNoteTagDto[]>());
    const tags = jest.fn();

    service.tags$.subscribe(tags);

    expect(tags).toHaveBeenCalledWith([]);
    expect(service.tags).toEqual([]);
  });

  it('should ask once for the tags of a group still on their way, and anew for another group', () => {
    backendServiceMock.getUnitRichNoteTags.mockReturnValue(new Subject<UnitRichNoteTagDto[]>());

    service.loadTags(3);
    service.loadTags(3);
    service.loadTags(4);

    expect(backendServiceMock.getUnitRichNoteTags.mock.calls).toEqual([[3], [4]]);
  });

  // Notes opened by a link ask for the tags before the workspace is in, and so before its group is
  // known; that answer came last and replaced the tags of the group (#2008).
  it('should keep the tags of the group when an earlier request answers last', () => {
    const withoutGroup = new Subject<UnitRichNoteTagDto[]>();
    const ofGroup = new Subject<UnitRichNoteTagDto[]>();
    backendServiceMock.getUnitRichNoteTags
      .mockImplementation(groupId => (groupId === 3 ? ofGroup : withoutGroup));
    const groupTags = [{ id: 'group', label: [{ lang: 'de', value: 'Gruppe' }], children: [] }];

    service.loadTags();
    service.loadTags(3);
    ofGroup.next(groupTags);
    withoutGroup.next(mockTags);

    expect(service.tags).toEqual(groupTags);
  });
});
