import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import { UnitUserService } from './unit-user.service';

@Injectable()
export class WorkspaceUserService {
  private readonly logger = new Logger(WorkspaceUserService.name);

  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceUser)
    private workspaceUserRepository: Repository<WorkspaceUser>,
    private unitUserService: UnitUserService
  ) {}

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
      await this.unitUserService.deleteUnitUsers(workspaceData.id, userId);
    }));
  }

  async canWrite(userId: number, workspaceId: number) {
    const workspaceUser = await this.workspaceUserRepository.findOne({
      where: {
        userId: userId,
        workspaceId: workspaceId
      }
    });
    return (workspaceUser?.accessLevel || 0) > 0;
  }

  async canDelete(userId: number, workspaceId: number) {
    const workspaceUser = await this.workspaceUserRepository.findOne({
      where: {
        userId: userId,
        workspaceId: workspaceId
      }
    });
    return (workspaceUser?.accessLevel || 0) === 3;
  }

  async canManage(userId: number, workspaceId: number) {
    const workspaceUser = await this.workspaceUserRepository.findOne({
      where: {
        userId: userId,
        workspaceId: workspaceId
      }
    });
    return (workspaceUser?.accessLevel || 0) > 1;
  }
}
