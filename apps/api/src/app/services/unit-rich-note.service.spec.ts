import { NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
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

    it('should leave out an item the import does not bring, and link a note without items to none', async () => {
      const createNote = jest.spyOn(service, 'createNote').mockResolvedValue(1);

      await service.importNotes([
        { tagId: 'a', content: 'x', itemUuids: ['old-1', 'not-imported'] },
        { tagId: 'b', content: 'y' }
      ], 10, [{ oldUuid: 'old-1', newUuid: 'new-1' }]);

      expect(createNote.mock.calls.map(([note]) => note.itemReferences)).toStrictEqual([['new-1'], []]);
    });
  });

  describe('createNote', () => {
    beforeEach(() => {
      unitRichNoteRepository.create.mockImplementation((note: Partial<UnitRichNote>) => note as UnitRichNote);
      unitRichNoteRepository.save.mockImplementation(
        (note: UnitRichNote) => Promise.resolve(Object.assign(note, { id: 7 }))
      );
    });

    it.each([
      [['u1'], [[10, 7, ['u1']]]],
      [[], []]
    ])('should link the note to the items %p it refers to', async (itemReferences, links) => {
      await service.createNote({
        unitId: 10, tagId: 't', content: 'c', itemReferences
      });

      expect(itemRichNoteService.updateNoteItems.mock.calls).toEqual(links);
    });
  });

  it.each([
    ['findOneNote', () => service.findOneNote(9)],
    ['patchNote', () => service.patchNote(9, { content: 'x' })]
  ])('%s should answer an unknown note with not found', async (_, call) => {
    unitRichNoteRepository.findOne.mockResolvedValue(null);

    await expect(call()).rejects.toThrow(NotFoundException);
  });

  describe('patchNote', () => {
    const links = [{ url: 'https://example.org', label: 'Beispiel' }];
    let note: UnitRichNote;

    beforeEach(() => {
      note = {
        id: 7, unitId: 10, tagId: 't', content: 'c', links
      } as UnitRichNote;
      unitRichNoteRepository.findOne.mockResolvedValue(note);
    });

    it('should change only what is sent, and the item links only when references are sent', async () => {
      await service.patchNote(7, { content: 'neu' });

      expect(note).toEqual(expect.objectContaining({ tagId: 't', content: 'neu', links }));
      expect(itemRichNoteService.updateNoteItems).not.toHaveBeenCalled();
    });

    it('should take an empty list of references as unlinking every item', async () => {
      await service.patchNote(7, { itemReferences: [] });

      expect(itemRichNoteService.updateNoteItems).toHaveBeenCalledWith(10, 7, []);
    });
  });

  describe('findUnitIdsWithNotes', () => {
    it('should answer which of the given units have rich notes', async () => {
      unitRichNoteRepository.find.mockResolvedValueOnce([{ unitId: 2 }, { unitId: 2 }] as UnitRichNote[]);

      const result = await service.findUnitIdsWithNotes([1, 2]);

      expect(result).toEqual(new Set([2]));
      expect(unitRichNoteRepository.find).toHaveBeenCalledWith({
        where: { unitId: In([1, 2]) },
        select: { unitId: true }
      });
    });

    it('should not query for an empty list', async () => {
      expect(await service.findUnitIdsWithNotes([])).toEqual(new Set());
      expect(unitRichNoteRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('isInUnit', () => {
    it('should ask for the note in the unit', async () => {
      unitRichNoteRepository.exists.mockResolvedValue(true);

      expect(await service.isInUnit(7, 10)).toBe(true);
      expect(unitRichNoteRepository.exists).toHaveBeenCalledWith({ where: { id: 7, unitId: 10 } });
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
