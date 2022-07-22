import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import UnitUser from '../entities/unit-user.entity';
import Unit from '../entities/unit.entity';

@Injectable()
export class WorkspaceUserService {
  private readonly logger = new Logger(WorkspaceUserService.name);

  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceUser)
    private workspaceUserRepository: Repository<WorkspaceUser>,
    @InjectRepository(UnitUser)
    private unitUserRepository: Repository<UnitUser>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>
  ) {}

  async deleteAllByWorkspaceGroup(workspaceGroupId: number, userId: number) {
    this.logger.log(`Deleting workspace groups with workspaceGroupId ${workspaceGroupId}`);
    const workspaces = await this.workspaceRepository.find({
      where: { groupId: workspaceGroupId },
      select: { id: true }
    });
    await Promise.all(workspaces.map(async workspaceData => {
      this.workspaceUserRepository.delete({
        userId: userId, workspaceId: workspaceData.id
      });
      await this.deleteUnitUserRelations(workspaceData.id, userId);
    }));
  }

  private async deleteUnitUserRelations(workspaceId: number, userId: number) {
    const units = await this.unitRepository.find({ where: { workspaceId: workspaceId } });
    await Promise.all(units.map(async unit => {
      const existingUnitUser = await this.unitUserRepository.findOne({
        where: {
          userId: userId,
          unitId: unit.id
        }
      });
      if (existingUnitUser) {
        await this.unitUserRepository.delete(existingUnitUser);
      }
    }));
  }
}
