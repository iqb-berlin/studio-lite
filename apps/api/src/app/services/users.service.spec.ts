import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { DeleteResult, EntityManager, Repository } from 'typeorm';
// `unstable_mockModule` is missing from the global `jest` object's type, so it comes from here.
// It is aliased because the global `jest` -- used for `jest.fn()` below -- types its mocks
// loosely, and importing over that name would make every `mockReturnValue` a type error.
import { jest as jestEsm } from '@jest/globals';
import {
  CreateUserDto, UserFullDto, UserWorkspaceAccessDto
} from '@studio-lite-lib/api-dto';
// The class itself arrives through the dynamic import below; this keeps its name usable as a
// type, which a `const` from `await import()` cannot be.
import type { UsersService } from './users.service';
import User from '../entities/user.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import Workspace from '../entities/workspace.entity';
import UserSession from '../entities/user-session.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { ACTIVE_THRESHOLD_MS, PASSIVE_THRESHOLD_MS } from '../app.constants';
import Unit from '../entities/unit.entity';
import { AdminUserNotFoundException } from '../exceptions/admin-user-not-found.exception';
import { UnitService } from './unit.service';
import { UnitUserService } from './unit-user.service';

// ESM module namespaces are frozen, so `jest.spyOn(bcrypt, …)` cannot replace an export after
// the fact. The two members the service uses are mocked before it is pulled in.
jestEsm.unstable_mockModule('bcrypt', () => ({
  hashSync: jest.fn(),
  compareSync: jest.fn()
}));

const bcrypt = await import('bcrypt');
const { UsersService: UsersServiceClass } = await import('./users.service');

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let workspaceUsersRepository: Repository<WorkspaceUser>;
  let workspaceGroupAdminRepository: Repository<WorkspaceGroupAdmin>;
  let workspaceRepository: Repository<Workspace>;
  let userSessionRepository: Repository<UserSession>;
  let refreshTokenRepository: Repository<RefreshToken>;

  // Rows are built the way the API writes them: expiresAt is always lastActivity + PASSIVE_THRESHOLD_MS.
  const sessionRow = (activityAgeMs: number, userId = 1, sessionId = 'sid-1'): UserSession => {
    const lastActivity = new Date(Date.now() - activityAgeMs);
    return {
      userId,
      sessionId,
      lastActivity,
      expiresAt: new Date(lastActivity.getTime() + PASSIVE_THRESHOLD_MS)
    } as UserSession;
  };

  const givenSessions = (sessions: UserSession[], liveTokenSessionIds: string[] = []): void => {
    jest.spyOn(userSessionRepository, 'find').mockResolvedValue(sessions);
    jest.spyOn(refreshTokenRepository, 'find').mockResolvedValue(
      liveTokenSessionIds.map(sessionId => ({ sessionId } as RefreshToken))
    );
  };

  // The first may have the email shown, the second not.
  const usersWithAndWithoutPublishedEmail = (): User[] => [
    {
      id: 1, name: 'a', email: 'a@x.de', emailPublishApproved: true
    },
    {
      id: 2, name: 'b', email: 'b@x.de', emailPublishApproved: false
    }
  ] as User[];

  // The transaction hands its callback a manager of its own; the administrators it finds are the
  // rows it locks.
  const givenLockedAdmins = (adminIds: number[]): DeepMocked<EntityManager> => {
    const manager = createMock<EntityManager>();
    manager.find.mockResolvedValue(adminIds.map(id => ({ id } as User)));
    Object.defineProperty(usersRepository, 'manager', {
      value: { transaction: (work: (transactionManager: EntityManager) => Promise<void>) => work(manager) },
      configurable: true
    });
    return manager;
  };

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
        UsersServiceClass,
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

    service = module.get<UsersService>(UsersServiceClass);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    workspaceUsersRepository = module.get<Repository<WorkspaceUser>>(getRepositoryToken(WorkspaceUser));
    workspaceGroupAdminRepository = module
      .get<Repository<WorkspaceGroupAdmin>>(getRepositoryToken(WorkspaceGroupAdmin));
    workspaceRepository = module.get<Repository<Workspace>>(getRepositoryToken(Workspace));
    userSessionRepository = module.get<Repository<UserSession>>(getRepositoryToken(UserSession));
    refreshTokenRepository = module.get<Repository<RefreshToken>>(getRepositoryToken(RefreshToken));
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    it('should mark an email that is not approved for publishing as hidden', async () => {
      jest.spyOn(usersRepository, 'find').mockResolvedValue(usersWithAndWithoutPublishedEmail());

      const result = await service.findAllUsers();

      expect(result.map(user => user.email)).toEqual(['a@x.de', 'b@x.de (verborgen)']);
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

    it('should leave out an email that is not approved for publishing', async () => {
      jest.spyOn(workspaceGroupAdminRepository, 'find')
        .mockResolvedValue([{ userId: 1 }, { userId: 2 }] as WorkspaceGroupAdmin[]);
      jest.spyOn(usersRepository, 'find').mockResolvedValue(usersWithAndWithoutPublishedEmail());

      const result = await service.findAllWorkspaceGroupAdmins(1);

      expect(result.map(user => user.email)).toEqual(['a@x.de', '']);
    });
  });

  describe('findAllWorkspaceUsers', () => {
    // Each user is listed once, under the highest of their roles; a user without a role there is not listed.
    it('should list each user under their highest role in the workspace', async () => {
      givenSessions([]);
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue({ groupId: 3 } as Workspace);
      jest.spyOn(workspaceGroupAdminRepository, 'find')
        .mockResolvedValue([{ userId: 1 }, { userId: 2 }] as WorkspaceGroupAdmin[]);
      jest.spyOn(workspaceUsersRepository, 'find')
        .mockResolvedValue([{ userId: 1 }, { userId: 2 }, { userId: 3 }] as WorkspaceUser[]);
      jest.spyOn(usersRepository, 'find').mockResolvedValue([
        { id: 1, name: 'admin', isAdmin: true },
        { id: 2, name: 'group admin', isAdmin: false },
        { id: 3, name: 'user', isAdmin: false },
        { id: 4, name: 'other', isAdmin: false }
      ] as User[]);

      const result = await service.findAllWorkspaceUsers(5);

      expect(result.admins.map(user => user.id)).toEqual([1]);
      expect(result.workspaceGroupAdmins.map(user => user.id)).toEqual([2]);
      expect(result.users.map(user => user.id)).toEqual([3]);
    });

    it('should leave out an email that is not approved for publishing', async () => {
      givenSessions([]);
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue({ groupId: 3 } as Workspace);
      jest.spyOn(workspaceGroupAdminRepository, 'find').mockResolvedValue([]);
      jest.spyOn(workspaceUsersRepository, 'find')
        .mockResolvedValue([{ userId: 1 }, { userId: 2 }] as WorkspaceUser[]);
      jest.spyOn(usersRepository, 'find').mockResolvedValue(usersWithAndWithoutPublishedEmail());

      const result = await service.findAllWorkspaceUsers(5);

      expect(result.users.map(user => user.email)).toEqual(['a@x.de', '']);
    });
  });

  describe('findAllFull', () => {
    beforeEach(() => {
      jest.spyOn(usersRepository, 'find').mockResolvedValue([{ id: 1 }] as User[]);
    });

    it('should show a user without a session as logged out and inactive', async () => {
      givenSessions([]);

      const [user] = await service.findAllFull();

      expect(user).toEqual(expect.objectContaining({
        isLoggedIn: false, activityStatus: 'inactive', sessions: [], lastActivity: undefined
      }));
    });

    // The last activity is that of any session; whether someone can still be working is
    // decided by the newest session a token can still reach.
    it('should take the last activity from the newest session and the status from the newest live one', async () => {
      const orphaned = sessionRow(ACTIVE_THRESHOLD_MS + 1000, 1, 'sid-orphaned');
      const passive = sessionRow(ACTIVE_THRESHOLD_MS + 5000, 1, 'sid-passive');
      givenSessions([passive, orphaned], ['sid-passive']);

      const [user] = await service.findAllFull();

      expect(user.lastActivity).toEqual(orphaned.lastActivity);
      expect(user.activityStatus).toBe('passive');
      expect(user.isLoggedIn).toBe(true);
      expect(user.sessions).toHaveLength(2);
    });

    it('should show a user whose sessions no token can reach as orphaned and logged out', async () => {
      givenSessions([sessionRow(ACTIVE_THRESHOLD_MS + 1000)]);

      const [user] = await service.findAllFull();

      expect(user.activityStatus).toBe('orphaned');
      expect(user.isLoggedIn).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return user dto', async () => {
      const user = { id: 1, name: 'u1' } as User;
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should throw for an unknown user', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(9)).rejects.toThrow(AdminUserNotFoundException);
    });
  });

  describe('getUserIsAdmin', () => {
    it('should not take an unknown user for an administrator', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      expect(await service.getUserIsAdmin(9)).toBe(false);
    });
  });

  describe('isWorkspaceGroupAdmin', () => {
    beforeEach(() => {
      const rows = [{ userId: 5, workspaceGroupId: 2 }] as WorkspaceGroupAdmin[];
      jest.spyOn(workspaceGroupAdminRepository, 'findOne').mockImplementation(async ({ where }) => rows
        .find(row => Object.entries(where).every(([key, value]) => row[key as keyof WorkspaceGroupAdmin] === value)) ??
        null);
    });

    it('should count only the group asked about', async () => {
      expect(await service.isWorkspaceGroupAdmin(5, 2)).toBe(true);
      expect(await service.isWorkspaceGroupAdmin(5, 3)).toBe(false);
    });

    it('should count any group when none is asked about', async () => {
      expect(await service.isWorkspaceGroupAdmin(5)).toBe(true);
      expect(await service.isWorkspaceGroupAdmin(6)).toBe(false);
    });
  });

  describe('create', () => {
    // A password is stored only as its hash (#1957).
    it('should store the hash of the password, not the password', async () => {
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hash-of-secret');
      jest.spyOn(usersRepository, 'create').mockImplementation(user => ({ id: 1, ...user }) as User);

      await service.create({ name: 'u1', password: 'secret' } as CreateUserDto);

      expect(bcrypt.hashSync).toHaveBeenCalledWith('secret', expect.any(Number));
      expect(usersRepository.save).toHaveBeenCalledWith(expect.objectContaining({ password: 'hash-of-secret' }));
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

    it('should keep the password if the old one is wrong', async () => {
      jest.spyOn(usersRepository, 'findOne')
        .mockResolvedValueOnce({ name: 'u1' } as User)
        .mockResolvedValueOnce({ id: 1, password: 'hashed' } as User);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      expect(await service.setPassword(1, 'wrong', 'new')).toBe(false);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('should refuse an unknown user', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      expect(await service.setPassword(9, 'old', 'new')).toBe(false);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('canAccessWorkSpace', () => {
    it('should return true if workspace user', async () => {
      jest.spyOn(workspaceUsersRepository, 'findOne').mockResolvedValue({} as WorkspaceUser);
      const result = await service.canAccessWorkSpace(1, 1);
      expect(result).toBe(true);
    });

    // An administrator enters every workspace without being assigned to it (#1571).
    it('should let an unassigned administrator in', async () => {
      jest.spyOn(workspaceUsersRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue({ groupId: 3 } as Workspace);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue({ isAdmin: true } as User);

      expect(await service.canAccessWorkSpace(5, 1)).toBe(true);
    });

    // It used to read `groupId` of a missing workspace and fail with a 500.
    it('should refuse a workspace that does not exist, to an administrator as well', async () => {
      jest.spyOn(workspaceUsersRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue({ isAdmin: true } as User);

      expect(await service.canAccessWorkSpace(5, 9988)).toBe(false);
    });

    it('should refuse an unassigned user who neither administers nor admins the group', async () => {
      jest.spyOn(workspaceUsersRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue({ isAdmin: false } as User);
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue({ groupId: 3 } as Workspace);
      jest.spyOn(workspaceGroupAdminRepository, 'findOne').mockResolvedValue(null);

      expect(await service.canAccessWorkSpace(5, 1)).toBe(false);
    });
  });

  describe('patch', () => {
    // the caller, an administrator the changes below leave alone
    const ownId = 9;

    it('should update user', async () => {
      const userId = 1;
      const dto = { name: 'new', id: userId } as UserFullDto;
      const user = { id: userId, name: 'old' } as User;
      const manager = givenLockedAdmins([ownId]);
      manager.findOne.mockResolvedValue(user);

      await service.patch(userId, dto, ownId);

      expect(user.name).toBe('new');
      expect(manager.save).toHaveBeenCalled();
    });

    // Leaving the administrator role out of a request must not take it away.
    it.each([
      [undefined, true],
      [false, false]
    ])('should take isAdmin %p of an administrator as %p', async (isAdmin, expected) => {
      const user = { id: 1, isAdmin: true } as User;
      givenLockedAdmins([1, ownId]).findOne.mockResolvedValue(user);

      await service.patch(1, { id: 1, isAdmin } as UserFullDto, ownId);

      expect(user.isAdmin).toBe(expected);
    });

    it('should store a new password as its hash and keep the fields sent empty', async () => {
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hash-of-new');
      const user = {
        id: 1, name: 'old', description: 'd', lastName: 'L', firstName: 'F', email: 'e@x.de'
      } as User;
      givenLockedAdmins([ownId]).findOne.mockResolvedValue(user);

      await service.patch(1, {
        id: 1, name: '', description: '', lastName: '', firstName: '', email: '', password: 'new'
      } as UserFullDto, ownId);

      expect(user).toEqual(expect.objectContaining({
        name: 'old', description: 'd', lastName: 'L', firstName: 'F', email: 'e@x.de', password: 'hash-of-new'
      }));
    });

    it('should throw for an unknown user', async () => {
      const manager = givenLockedAdmins([ownId]);
      manager.findOne.mockResolvedValue(null);

      await expect(service.patch(5, { id: 5, name: 'x' } as UserFullDto, ownId))
        .rejects.toThrow(AdminUserNotFoundException);
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('should refuse to take the administrator right from the own account and change nothing (#1950)', async () => {
      const manager = givenLockedAdmins([ownId, 3]);
      manager.findOne.mockResolvedValue({ id: ownId, isAdmin: true, name: 'old' } as User);

      await expect(service.patch(ownId, { id: ownId, isAdmin: false, name: 'new' } as UserFullDto, ownId))
        .rejects.toThrow(BadRequestException);
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('should change the other fields of the own account, the administrator right sent along (#1950)', async () => {
      const user = { id: ownId, isAdmin: true, name: 'old' } as User;
      const manager = givenLockedAdmins([ownId]);
      manager.findOne.mockResolvedValue(user);

      await service.patch(ownId, { id: ownId, isAdmin: true, name: 'new' } as UserFullDto, ownId);

      expect(user).toEqual(expect.objectContaining({ isAdmin: true, name: 'new' }));
      expect(manager.save).toHaveBeenCalledWith(user);
    });

    // Besides the own account, only two administrators demoting each other at the same time get
    // here: the later request finds its caller demoted already.
    it('should refuse to demote the last administrator and change nothing (#1950)', async () => {
      const manager = givenLockedAdmins([2]);
      manager.findOne.mockResolvedValue({ id: 2, isAdmin: true } as User);

      await expect(service.patch(2, { id: 2, isAdmin: false } as UserFullDto, ownId))
        .rejects.toThrow(BadRequestException);
      expect(manager.save).not.toHaveBeenCalled();
      // unlocked, the later request would not wait for the earlier one and count before it
      expect(manager.find).toHaveBeenCalledWith(User, expect.objectContaining({
        lock: { mode: 'for_no_key_update' }
      }));
    });
  });

  describe('remove', () => {
    it('should refuse to delete the own account and delete nothing (#1949)', async () => {
      const manager = givenLockedAdmins([1, 3]);

      await expect(service.remove([1, 2], 1)).rejects.toThrow(BadRequestException);
      expect(manager.delete).not.toHaveBeenCalled();
    });

    // Besides the own account, only two administrators deleting each other at the same time get
    // here: the later request finds its caller gone and would take the last administrator with it.
    it('should refuse to delete the last administrator and delete nothing (#1949)', async () => {
      const manager = givenLockedAdmins([1]);

      await expect(service.remove([1], 2)).rejects.toThrow(BadRequestException);
      expect(manager.delete).not.toHaveBeenCalled();
      // unlocked, the later request would not wait for the earlier one and count before it
      expect(manager.find).toHaveBeenCalledWith(User, expect.objectContaining({
        lock: { mode: 'for_no_key_update' }
      }));
    });

    it('should delete the accounts while another administrator remains', async () => {
      const manager = givenLockedAdmins([1, 2]);

      await service.remove([2, 3], 1);

      expect(manager.delete).toHaveBeenCalledWith(User, [2, 3]);
    });
  });

  describe('patchMyData', () => {
    it('should withdraw the approval to publish the email and keep the fields sent empty', async () => {
      const user = {
        id: 1, description: 'd', lastName: 'L', firstName: 'F', email: 'e@x.de', emailPublishApproved: true
      } as User;
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user);

      await service.patchMyData({
        id: 1, description: '', lastName: '', firstName: '', email: '', emailPublishApproved: false
      });

      expect(usersRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        description: 'd', lastName: 'L', firstName: 'F', email: 'e@x.de', emailPublishApproved: false
      }));
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

    it('should take the units from users who left the workspace and give them to those who joined', async () => {
      mockUnitService.findAllForWorkspace.mockResolvedValue([{ id: 10 } as Unit]);
      mockUnitUserService.findByUnitId.mockResolvedValue([{ userId: 1, unitId: 10 }, { userId: 2, unitId: 10 }]);

      await service.setUsersByWorkspace(1, [{ id: 1, accessLevel: 1 }, { id: 3, accessLevel: 1 }]);

      expect(mockUnitUserService.deleteUnitUsersByWorkspaceId.mock.calls).toEqual([[1, 2]]);
      expect(mockUnitUserService.createUnitUser.mock.calls).toEqual([[3, 10]]);
    });
  });

  describe('commentAuthorOf', () => {
    it('should sign with the long name of the user', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue({ lastName: 'Muster', firstName: 'Max' } as User);

      expect(await service.commentAuthorOf(7, 'typed')).toEqual({ id: 7, name: 'Muster, Max' });
    });

    it('should fall back to the login name for a user without a long name', async () => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue({ name: 'max' } as User);

      expect(await service.commentAuthorOf(7)).toEqual({ id: 7, name: 'max' });
    });

    it('should sign a review link, which is no user, with the name typed, without asking for a user', async () => {
      const findOne = jest.spyOn(usersRepository, 'findOne');

      expect(await service.commentAuthorOf(0, 'Besucherin')).toEqual({ id: 0, name: 'Besucherin' });
      expect(await service.commentAuthorOf(0)).toEqual({ id: 0, name: '' });
      expect(findOne).not.toHaveBeenCalled();
    });
  });

  describe('getLongName', () => {
    it.each([
      [{ lastName: 'Muster', firstName: 'Max' }, 'Muster, Max'],
      [{ lastName: 'Muster' }, 'Muster'],
      [{ firstName: 'Max' }, 'Max'],
      [{ name: 'max' }, ''],
      [null, '']
    ])('should make %p into %p', async (user, longName) => {
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(user as User);

      expect(await service.getLongName(7)).toBe(longName);
    });
  });

  describe('isUserLoggedIn', () => {
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
      const updateSpy = jest.spyOn(userSessionRepository, 'update');

      await service.updateLastActivity(1, 'session-1');

      const values = updateSpy.mock.calls[0][1] as { lastActivity: Date, expiresAt: Date };
      expect(values.expiresAt.getTime() - values.lastActivity.getTime()).toBe(PASSIVE_THRESHOLD_MS);
    });

    it('should never touch any session when no sessionId is provided', async () => {
      const updateSpy = jest.spyOn(userSessionRepository, 'update');

      await service.updateLastActivity(1);

      expect(updateSpy).not.toHaveBeenCalled();
    });
  });
});
