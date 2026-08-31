import {
  Injectable, Logger
} from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  UserActivityStatus,
  SessionActivityStatus,
  CreateUserDto,
  MyDataDto,
  UserFullDto,
  UserInListDto,
  UserSessionInfoDto,
  UsersInWorkspaceDto,
  UserWorkspaceAccessDto,
  WorkspaceUserInListDto
} from '@studio-lite-lib/api-dto';
import User from '../entities/user.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import { AdminUserNotFoundException } from '../exceptions/admin-user-not-found.exception';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import Workspace from '../entities/workspace.entity';
import { UnitService } from './unit.service';
import { UnitUserService } from './unit-user.service';
import UserSession from '../entities/user-session.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { ACTIVE_THRESHOLD_MS, PASSIVE_THRESHOLD_MS } from '../app.constants';

/**
 * The accounts, their assignments and what the admin list shows about them: who exists, who may
 * reach which workspace, who administers which group, and the session status of each.
 *
 * The session status is derived here, not stored: a session is active while an access token issued
 * for it can still be valid, passive while an unexpired refresh token can still resume it, and
 * orphaned once neither is left. Both thresholds come from `time.constants.ts`.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(WorkspaceUser)
    private workspaceUsersRepository: Repository<WorkspaceUser>,
    @InjectRepository(WorkspaceGroupAdmin)
    private workspaceGroupAdminRepository: Repository<WorkspaceGroupAdmin>,
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    private unitService: UnitService,
    private unitUserService: UnitUserService,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>
  ) {
  }

  private async findUsersOrderedByName(): Promise<User[]> {
    return this.usersRepository.find({ order: { name: 'ASC' } });
  }

  private async findWorkspaceGroupAdminIds(workspaceGroupId: number): Promise<number[]> {
    const workspaceGroupAdmins = await this.workspaceGroupAdminRepository.find({
      where: { workspaceGroupId },
      select: { userId: true }
    });
    return workspaceGroupAdmins.map(admin => admin.userId);
  }

  private async findWorkspaceUserIds(workspaceId: number): Promise<number[]> {
    const workspaceUsers = await this.workspaceUsersRepository.find({
      where: { workspaceId },
      select: { userId: true }
    });
    return workspaceUsers.map(workspaceUser => workspaceUser.userId);
  }

  async findAllUsers(workspaceId?: number): Promise<WorkspaceUserInListDto[]> {
    // TODO: sollte Fehler liefern wenn eine nicht gültige workspaceId verwendet wird
    this.logger.log(`Returning users${workspaceId ? ` for workspaceId: ${workspaceId}` : '.'}`);
    const validUsers: UserWorkspaceAccessDto[] = [];
    if (workspaceId) {
      const workspaceUsers: WorkspaceUser[] = await this.workspaceUsersRepository.find({ where: { workspaceId } });
      workspaceUsers.forEach(workspaceUser => validUsers.push({
        id: workspaceUser.userId,
        accessLevel: workspaceUser.accessLevel
      }));
    }
    const users = await this.findUsersOrderedByName();
    const returnUsers: WorkspaceUserInListDto[] = [];
    users.forEach(user => {
      if (!workspaceId || validUsers.find(validUser => validUser.id === user.id)) {
        returnUsers.push(<WorkspaceUserInListDto>{
          id: user.id,
          name: user.name,
          workspaceAccessLevel: validUsers.find(validUser => validUser.id === user.id)?.accessLevel || 0,
          isAdmin: user.isAdmin,
          description: user.description,
          displayName: UnitService.getUserDisplayName(user),
          email: `${user.email}${user.emailPublishApproved ? '' : ' (verborgen)'}`
        });
      }
    });
    return returnUsers;
  }

  async findAllWorkspaceGroupAdmins(workspaceGroupId: number): Promise<UserInListDto[]> {
    const workspaceGroupAdminsIds = await this.findWorkspaceGroupAdminIds(workspaceGroupId);
    const users = await this.findUsersOrderedByName();
    const returnUsers: UserInListDto[] = [];
    users.forEach(user => {
      if (workspaceGroupAdminsIds.includes(user.id)) {
        returnUsers.push(<UserInListDto>{
          id: user.id,
          name: user.name,
          isAdmin: user.isAdmin,
          description: user.description,
          displayName: UnitService.getUserDisplayName(user),
          email: user.emailPublishApproved ? user.email : ''
        });
      }
    });
    return returnUsers;
  }

  async findAllWorkspaceUsers(workspaceId: number): Promise<UsersInWorkspaceDto> {
    const sessionStatusByUser = await this.getSessionStatusByUser();
    const returnUsers: UsersInWorkspaceDto = {
      users: [],
      workspaceGroupAdmins: [],
      admins: []
    };
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: { groupId: true }
    });
    const workspaceGroupAdmins = await this.findWorkspaceGroupAdminIds(workspace.groupId);
    const users = await this.findWorkspaceUserIds(workspaceId);
    const allUsers = await this.usersRepository.find({
      select: {
        id: true,
        email: true,
        emailPublishApproved: true,
        firstName: true,
        lastName: true,
        name: true,
        isAdmin: true,
        description: true
      }
    });

    allUsers.forEach(user => {
      const status = sessionStatusByUser.get(user.id);
      const newUser: UserInListDto = {
        id: user.id,
        name: user.name,
        isAdmin: user.isAdmin,
        description: user.description,
        displayName: UnitService.getUserDisplayName(user),
        email: user.emailPublishApproved ? user.email : '',
        lastActivity: status?.lastActivity
      };
      if (user.isAdmin) {
        returnUsers.admins.push(newUser);
      } else if (workspaceGroupAdmins.includes(user.id)) {
        returnUsers.workspaceGroupAdmins.push(newUser);
      } else if (users.includes(user.id)) {
        returnUsers.users.push(newUser);
      }
    });

    return returnUsers;
  }

  async findAllFull(workspaceId?: number): Promise<UserFullDto[]> {
    const sessionStatusByUser = await this.getSessionStatusByUser();
    const validUsers: number[] = [];
    if (workspaceId) {
      const workspaceUsers: WorkspaceUser[] = await this.workspaceUsersRepository.find({ where: { workspaceId } });
      workspaceUsers.forEach(wsU => validUsers.push(wsU.userId));
    }
    const users = await this.findUsersOrderedByName();
    return users.map(user => {
      if (!workspaceId || validUsers.includes(user.id)) {
        const status = sessionStatusByUser.get(user.id);
        return <UserFullDto>{
          id: user.id,
          name: user.name,
          isAdmin: user.isAdmin,
          description: user.description,
          lastName: user.lastName,
          firstName: user.firstName,
          email: user.email,
          emailPublishApproved: user.emailPublishApproved,
          lastActivity: status?.lastActivity,
          isLoggedIn: status?.isLoggedIn || false,
          activityStatus: status?.activityStatus || 'inactive',
          sessions: status?.sessions || []
        };
      }
      return null;
    }).filter(u => u !== null) as UserFullDto[];
  }

  async findOne(id: number): Promise<UserFullDto> {
    this.logger.log(`Returning user with id: ${id}`);
    const user = await this.usersRepository.findOne({
      where: { id: id }
    });
    if (user) {
      return <UserFullDto>{
        id: user.id,
        name: user.name,
        isAdmin: user.isAdmin,
        description: user.description,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailPublishApproved: user.emailPublishApproved
      };
    }
    throw new AdminUserNotFoundException(id, 'GET');
  }

  async hasUsers(): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: MoreThan(0) },
      select: { id: true }
    });
    return !!user;
  }

  async create(user: CreateUserDto): Promise<number> {
    this.logger.log(`Creating user with name: ${user.name}`);
    user.password = UsersService.getPasswordHash(user.password);
    const newUser = this.usersRepository.create(user);
    await this.usersRepository.save(newUser);
    return newUser.id;
  }

  async getUserByNameAndPassword(name: string, password: string): Promise<number | null> {
    const user = await this.usersRepository.findOne({
      where: { name: name },
      select: { id: true, password: true }
    });
    if (user && bcrypt.compareSync(password, user.password)) {
      return user.id;
    }
    return null;
  }

  async getUserIsAdmin(userId: number): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { isAdmin: true }
    });
    if (user) return user.isAdmin;
    return false;
  }

  async setPassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    this.logger.log(`Setting password for user with id: ${userId}.`);
    const userForName = await this.usersRepository.findOne({
      where: { id: userId },
      select: { name: true }
    });
    if (userForName) {
      const userForId = await this.getUserByNameAndPassword(userForName.name, oldPassword);
      if (userForId) {
        const userToUpdate = await this.usersRepository.findOne({
          where: { id: userForId }
        });
        userToUpdate.password = UsersService.getPasswordHash(newPassword);
        await this.usersRepository.save(userToUpdate);
        return true;
      }
    }
    return false;
  }

  async canAccessWorkSpace(userId: number, workspaceId: number): Promise<boolean> {
    const wsUser = await this.workspaceUsersRepository.findOne({
      where: { userId, workspaceId }
    });
    if (wsUser) return true;
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      select: { groupId: true }
    });
    return this.isWorkspaceGroupAdmin(userId, workspace.groupId);
  }

  async isWorkspaceGroupAdmin(userId: number, workspaceGroupId?: number): Promise<boolean> {
    if (workspaceGroupId) {
      const wsgAdmin = await this.workspaceGroupAdminRepository.findOne({
        where: { workspaceGroupId, userId }
      });
      return !!wsgAdmin;
    }
    const wsgAdmin = await this.workspaceGroupAdminRepository.findOne({
      where: { userId }
    });
    return !!wsgAdmin;
  }

  async isUserLoggedIn(userId: number): Promise<boolean> {
    const sessionStatusByUser = await this.getSessionStatusByUser();
    return sessionStatusByUser.get(userId)?.isLoggedIn || false;
  }

  async getLongName(userId: number): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: { lastName: true, firstName: true, name: true }
    });
    if (user) {
      if (user.lastName) return user.firstName ? `${user.lastName}, ${user.firstName}` : user.lastName;
      return user.firstName || '';
    }
    return '';
  }

  async remove(id: number | number[]): Promise<void> {
    this.logger.log(`Deleting user with id: ${id}`);
    await this.usersRepository.delete(id);
  }

  async patch(userId: number, userData: UserFullDto): Promise<void> {
    this.logger.log(`Updating user with id: ${userId}`);
    const userToUpdate = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        name: true,
        isAdmin: true,
        description: true,
        password: true,
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });
    if (userToUpdate) {
      if (typeof userData.isAdmin === 'boolean') userToUpdate.isAdmin = userData.isAdmin;
      if (userData.name) userToUpdate.name = userData.name;
      if (userData.description) userToUpdate.description = userData.description;
      if (userData.password) userToUpdate.password = UsersService.getPasswordHash(userData.password);
      if (userData.lastName) userToUpdate.lastName = userData.lastName;
      if (userData.firstName) userToUpdate.firstName = userData.firstName;
      if (userData.email) userToUpdate.email = userData.email;
      await this.usersRepository.save(userToUpdate);
    } else {
      throw new AdminUserNotFoundException(userData.id, 'PATCH');
    }
  }

  async patchMyData(userData: MyDataDto): Promise<void> {
    const userToUpdate = await this.usersRepository.findOne({
      where: { id: userData.id },
      select: {
        description: true,
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        emailPublishApproved: true
      }
    });
    if (userData.description) userToUpdate.description = userData.description;
    if (userData.lastName) userToUpdate.lastName = userData.lastName;
    if (userData.firstName) userToUpdate.firstName = userData.firstName;
    if (userData.email) userToUpdate.email = userData.email;
    if (typeof userData.emailPublishApproved === 'boolean') {
      userToUpdate.emailPublishApproved = userData.emailPublishApproved;
    }
    await this.usersRepository.save(userToUpdate);
  }

  async setUsersByWorkspace(workspaceId: number, users: UserWorkspaceAccessDto[]) {
    this.logger.log(`Adding users for workspaceId: ${workspaceId}`);

    // Remove all existing workspace users
    await this.workspaceUsersRepository.delete({ workspaceId: workspaceId });

    // Get all units and create workspace users in parallel
    const [units, workspaceUsers] = await Promise.all([
      this.unitService.findAllForWorkspace(workspaceId),
      Promise.all(users.map(user => this.workspaceUsersRepository
        .create({
          userId: user.id,
          workspaceId: workspaceId,
          accessLevel: user.accessLevel
        })
      ))
    ]);

    // Save all workspace users at once
    await this.workspaceUsersRepository.save(workspaceUsers);

    const newUserIds = users.map(u => u.id);

    // Get all existing unit users to determine global users to remove
    const allUnitUsers = await Promise.all(
      units.map(unit => this.unitUserService.findByUnitId(unit.id))
    );
    const allExistingUserIds = [...new Set(allUnitUsers.flat().map(uu => uu.userId))];
    const globalUsersToRemove = allExistingUserIds.filter(userId => !newUserIds.includes(userId));

    // Remove users from all units once (outside the unit loop)
    if (globalUsersToRemove.length > 0) {
      await Promise.all(
        globalUsersToRemove.map(userId => this.unitUserService
          .deleteUnitUsersByWorkspaceId(workspaceId, userId)
        )
      );
    }

    // Process unit access - only additions now
    await Promise.all(units.map(async unit => {
      const existingUnitUsers = await this.unitUserService.findByUnitId(unit.id);
      const existingUnitUserIds = existingUnitUsers.map(uu => uu.userId);

      const usersToAdd = newUserIds.filter(userId => !existingUnitUserIds.includes(userId));

      // Only execute additions
      await Promise.all(
        usersToAdd.map(userId => this.unitUserService.createUnitUser(userId, unit.id))
      );
    }));
  }

  // TODO: mit Dtos
  async setWorkspaceGroupAdmins(workspaceGroupId: number, users: number[]) {
    return this.workspaceGroupAdminRepository.delete({ workspaceGroupId: workspaceGroupId }).then(async () => {
      await Promise.all(users.map(async userId => {
        const newWorkspaceGroupAdmin = this.workspaceGroupAdminRepository.create(<WorkspaceGroupAdmin>{
          userId: userId,
          workspaceGroupId: workspaceGroupId
        });
        await this.workspaceGroupAdminRepository.save(newWorkspaceGroupAdmin);
      }));
    });
  }

  async updateLastActivity(userId: number, sessionId?: string): Promise<void> {
    // Defensive: without a concrete sessionId we must never touch every session of
    // the user (that would let a single request affect all of a user's browsers).
    if (!sessionId) return;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + PASSIVE_THRESHOLD_MS);
    await this.userSessionRepository.update(
      { userId, sessionId },
      { lastActivity: now, expiresAt }
    );
  }

  private async getSessionStatusByUser(): Promise<Map<number, {
    isLoggedIn: boolean;
    lastActivity?: Date;
    activityStatus: UserActivityStatus;
    sessions: UserSessionInfoDto[];
  }>> {
    const nowMs = Date.now();
    const sessionInfosByUser = new Map<number, UserSessionInfoDto[]>();

    // Sessions first, tokens second: a session created between the two reads is missing
    // from the token set, and only its own lastActivity keeps it out of 'orphaned'.
    const allSessions = await this.userSessionRepository.find();
    const resumableSessionIds = await this.findResumableSessionIds(new Date(nowMs));

    allSessions
      .filter(session => UsersService.isSessionStillValid(session.expiresAt, nowMs))
      .forEach(session => {
        const sessionInfo: UserSessionInfoDto = {
          sessionId: session.sessionId,
          lastActivity: session.lastActivity,
          activityStatus: UsersService.calculateSessionStatus(
            session.lastActivity,
            resumableSessionIds.has(session.sessionId),
            nowMs
          )
        };
        const existing = sessionInfosByUser.get(session.userId) || [];
        existing.push(sessionInfo);
        sessionInfosByUser.set(session.userId, existing);
      });

    const sessionsByUser = new Map<number, {
      isLoggedIn: boolean;
      lastActivity?: Date;
      activityStatus: UserActivityStatus;
      sessions: UserSessionInfoDto[];
    }>();

    sessionInfosByUser.forEach((sessions, userId) => {
      const latestSession = sessions
        .reduce<UserSessionInfoDto | undefined>(
        (latest, current) => (UsersService
          .isNewerSession(current.lastActivity as Date, latest?.lastActivity) ? current : latest),
        undefined
      );
      const latestNonOrphanedSession = sessions
        .filter(session => session.activityStatus !== 'orphaned')
        .reduce<UserSessionInfoDto | undefined>(
        (latest, current) => (UsersService
          .isNewerSession(current.lastActivity as Date, latest?.lastActivity) ? current : latest),
        undefined
      );

      sessionsByUser.set(userId, {
        isLoggedIn: !!latestNonOrphanedSession,
        lastActivity: latestSession?.lastActivity,
        activityStatus: latestNonOrphanedSession?.activityStatus || 'orphaned',
        sessions
      });
    });

    return sessionsByUser;
  }

  /**
   * The sessionIds a refresh token can still resume. An expired token is no key at all, so a
   * session left with nothing but expired ones can no longer be continued.
   */
  private async findResumableSessionIds(now: Date): Promise<Set<string>> {
    const liveTokens = await this.refreshTokenRepository.find({
      where: { expiresAt: MoreThan(now) },
      select: { sessionId: true }
    });
    return new Set(liveTokens.map(token => token.sessionId));
  }

  /**
   * A session is what its keys make it, and there are exactly two. While the last interaction is
   * younger than ACTIVE_THRESHOLD_MS an access token issued for it can still be valid, so someone
   * can be working in it right now: 'active'. After that only the refresh token is left, and while
   * an unexpired one exists the session is merely unused -- whoever opens that browser again
   * continues in it: 'passive'. Only when neither key is left is the session 'orphaned': nobody can
   * return to it, and it should have gone when its last token did.
   *
   * Deliberately not decided by liveness ("is a tab still open?"). A closed browser is the ordinary
   * way to leave a session, not an anomaly, and reporting it as orphaned made that label mean
   * nothing (#1615). Active is asked first so that the moment between a fresh login writing its
   * session row and writing its first refresh token cannot make a brand-new session look orphaned.
   */
  private static calculateSessionStatus(
    lastActivity: Date,
    isResumable: boolean,
    nowMs: number
  ): SessionActivityStatus {
    const ageMs = nowMs - new Date(lastActivity).getTime();
    if (ageMs <= ACTIVE_THRESHOLD_MS) return 'active';
    return isResumable ? 'passive' : 'orphaned';
  }

  private static isSessionStillValid(expiresAt: Date, nowMs: number): boolean {
    return new Date(expiresAt).getTime() > nowMs;
  }

  private static isNewerSession(candidate: Date, current?: Date): boolean {
    return !current || new Date(candidate).getTime() > new Date(current).getTime();
  }

  private static getPasswordHash(stringToHash: string): string {
    return bcrypt.hashSync(stringToHash, 11);
  }
}
