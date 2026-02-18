import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkspaceGroupDto, WorkspaceGroupFullDto, WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { WorkspaceGroupService } from './workspace-group.service';
import WorkspaceGroup from '../entities/workspace-group.entity';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';

describe('WorkspaceGroupService', () => {
  let service: WorkspaceGroupService;
  let groupRepository: Repository<WorkspaceGroup>;
  let groupAdminRepository: Repository<WorkspaceGroupAdmin>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceGroupService,
        {
          provide: getRepositoryToken(WorkspaceGroup),
          useValue: mockRepository
        },
        {
          provide: getRepositoryToken(WorkspaceGroupAdmin),
          useValue: mockRepository
        }
      ]
    }).compile();

    service = module.get<WorkspaceGroupService>(WorkspaceGroupService);
    groupRepository = module.get<Repository<WorkspaceGroup>>(getRepositoryToken(WorkspaceGroup));
    groupAdminRepository = module.get<Repository<WorkspaceGroupAdmin>>(getRepositoryToken(WorkspaceGroupAdmin));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all groups if no user provided', async () => {
      const groups = [{ id: 1, name: 'g1' }] as WorkspaceGroup[];
      mockRepository.find.mockResolvedValue(groups);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should filter by user access', async () => {
      const userId = 1;
      const adminEntries = [{ workspaceGroupId: 1 }] as WorkspaceGroupAdmin[];
      const groups = [{ id: 1, name: 'g1' }, { id: 2, name: 'g2' }] as WorkspaceGroup[];

      // Mock for groupAdminRepository.find
      mockRepository.find.mockImplementation(args => {
        if (args && args.where && args.where.userId) return Promise.resolve(adminEntries);
        return Promise.resolve(groups);
      });

      const result = await service.findAll(userId);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return group', async () => {
      const group = { id: 1, name: 'g1' } as WorkspaceGroup;
      mockRepository.findOne.mockResolvedValue(group);

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should throw if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create group', async () => {
      const dto = { name: 'g1', settings: {} } as CreateWorkspaceGroupDto;
      const saved = { id: 1, ...dto } as WorkspaceGroup;
      mockRepository.create.mockReturnValue(saved);
      mockRepository.save.mockResolvedValue(saved);

      const result = await service.create(dto);
      expect(result).toBe(1);
    });
  });

  describe('patch', () => {
    it('should update group', async () => {
      const group = { id: 1, name: 'old' } as WorkspaceGroup;
      mockRepository.findOne.mockResolvedValue(group);

      const settings: WorkspaceGroupSettingsDto = { defaultEditor: 'e', defaultPlayer: 'p', defaultSchemer: 's' };
      const dto: WorkspaceGroupFullDto = { id: 1, name: 'new', settings };

      await service.patch(1, dto);
      expect(group.name).toBe('new');
      expect(groupRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete group', async () => {
      await service.remove([1]);
      expect(groupRepository.delete).toHaveBeenCalledWith([1]);
    });
  });

  describe('setWorkspaceGroupAdminsByUser', () => {
    it('should update group admins', async () => {
      const userId = 1;
      const groups = [10];
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.setWorkspaceGroupAdminsByUser(userId, groups);

      expect(groupAdminRepository.delete).toHaveBeenCalledWith({ userId });
      expect(groupAdminRepository.save).toHaveBeenCalled();
    });
  });
});
