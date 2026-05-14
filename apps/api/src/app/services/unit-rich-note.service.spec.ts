import { Repository } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnitRichNoteService } from './unit-rich-note.service';
import UnitRichNote from '../entities/unit-rich-note.entity';
import Workspace from '../entities/workspace.entity';
import Unit from '../entities/unit.entity';
import { ItemRichNoteService } from './item-rich-note.service';
import { UnitService } from './unit.service';
import { SettingService } from './setting.service';

describe('UnitRichNoteService', () => {
  let service: UnitRichNoteService;
  let unitRichNoteRepository: DeepMocked<Repository<UnitRichNote>>;
  let workspaceRepository: DeepMocked<Repository<Workspace>>;
  let itemRichNoteService: DeepMocked<ItemRichNoteService>;
  let unitService: DeepMocked<UnitService>;
  let settingService: DeepMocked<SettingService>;

  beforeEach(async () => {
    unitRichNoteRepository = createMock<Repository<UnitRichNote>>();
    workspaceRepository = createMock<Repository<Workspace>>();
    itemRichNoteService = createMock<ItemRichNoteService>();
    unitService = createMock<UnitService>();
    settingService = createMock<SettingService>();
    settingService.findUnitRichNoteTags.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitRichNoteService,
        { provide: getRepositoryToken(UnitRichNote), useValue: unitRichNoteRepository },
        { provide: getRepositoryToken(Workspace), useValue: workspaceRepository },
        { provide: ItemRichNoteService, useValue: itemRichNoteService },
        { provide: UnitService, useValue: unitService },
        { provide: SettingService, useValue: settingService }
      ]
    }).compile();

    service = module.get<UnitRichNoteService>(UnitRichNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importNotes', () => {
    it('should map old item references to new item references and strip tagLabel', async () => {
      jest.spyOn(service, 'createNote').mockResolvedValue(1);

      const notes = [
        {
          tagId: 'tag.1',
          tagLabel: 'Tag Label',
          content: 'Some note',
          links: [],
          itemUuids: ['old-uuid-1']
        }
      ];
      const lookups = [
        { oldUuid: 'old-uuid-1', newUuid: 'new-uuid-1' }
      ];

      await service.importNotes(notes, 10, lookups);

      expect(service.createNote).toHaveBeenCalledWith({
        unitId: 10,
        tagId: 'tag.1',
        content: 'Some note',
        links: [],
        itemReferences: ['new-uuid-1']
      });
    });
  });

  describe('findNotes', () => {
    it('should use group-specific tags if available', async () => {
      const unit = { id: 100, workspaceId: 1 } as unknown as Unit;
      const workspace = { id: 1, groupId: 2 } as unknown as Workspace;
      unitService.findOne.mockResolvedValueOnce(unit);
      workspaceRepository.findOneBy.mockResolvedValueOnce(workspace);

      const tags = [{ id: 'group.tag', label: [{ lang: 'de', value: 'Group Tag' }] }];
      settingService.findUnitRichNoteTags.mockResolvedValueOnce(tags);
      unitRichNoteRepository.find.mockResolvedValueOnce([]);

      const result = await service.findNotes(100);

      expect(result.tags).toEqual(tags);
      expect(settingService.findUnitRichNoteTags).toHaveBeenCalledWith(2);
    });
  });
});
