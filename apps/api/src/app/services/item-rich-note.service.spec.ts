import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemRichNoteService } from './item-rich-note.service';
import UnitRichNoteUnitItem from '../entities/unit-rich-note-unit-item.entity';
import UnitRichNote from '../entities/unit-rich-note.entity';
import UnitItem from '../entities/unit-item.entity';
import { UnitItemNotFoundException } from '../exceptions/unit-item-not-found.exception';

describe('ItemRichNoteService', () => {
  let service: ItemRichNoteService;
  let unitRichNoteUnitItemRepository: DeepMocked<Repository<UnitRichNoteUnitItem>>;
  let unitRichNotesRepository: DeepMocked<Repository<UnitRichNote>>;
  let unitItemRepository: DeepMocked<Repository<UnitItem>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemRichNoteService,
        {
          provide: getRepositoryToken(UnitRichNoteUnitItem),
          useValue: createMock<Repository<UnitRichNoteUnitItem>>()
        },
        {
          provide: getRepositoryToken(UnitRichNote),
          useValue: createMock<Repository<UnitRichNote>>()
        },
        {
          provide: getRepositoryToken(UnitItem),
          useValue: createMock<Repository<UnitItem>>()
        }
      ]
    }).compile();

    service = module.get<ItemRichNoteService>(ItemRichNoteService);
    unitRichNoteUnitItemRepository = module.get(getRepositoryToken(UnitRichNoteUnitItem));
    unitRichNotesRepository = module.get(getRepositoryToken(UnitRichNote));
    unitItemRepository = module.get(getRepositoryToken(UnitItem));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNoteItemConnection', () => {
    beforeEach(() => {
      unitRichNotesRepository.findOne.mockResolvedValue(createMock<UnitRichNote>({ id: 7, unitId: 10 }));
      unitItemRepository.findOne.mockResolvedValue(createMock<UnitItem>({ uuid: 'uuid-1', unitId: 10 }));
      unitRichNoteUnitItemRepository.findOne.mockResolvedValue(null);
      unitRichNoteUnitItemRepository.create.mockImplementation(link => link as UnitRichNoteUnitItem);
    });

    it('should link an item of the unit to the note', async () => {
      expect(await service.createNoteItemConnection(10, 'uuid-1', 7)).toBe(7);
      expect(unitRichNoteUnitItemRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ unitRichNoteId: 7, unitItemUuid: 'uuid-1', unitId: 10 })
      );
    });

    it('should look for the item in the unit only', async () => {
      await service.createNoteItemConnection(10, 'uuid-1', 7);

      expect(unitItemRepository.findOne).toHaveBeenCalledWith({ where: { uuid: 'uuid-1', unitId: 10 } });
    });

    it('should not link an item that is not found in the unit', async () => {
      unitItemRepository.findOne.mockResolvedValue(null);

      await expect(service.createNoteItemConnection(10, 'uuid-of-another-unit', 7))
        .rejects.toThrow(UnitItemNotFoundException);
      expect(unitRichNoteUnitItemRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for a note that does not exist', async () => {
      unitRichNotesRepository.findOne.mockResolvedValue(null);

      await expect(service.createNoteItemConnection(10, 'uuid-1', 7)).rejects.toThrow(NotFoundException);
      expect(unitRichNoteUnitItemRepository.save).not.toHaveBeenCalled();
    });

    it('should not link an item twice', async () => {
      unitRichNoteUnitItemRepository.findOne.mockResolvedValue(createMock<UnitRichNoteUnitItem>());

      expect(await service.createNoteItemConnection(10, 'uuid-1', 7)).toBe(7);
      expect(unitRichNoteUnitItemRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateNoteItems', () => {
    it('should leave an item of another unit unlinked and link the others', async () => {
      unitRichNoteUnitItemRepository.find.mockResolvedValue([]);
      unitRichNotesRepository.findOne.mockResolvedValue(createMock<UnitRichNote>({ id: 7, unitId: 10 }));
      unitItemRepository.findOne.mockImplementation(async ({ where }) => (
        (where as { uuid: string }).uuid === 'uuid-1' ? createMock<UnitItem>({ uuid: 'uuid-1', unitId: 10 }) : null
      ));
      unitRichNoteUnitItemRepository.findOne.mockResolvedValue(null);
      unitRichNoteUnitItemRepository.create.mockImplementation(link => link as UnitRichNoteUnitItem);

      await service.updateNoteItems(10, 7, ['uuid-1', 'uuid-of-another-unit']);

      expect(unitRichNoteUnitItemRepository.save).toHaveBeenCalledTimes(1);
      expect(unitRichNoteUnitItemRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ unitItemUuid: 'uuid-1' })
      );
    });
  });
});
