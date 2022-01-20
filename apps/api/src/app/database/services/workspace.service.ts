import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {getConnection, Repository} from "typeorm";
import Workspace from "../entities/workspace.entity";
import {CreateWorkspaceDto, WorkspaceFullDto, WorkspaceInListDto} from "@studio-lite-lib/api-admin";
import User from "../entities/user.entity";
import WorkspaceUser from "../entities/workspace-user.entity";

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspacesRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceUser)
    private workspaceUsersRepository: Repository<WorkspaceUser>
  ) {}

  async findAll(userId?: number): Promise<WorkspaceInListDto[]> {
    const validWorkspaces: number[] = [];
    if (userId) {
      const workspaceUsers: WorkspaceUser[] = await this.workspaceUsersRepository.find({ where: {userId: userId}});
      workspaceUsers.forEach(wsU => validWorkspaces.push(wsU.workspaceId))
    }
    const workspaces: Workspace[] = await this.workspacesRepository.find({order: {name: 'ASC'}});
    const returnWorkspaces: WorkspaceInListDto[] = [];
    workspaces.forEach(workspace => {
      if (!userId || (validWorkspaces.indexOf(workspace.id) > -1)) {
        returnWorkspaces.push(<WorkspaceInListDto>{
          id: workspace.id,
          name: workspace.name,
          groupId: workspace.groupId
        })
      }
    });
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
