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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all unit item metadata', async () => {
      const mockData = [{ id: 1, unitItemUuid: 'uuid-1' }] as UnitItemMetadata[];
      mockRepository.find.mockResolvedValue(mockData);

      const result = await service.getAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getAllByItemId', () => {
    it('should return metadata for specific item uuid', async () => {
      const uuid = 'uuid-1';
      const mockData = [{ id: 1, unitItemUuid: uuid }] as UnitItemMetadata[];
      mockRepository.findBy.mockResolvedValue(mockData);

      const result = await service.getAllByItemId(uuid);

      expect(repository.findBy).toHaveBeenCalledWith({ unitItemUuid: uuid });
      expect(result).toEqual(mockData);
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

      expect(repository.update).toHaveBeenCalledWith(id, dto);
      expect(result).toBe(id);
    });
  });

  describe('removeItemMetadata', () => {
    it('should delete metadata by id', async () => {
      const id = 123;

      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeItemMetadata(id);

      expect(repository.delete).toHaveBeenCalledWith(id);
    });
  });
});
