import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';

@Injectable()
export class WorkspaceUserService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,

    @InjectRepository(WorkspaceUser)
    private workspaceUserRepository: Repository<WorkspaceUser>
  ) {}

  async deleteAllByWorkspaceGroup(workspaceGroupId: number, userId: number) {
    const workspaces = await this.workspaceRepository.find({
      where: { groupId: workspaceGroupId },
      select: { id: true }
    });
    await Promise.all(workspaces.map(async workspaceData => {
      this.workspaceUserRepository.delete({
        userId: userId, workspaceId: workspaceData.id
      });
    }));
  }
}
