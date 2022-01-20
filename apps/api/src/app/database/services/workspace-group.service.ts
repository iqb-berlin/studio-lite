import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import WorkspaceGroup from "../entities/workspace-group.entity";
import {CreateWorkspaceGroupDto, WorkspaceGroupFullDto, WorkspaceGroupInListDto} from "@studio-lite-lib/api-admin";

@Injectable()
export class WorkspaceGroupService {
  constructor(
    @InjectRepository(WorkspaceGroup)
    private workspaceGroupsRepository: Repository<WorkspaceGroup>
  ) {}

  async findAll(): Promise<WorkspaceGroupInListDto[]> {
    const workspaceGroups: WorkspaceGroup[] = await this.workspaceGroupsRepository.find({order:{name: 'ASC'}});
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
    }
  }

  async create(workspaceGroup: CreateWorkspaceGroupDto ): Promise<number> {
    const newWorkspaceGroup = await this.workspaceGroupsRepository.create(workspaceGroup);
    await this.workspaceGroupsRepository.save(newWorkspaceGroup);
    return newWorkspaceGroup.id;
  }

  async remove(id: number): Promise<void> {
    await this.workspaceGroupsRepository.delete(id);
  }
}
