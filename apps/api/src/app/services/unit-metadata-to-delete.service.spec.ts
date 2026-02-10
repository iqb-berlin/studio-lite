import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitMetadataToDeleteService } from './unit-metadata-to-delete.service';
import UnitMetadataToDelete from '../entities/unit-metadata-to-delete.entity';

describe('UnitMetadataToDeleteService', () => {
  let service: UnitMetadataToDeleteService;
  let repository: Repository<UnitMetadataToDelete>;

  const mockRepository = {
    upsert: jest.fn(),
    findOneBy: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitMetadataToDeleteService,
        {
          provide: getRepositoryToken(UnitMetadataToDelete),
          useValue: mockRepository
        }
      ]
    }).compile();

    service = module.get<UnitMetadataToDeleteService>(UnitMetadataToDeleteService);
    repository = module.get<Repository<UnitMetadataToDelete>>(getRepositoryToken(UnitMetadataToDelete));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertOneForUnit', () => {
    it('should upsert metadata to delete entry', async () => {
      const unitId = 1;
      mockRepository.upsert.mockResolvedValue(null);

      await service.upsertOneForUnit(unitId);

      expect(repository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ unitId }),
        ['unitId']
      );
    });
  });

  describe('getOneByUnit', () => {
    it('should return one entry by unitId', async () => {
      const unitId = 1;
      const mockResult = { unitId, changedAt: new Date() } as UnitMetadataToDelete;
      mockRepository.findOneBy.mockResolvedValue(mockResult);

      const result = await service.getOneByUnit(unitId);

      expect(repository.findOneBy).toHaveBeenCalledWith({ unitId });
      expect(result).toEqual(mockResult);
    });
  });
});
