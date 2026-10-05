import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UnitMetadataToDeleteService } from './unit-metadata-to-delete.service';
import UnitMetadataToDelete from '../entities/unit-metadata-to-delete.entity';

describe('UnitMetadataToDeleteService', () => {
  let service: UnitMetadataToDeleteService;
  let repository: Repository<UnitMetadataToDelete>;

  const mockRepository = {
    upsert: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn()
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
        expect.objectContaining({
          unitId,
          createdAt: expect.any(Date),
          changedAt: expect.any(Date)
        }),
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

  describe('findMarkedUnitIds', () => {
    it('should answer which of the given units carry the marker, in one query', async () => {
      mockRepository.find.mockResolvedValue([{ unitId: 2 }] as UnitMetadataToDelete[]);

      const result = await service.findMarkedUnitIds([1, 2]);

      expect(repository.find).toHaveBeenCalledWith({ where: { unitId: In([1, 2]) }, select: { unitId: true } });
      expect(result).toEqual(new Set([2]));
    });

    it('should not query for an empty list', async () => {
      mockRepository.find.mockClear();

      expect(await service.findMarkedUnitIds([])).toEqual(new Set());
      expect(repository.find).not.toHaveBeenCalled();
    });
  });
});
