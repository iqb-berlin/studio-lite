import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { UnitMetadataService } from './unit-metadata.service';
import UnitMetadata from '../entities/unit-metadata.entity';

describe('UnitMetadataService', () => {
  let service: UnitMetadataService;
  let repository: Repository<UnitMetadata>;

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
        UnitMetadataService,
        {
          provide: getRepositoryToken(UnitMetadata),
          useValue: mockRepository
        }
      ]
    }).compile();

    service = module.get<UnitMetadataService>(UnitMetadataService);
    repository = module.get<Repository<UnitMetadata>>(getRepositoryToken(UnitMetadata));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all unit metadata', async () => {
      const mockData = [{ id: 1, unitId: 1 }] as UnitMetadata[];
      mockRepository.find.mockResolvedValue(mockData);

      const result = await service.getAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('getAllByUnitId', () => {
    it('should return metadata for specific unit id', async () => {
      const unitId = 1;
      const mockData = [{ id: 1, unitId }] as UnitMetadata[];
      mockRepository.findBy.mockResolvedValue(mockData);

      const result = await service.getAllByUnitId(unitId);

      expect(repository.findBy).toHaveBeenCalledWith({ unitId });
      expect(result).toEqual(mockData);
    });
  });

  describe('addMetadata', () => {
    it('should add new metadata', async () => {
      const unitId = 1;
      const dto = {
        id: 0, profileId: 'profile1', key: 'key1', value: 'val1', unitId: 0
      } as UnitMetadataDto;
      const createdEntity = { ...dto, unitId, id: 123 } as UnitMetadata;

      mockRepository.create.mockReturnValue(createdEntity);
      mockRepository.save.mockResolvedValue(createdEntity);

      const result = await service.addMetadata(unitId, dto);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ profileId: 'profile1' }));
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toBe(123);
    });
  });

  describe('updateMetadata', () => {
    it('should update existing metadata', async () => {
      const id = 123;
      const dto = {
        id: 123, profileId: 'p1', key: 'k1', value: 'v2', unitId: 1
      } as UnitMetadataDto;

      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updateMetadata(id, dto);

      expect(repository.update).toHaveBeenCalledWith(id, dto);
      expect(result).toBe(id);
    });
  });

  describe('removeMetadata', () => {
    it('should delete metadata by id', async () => {
      const id = 123;

      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeMetadata(id);

      expect(repository.delete).toHaveBeenCalledWith(id);
    });
  });
});
