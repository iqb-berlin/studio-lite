import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import User from '../entities/user.entity';
import { UnitUserService } from './unit-user.service';

/**
 * The level an administrator holds in every workspace without being assigned to it: commenter,
 * the lowest level that opens a unit (#1571). An assignment with a higher level still counts.
 */
export const ADMIN_IMPLICIT_ACCESS_LEVEL = 1;

/**
 * The access ladder in one place: whether a user is assigned to a workspace at all, and whether
 * their level is enough to comment, write, manage or delete. The guards in `guards/` are thin
 * wrappers around exactly these questions.
 *
 * A user with no row counts as level 0, so an unassigned user fails every question but the bare
 * `hasAccess`, which asks for the row itself.
 *
 * Administrators are the exception to both: for reading and commenting they hold at least
 * {@link ADMIN_IMPLICIT_ACCESS_LEVEL} everywhere, with no row written for it -- a row would put
 * them into the workspace's user list. Writing, managing and deleting still need the row (#1571).
 */
@Injectable()
export class WorkspaceUserService {
  private readonly logger = new Logger(WorkspaceUserService.name);

  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceUser)
    private workspaceUserRepository: Repository<WorkspaceUser>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private unitUserService: UnitUserService
  ) {}

  /**
   * The level the user holds in the workspace: the assigned one, raised to
   * {@link ADMIN_IMPLICIT_ACCESS_LEVEL} for an administrator. `null` when the user is neither
   * assigned nor an administrator -- and for a workspace that does not exist, which an
   * administrator must not be let into either.
   */
  async accessLevel(userId: number, workspaceId: number): Promise<number | null> {
    const workspaceUser = await this.workspaceUserRepository.findOne({
      where: {
        userId: userId,
        workspaceId: workspaceId
      }
    });
    const isAdmin = await this.isAdmin(userId);
    if (workspaceUser) {
      return isAdmin ?
        Math.max(workspaceUser.accessLevel, ADMIN_IMPLICIT_ACCESS_LEVEL) :
        workspaceUser.accessLevel;
    }
    if (isAdmin && await this.workspaceRepository.exists({ where: { id: workspaceId } })) {
      return ADMIN_IMPLICIT_ACCESS_LEVEL;
    }
    return null;
  }

  private async isAdmin(userId: number): Promise<boolean> {
    if (!userId) return false;
    return this.usersRepository.exists({ where: { id: userId, isAdmin: true } });
  }

  async deleteAllByWorkspaceGroup(workspaceGroupId: number, userId: number) {
    this.logger.log(`Deleting workspace groups with workspaceGroupId ${workspaceGroupId}`);
    const workspaces = await this.workspaceRepository.find({
      where: { groupId: workspaceGroupId },
      select: { id: true }
    });
    await Promise.all(workspaces.map(async workspaceData => {
      await this.workspaceUserRepository.delete({
        userId: userId, workspaceId: workspaceData.id
      });
      await this.unitUserService.deleteUnitUsersByWorkspaceId(workspaceData.id, userId);
    }));
  }

  async hasAccess(userId: number, workspaceId: number) {
    return (await this.accessLevel(userId, workspaceId)) !== null;
  }

  /**
   * Whether the user is assigned to at least one workspace of the group -- what a member needs to
   * read the group's settings, such as its unit states, from inside their workspace (#1712).
   */
  async hasAccessToWorkspaceGroup(userId: number, workspaceGroupId: number): Promise<boolean> {
    return this.workspaceUserRepository.exists({
      where: {
        userId: userId,
        workspace: { groupId: workspaceGroupId }
      }
    });
  }

  async canComment(userId: number, workspaceId: number) {
    return ((await this.accessLevel(userId, workspaceId)) ?? 0) > 0;
  }

  async canWrite(userId: number, workspaceId: number) {
    const workspaceUser = await this.workspaceUserRepository.findOne({
      where: {
        userId: userId,
        workspaceId: workspaceId
      }
    });
    return (workspaceUser?.accessLevel || 0) > 1;
  }

  async canDelete(userId: number, workspaceId: number) {
    const workspaceUser = await this.workspaceUserRepository.findOne({
      where: {
        userId: userId,
        workspaceId: workspaceId
      }
    });
    return (workspaceUser?.accessLevel || 0) === 4;
  }

  async canManage(userId: number, workspaceId: number) {
    const workspaceUser = await this.workspaceUserRepository.findOne({
      where: {
        userId: userId,
        workspaceId: workspaceId
      }
    });
    return (workspaceUser?.accessLevel || 0) > 2;
  }
}
