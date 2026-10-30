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

    // An empty selection must not fall through to "all groups".
    it('should return no group to a user who administers none', async () => {
      mockRepository.find.mockImplementation(args => Promise.resolve(
        args?.where?.userId ? [] : [{ id: 1, name: 'g1' }] as WorkspaceGroup[]
      ));

      expect(await service.findAll(1)).toEqual([]);
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
    // #1570: a group can be created with a profile selection in the same request,
    // so this path must canonicalize just like patch does.
    it('canonicalizes the profile selection ids of a new group', async () => {
      mockRepository.create.mockImplementation(group => group as WorkspaceGroup);
      mockRepository.save.mockResolvedValue({ id: 7 } as WorkspaceGroup);

      await service.create({
        name: 'neu',
        settings: {
          profiles: [
            { id: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json', label: 'MA unit' },
            { id: 'https://example.org/own/profile.json', label: 'eigenes' }
          ]
        }
      } as CreateWorkspaceGroupDto);

      expect(groupRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: expect.objectContaining({
            profiles: [
              { id: 'https://w3id.org/iqb/p11/unit/', label: 'MA unit' },
              { id: 'https://example.org/own/profile.json', label: 'eigenes' }
            ]
          })
        })
      );
    });

    // Nothing validates the body: an id sent along had save overwrite that group (#2030)
    it('should take nothing from the body but the name and the settings', async () => {
      mockRepository.create.mockImplementation(group => group as WorkspaceGroup);
      mockRepository.save.mockResolvedValue({ id: 7 } as WorkspaceGroup);
      const body: CreateWorkspaceGroupDto & { id: number } = { name: 'neu', settings: {}, id: 99 };

      await service.create(body);

      expect(mockRepository.create.mock.calls[0][0]).toEqual({ name: 'neu', settings: {} });
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

    // #1570: the group's profile selection feeds every workspace's profile pick,
    // and those are compared exactly.
    it('canonicalizes the profile selection ids before storing them', async () => {
      const group = { id: 1, name: 'g' } as WorkspaceGroup;
      mockRepository.findOne.mockResolvedValue(group);

      const settings: WorkspaceGroupSettingsDto = {
        defaultEditor: '',
        defaultPlayer: '',
        defaultSchemer: '',
        profiles: [
          { id: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json', label: 'MA unit' },
          { id: 'https://w3id.org/iqb/p11/item', label: 'MA item' },
          { id: 'https://example.org/own/profile.json', label: 'eigenes' }
        ]
      };

      await service.patch(1, { id: 1, name: 'g', settings } as WorkspaceGroupFullDto);

      expect((group.settings as WorkspaceGroupSettingsDto).profiles).toEqual([
        { id: 'https://w3id.org/iqb/p11/unit/', label: 'MA unit' },
        { id: 'https://w3id.org/iqb/p11/item/', label: 'MA item' },
        { id: 'https://example.org/own/profile.json', label: 'eigenes' }
      ]);
    });

    it('leaves settings without a profile selection untouched', async () => {
      const group = { id: 1, name: 'g' } as WorkspaceGroup;
      mockRepository.findOne.mockResolvedValue(group);

      const settings: WorkspaceGroupSettingsDto = {
        defaultEditor: 'e', defaultPlayer: 'p', defaultSchemer: 's'
      };

      await service.patch(1, { id: 1, name: 'g', settings } as WorkspaceGroupFullDto);

      expect(group.settings).toMatchObject({ defaultEditor: 'e' });
    });

    // A rename and a change of the settings are sent on their own; neither may reset the other (#1960).
    it('should keep the name when only settings are sent, and add them to the stored ones', async () => {
      const group = { id: 1, name: 'g', settings: { defaultEditor: 'e' } } as WorkspaceGroup;
      mockRepository.findOne.mockResolvedValue(group);

      await service.patch(1, { id: 1, settings: { defaultPlayer: 'p' } } as WorkspaceGroupFullDto);

      expect(group.name).toBe('g');
      expect(group.settings).toEqual({ defaultEditor: 'e', defaultPlayer: 'p' });
    });

    it('should keep the settings when only the name is sent', async () => {
      const group = { id: 1, name: 'g', settings: { defaultEditor: 'e' } } as WorkspaceGroup;
      mockRepository.findOne.mockResolvedValue(group);

      await service.patch(1, { id: 1, name: 'neu' } as WorkspaceGroupFullDto);

      expect(group.name).toBe('neu');
      expect(group.settings).toEqual({ defaultEditor: 'e' });
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
