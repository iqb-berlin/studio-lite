import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateWorkspaceGroupDto,
  WorkspaceGroupFullDto,
  WorkspaceGroupInListDto
} from '@studio-lite-lib/api-dto';
import { ArgumentOutOfRangeError } from 'rxjs';
import WorkspaceGroup from '../entities/workspace-group.entity';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';

@Injectable()
export class WorkspaceGroupService {
  constructor(
    @InjectRepository(WorkspaceGroup)
    private workspaceGroupsRepository: Repository<WorkspaceGroup>,

    @InjectRepository(WorkspaceGroupAdmin)
    private workspaceGroupAdminRepository: Repository<WorkspaceGroupAdmin>
  ) {}

  async findAll(userId?: number): Promise<WorkspaceGroupInListDto[]> {
    let usersWorkspaceGroupIds: number[] = [];
    if (userId) {
      const usersWorkspaceGroups = await this.workspaceGroupAdminRepository.find({
        where: { userId: userId }
      });
      if (usersWorkspaceGroups && usersWorkspaceGroups.length > 0) {
        usersWorkspaceGroupIds = usersWorkspaceGroups.map(wsg => wsg.workspaceGroupId);
      } else {
        return [];
      }
    }
    const workspaceGroups: WorkspaceGroup[] = await this.workspaceGroupsRepository.find(
      { order: { name: 'ASC' } }
    );
    const returnWorkspaces: WorkspaceGroupInListDto[] = [];
    workspaceGroups.forEach(workspaceGroup => {
      if (usersWorkspaceGroupIds.length === 0 || usersWorkspaceGroupIds.indexOf(workspaceGroup.id) >= 0) {
        returnWorkspaces.push(<WorkspaceGroupInListDto>{
          id: workspaceGroup.id,
          name: workspaceGroup.name
        });
      }
    });
    return returnWorkspaces;
  }

  async findOne(id: number): Promise<WorkspaceGroupFullDto> {
    const workspace = await this.workspaceGroupsRepository.findOne({
      where: { id: id },
      select: { id: true, name: true, settings: true }
    });
    return <WorkspaceGroupFullDto>{
      id: workspace.id,
      name: workspace.name,
      settings: workspace.settings
    };
  }

  async create(workspaceGroup: CreateWorkspaceGroupDto): Promise<number> {
    const newWorkspaceGroup = await this.workspaceGroupsRepository.create(workspaceGroup);
    await this.workspaceGroupsRepository.save(newWorkspaceGroup);
    return newWorkspaceGroup.id;
  }

  async patch(workspaceGroupData: WorkspaceGroupFullDto): Promise<void> {
    if (workspaceGroupData.id) {
      const workspaceGroupToUpdate = await this.workspaceGroupsRepository.findOne({
        where: { id: workspaceGroupData.id },
        select: { settings: true, name: true }
      });
      if (workspaceGroupData.name) workspaceGroupToUpdate.name = workspaceGroupData.name;
      if (workspaceGroupData.settings) workspaceGroupToUpdate.settings = workspaceGroupData.settings;
      await this.workspaceGroupsRepository.save(workspaceGroupToUpdate);
    } else {
      throw new ArgumentOutOfRangeError();
    }
  }

  async remove(id: number): Promise<void> {
    await this.workspaceGroupsRepository.delete(id);
  }

  async setWorkspaceGroupAdminsByUser(userId: number, workspaceGroups: number[]) {
    return this.workspaceGroupAdminRepository.delete({ userId: userId }).then(async () => {
      await Promise.all(workspaceGroups.map(async workspaceGroupId => {
        const newWorkspaceGroupAdmin = await this.workspaceGroupAdminRepository.create(<WorkspaceGroupAdmin>{
          userId: userId,
          workspaceGroupId: workspaceGroupId
        });
        await this.workspaceGroupAdminRepository.save(newWorkspaceGroupAdmin);
      }));
    });
  }
}
