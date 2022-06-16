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

@Injectable()
export class WorkspaceGroupService {
  constructor(
    @InjectRepository(WorkspaceGroup)
    private workspaceGroupsRepository: Repository<WorkspaceGroup>
  ) {}

  async findAll(): Promise<WorkspaceGroupInListDto[]> {
    const workspaceGroups: WorkspaceGroup[] = await this.workspaceGroupsRepository.find({ order: { name: 'ASC' } });
    const returnWorkspaces: WorkspaceGroupInListDto[] = [];
    workspaceGroups.forEach(workspaceGroup => returnWorkspaces.push(<WorkspaceGroupInListDto>{
      id: workspaceGroup.id,
      name: workspaceGroup.name
    }));
    return returnWorkspaces;
  }

  async findOne(id: number): Promise<WorkspaceGroupFullDto> {
    const workspace = await this.workspaceGroupsRepository.findOne(id);
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
      const workspaceGroupToUpdate = await this.workspaceGroupsRepository.findOne(workspaceGroupData.id);
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
}
