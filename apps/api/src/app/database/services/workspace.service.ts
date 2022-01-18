import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import Workspace from "../entities/workspace.entity";
import {CreateWorkspaceDto, WorkspaceFullDto, WorkspaceInListDto} from "@studio-lite-lib/api-admin";

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspacesRepository: Repository<Workspace>
  ) {}

  async findAll(): Promise<WorkspaceInListDto[]> {
    const workspaces: Workspace[] = await this.workspacesRepository.find();
    const returnWorkspaces: WorkspaceInListDto[] = [];
    workspaces.forEach(workspace => returnWorkspaces.push(<WorkspaceInListDto>{
      id: workspace.id,
      name: workspace.name,
      groupId: workspace.groupId
    }));
    return returnWorkspaces;
  }

  async findOne(id: number): Promise<WorkspaceFullDto> {
    const workspace = await this.workspacesRepository.findOne(id);
    return <WorkspaceFullDto>{
      id: workspace.id,
      name: workspace.name,
      settings: workspace.settings,
      groupId: workspace.groupId
    }
  }

  async create(workspace: CreateWorkspaceDto ): Promise<number> {
    const newWorkspace = await this.workspacesRepository.create(workspace);
    await this.workspacesRepository.save(newWorkspace);
    return newWorkspace.id;
  }

  async remove(id: number): Promise<void> {
    await this.workspacesRepository.delete(id);
  }
}
