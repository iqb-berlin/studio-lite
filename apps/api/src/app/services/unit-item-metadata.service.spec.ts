import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitItemMetadataDto } from '@studio-lite-lib/api-dto';
import { UnitItemMetadataService } from './unit-item-metadata.service';
import UnitItemMetadata from '../entities/unit-item-metadata.entity';

describe('UnitItemMetadataService', () => {
  let service: UnitItemMetadataService;
  let repository: Repository<UnitItemMetadata>;

  const mockRepository = {
    find: jest.fn(),
    findBy: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitItemMetadataService,
        {
          provide: getRepositoryToken(UnitItemMetadata),
          useValue: mockRepository
        }
      ]
    }).compile();

    service = module.get<UnitItemMetadataService>(UnitItemMetadataService);
    repository = module.get<Repository<UnitItemMetadata>>(getRepositoryToken(UnitItemMetadata));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isOfItem', () => {
    it('should ask for the row of the item', async () => {
      mockRepository.exists.mockResolvedValue(true);

      expect(await service.isOfItem(5, 'uuid-1')).toBe(true);
      expect(repository.exists).toHaveBeenCalledWith({ where: { id: 5, unitItemUuid: 'uuid-1' } });
    });
  });

  describe('addItemMetadata', () => {
    it('should add new metadata', async () => {
      const uuid = 'uuid-1';
      const dto = {
        id: 0, profileId: 'profile1', key: 'key1', value: 'val1', unitItemUuid: ''
      } as UnitItemMetadataDto;
      const createdEntity = { ...dto, unitItemUuid: uuid, id: 123 } as UnitItemMetadata;

      mockRepository.create.mockReturnValue(createdEntity);
      mockRepository.save.mockResolvedValue(createdEntity);

      const result = await service.addItemMetadata(uuid, dto);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ profileId: 'profile1' }));
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toBe(123);
    });
  });

  describe('updateItemMetadata', () => {
    it('should update existing metadata', async () => {
      const id = 123;
      const dto = {
        id: 123, profileId: 'p1', key: 'k1', value: 'v2', unitItemUuid: 'uuid-1'
      } as UnitItemMetadataDto;

      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateItemMetadata(id, dto);

      expect(repository.update).toHaveBeenCalledWith(
        id,
        expect.objectContaining({ profileId: 'p1', changedAt: expect.any(Date) })
      );
      expect(result).toBe(id);
    });

    it('should leave the row with its item, whatever unitItemUuid the payload names (#1816)', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateItemMetadata(123, { id: 123, profileId: 'p1', unitItemUuid: 'other' } as UnitItemMetadataDto);

      expect(repository.update).toHaveBeenCalledWith(123, expect.not.objectContaining({ unitItemUuid: 'other' }));
    });
  });
});
