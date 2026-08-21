import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto, UserFullDto, UserWorkspaceAccessDto
} from '@studio-lite-lib/api-dto';
import { UsersService } from './users.service';
import User from '../entities/user.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import Workspace from '../entities/workspace.entity';
import UserSession from '../entities/user-session.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { ACTIVE_THRESHOLD_MS, PASSIVE_THRESHOLD_MS } from '../app.constants';
import Unit from '../entities/unit.entity';
import { UnitService } from './unit.service';
import { UnitUserService } from './unit-user.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let workspaceUsersRepository: Repository<WorkspaceUser>;
  let workspaceGroupAdminRepository: Repository<WorkspaceGroupAdmin>;

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  });

  const mockUnitService = {
    findAllForWorkspace: jest.fn()
  };

  const mockUnitUserService = {
    findByUnitId: jest.fn(),
    deleteUnitUsersByWorkspaceId: jest.fn(),
    createUnitUser: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        { provide: getRepositoryToken(WorkspaceUser), useFactory: mockRepository },
        { provide: getRepositoryToken(WorkspaceGroupAdmin), useFactory: mockRepository },
        { provide: getRepositoryToken(Workspace), useFactory: mockRepository },
        { provide: getRepositoryToken(UserSession), useFactory: mockRepository },
        { provide: getRepositoryToken(RefreshToken), useFactory: mockRepository },
        { provide: UnitService, useValue: mockUnitService },
        { provide: UnitUserService, useValue: mockUnitUserService }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    workspaceUsersRepository = module.get<Repository<WorkspaceUser>>(getRepositoryToken(WorkspaceUser));
    workspaceGroupAdminRepository = module
      .get<Repository<WorkspaceGroupAdmin>>(getRepositoryToken(WorkspaceGroupAdmin));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      const users = [{ id: 1, name: 'user1' }] as User[];
      jest.spyOn(usersRepository, 'find').mockResolvedValue(users);

      const result = await service.findAllUsers();

      expect(usersRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should filter by workspaceId', async () => {
      const workspaceId = 1;
      const workspaceUsers = [{ userId: 1, accessLevel: 1 }] as WorkspaceUser[];
      const users = [{ id: 1, name: 'user1' }, { id: 2, name: 'user2' }] as User[];

      jest.spyOn(workspaceUsersRepository, 'find').mockResolvedValue(workspaceUsers);
      jest.spyOn(usersRepository, 'find').mockResolvedValue(users);

      const result = await service.findAllUsers(workspaceId);

      expect(workspaceUsersRepository.find).toHaveBeenCalledWith({ where: { workspaceId } });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('findAllWorkspaceGroupAdmins', () => {
    it('should return admins for group', async () => {
      const groupId = 1;
      const groupAdmins = [{ userId: 1 }] as WorkspaceGroupAdmin[];
      const users = [{ id: 1, name: 'admin' }, { id: 2, name: 'user' }] as User[];

      jest.spyOn(workspaceGroupAdminRepository, 'find').mockResolvedValue(groupAdmins);
      jest.spyOn(usersRepository, 'find').mockResolvedValue(users);

      const result = await service.findAllWorkspaceGroupAdmins(groupId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return user dto', async () => {
      const user = { id: 1, name: 'u1' } as User;
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      const dto = { name: 'u1', password: 'p1' } as CreateUserDto;
      const savedUser = { id: 1, ...dto } as User;

      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed');
      jest.spyOn(usersRepository, 'create').mockReturnValue(savedUser);
      jest.spyOn(usersRepository, 'save').mockResolvedValue(savedUser);

      const result = await service.create(dto);

      expect(result).toBe(1);
      expect(usersRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUserByNameAndPassword', () => {
    it('should return userId if valid', async () => {
      const user = { id: 1, password: 'hashed' } as User;
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const result = await service.getUserByNameAndPassword('u1', 'p1');
      expect(result).toBe(1);
    });

    it('should return null if invalid', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      const result = await service.getUserByNameAndPassword('u1', 'p1');
      expect(result).toBeNull();
    });
  });

  describe('setPassword', () => {
    it('should set password if old matches', async () => {
      const userId = 1;
      const userForName = { name: 'u1' } as User;
      const userForId = { id: 1, password: 'old' } as User;

      jest.spyOn(usersRepository, 'findOne')
        .mockResolvedValueOnce(userForName) // for find name
        .mockResolvedValueOnce({ id: 1, password: 'hashed' } as User) // for verify (inside getUserByNameAndPassword)
        .mockResolvedValueOnce(userForId); // for update

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('new_hash');

      const result = await service.setPassword(userId, 'old', 'new');

      expect(result).toBe(true);
      expect(usersRepository.save).toHaveBeenCalled();
    });
  });

  describe('canAccessWorkSpace', () => {
    it('should return true if workspace user', async () => {
      jest.spyOn(workspaceUsersRepository, 'findOne').mockResolvedValue({} as WorkspaceUser);
      const result = await service.canAccessWorkSpace(1, 1);
      expect(result).toBe(true);
    });
  });

  describe('patch', () => {
    it('should update user', async () => {
      const userId = 1;
      const dto = { name: 'new', id: userId } as UserFullDto;
      const user = { id: userId, name: 'old' } as User;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);

      await service.patch(userId, dto);

      expect(user.name).toBe('new');
      expect(usersRepository.save).toHaveBeenCalled();
    });
  });

  describe('setUsersByWorkspace', () => {
    it('should update workspace users', async () => {
      const workspaceId = 1;
      const startUsers: UserWorkspaceAccessDto[] = [{ id: 1, accessLevel: 1 }];
      const units: Unit[] = [{ id: 10 } as Unit];
      const unitUsers = [{ userId: 1, unitId: 10 }];

      mockUnitService.findAllForWorkspace.mockResolvedValue(units);
      mockUnitUserService.findByUnitId.mockResolvedValue(unitUsers);
      jest.spyOn(workspaceUsersRepository, 'delete').mockResolvedValue({ affected: 1 } as DeleteResult);
      jest.spyOn(workspaceUsersRepository, 'save').mockResolvedValue([] as unknown as WorkspaceUser);

      await service.setUsersByWorkspace(workspaceId, startUsers);

      expect(workspaceUsersRepository.delete).toHaveBeenCalledWith({ workspaceId });
      expect(workspaceUsersRepository.save).toHaveBeenCalled();
    });
  });

  describe('isUserLoggedIn', () => {
    // Rows are built the way the API writes them: expiresAt is always
    // lastActivity + PASSIVE_THRESHOLD_MS.
    const sessionRow = (activityAgeMs: number): UserSession => {
      const lastActivity = new Date(Date.now() - activityAgeMs);
      return {
        userId: 1,
        sessionId: 'sid-1',
        lastActivity,
        expiresAt: new Date(lastActivity.getTime() + PASSIVE_THRESHOLD_MS)
      } as UserSession;
    };

    const givenSessions = (sessions: UserSession[], liveTokenSessionIds: string[] = []): void => {
      const repositories = service as unknown as {
        userSessionRepository: Repository<UserSession>,
        refreshTokenRepository: Repository<RefreshToken>
      };
      jest.spyOn(repositories.userSessionRepository, 'find').mockResolvedValue(sessions);
      jest.spyOn(repositories.refreshTokenRepository, 'find').mockResolvedValue(
        liveTokenSessionIds.map(sessionId => ({ sessionId } as RefreshToken))
      );
    };

    it('should return true while someone is interacting with the session', async () => {
      givenSessions([sessionRow(0)]);

      const result = await service.isUserLoggedIn(1);
      expect(result).toBe(true);
    });

    it('should return false if the session row has expired', async () => {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() - 10);
      givenSessions([
        {
          userId: 1, sessionId: 'sid-1', expiresAt, lastActivity: new Date()
        } as UserSession
      ], ['sid-1']);

      const result = await service.isUserLoggedIn(1);
      expect(result).toBe(false);
    });

    // The ordinary closed browser: unused for hours, but its refresh token still opens it,
    // so this is a login someone can return to and not an orphaned row.
    it('should return true for an idle session an unexpired refresh token can resume', async () => {
      givenSessions([sessionRow(ACTIVE_THRESHOLD_MS + 1000)], ['sid-1']);

      const result = await service.isUserLoggedIn(1);
      expect(result).toBe(true);
    });

    // Nothing can reach this session any more: too long since the last interaction for an
    // access token, and no unexpired refresh token left.
    it('should return false for a session no token can resume', async () => {
      givenSessions([sessionRow(ACTIVE_THRESHOLD_MS + 1000)], []);

      const result = await service.isUserLoggedIn(1);
      expect(result).toBe(false);
    });
  });

  describe('updateLastActivity', () => {
    it('should scope the update to the given session', async () => {
      const userSessionRepository = (service as unknown as {
        userSessionRepository: Repository<UserSession>
      }).userSessionRepository;
      const updateSpy = jest.spyOn(userSessionRepository, 'update');

      await service.updateLastActivity(1, 'session-1');

      expect(updateSpy).toHaveBeenCalledWith(
        { userId: 1, sessionId: 'session-1' },
        expect.objectContaining({
          lastActivity: expect.any(Date),
          expiresAt: expect.any(Date)
        })
      );
    });

    it('should keep expiresAt one inactivity window ahead of lastActivity', async () => {
      const userSessionRepository = (service as unknown as {
        userSessionRepository: Repository<UserSession>
      }).userSessionRepository;
      const updateSpy = jest.spyOn(userSessionRepository, 'update');

      await service.updateLastActivity(1, 'session-1');

      const values = updateSpy.mock.calls[0][1] as { lastActivity: Date, expiresAt: Date };
      expect(values.expiresAt.getTime() - values.lastActivity.getTime()).toBe(PASSIVE_THRESHOLD_MS);
    });

    it('should never touch any session when no sessionId is provided', async () => {
      const userSessionRepository = (service as unknown as {
        userSessionRepository: Repository<UserSession>
      }).userSessionRepository;
      const updateSpy = jest.spyOn(userSessionRepository, 'update');

      await service.updateLastActivity(1);

      expect(updateSpy).not.toHaveBeenCalled();
    });
  });
});
