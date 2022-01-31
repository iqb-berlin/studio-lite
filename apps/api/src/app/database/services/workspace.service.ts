import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {getConnection, Repository} from "typeorm";
import Workspace from "../entities/workspace.entity";
import {
  CreateWorkspaceDto,
  WorkspaceGroupDto,
  WorkspaceFullDto,
  WorkspaceInListDto,
  WorkspaceDto
} from "@studio-lite-lib/api-dto";
import WorkspaceUser from "../entities/workspace-user.entity";
import WorkspaceGroup from "../entities/workspace-group.entity";

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspacesRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceUser)
    private workspaceUsersRepository: Repository<WorkspaceUser>,
    @InjectRepository(WorkspaceGroup)
    private workspaceGroupRepository: Repository<WorkspaceGroup>
  ) {}

  async find(workspaceId: number): Promise<WorkspaceFullDto> {
    const workspaces = await this.workspacesRepository.find({
      where: {id: workspaceId}
    });
    return <WorkspaceFullDto>{
      id: workspaces[0].id,
      name: workspaces[0].name,
      groupId: workspaces[0].group.id,
      groupName: workspaces[0].group.name,
      settings: workspaces[0].settings
    }
  }

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
          groupId: workspace.group.id,
          groupName: workspace.group.name
        })
      }
    });
    return returnWorkspaces;
  }

  async setWorkspacesByUser(userId: number, workspaces: number[]) {
    await getConnection().createQueryBuilder()
      .delete()
      .from(WorkspaceUser)
      .where("user_id = :id", { id: userId })
      .execute();
    for (const workspaceId of workspaces) {
      const newWorkspaceUser = await this.workspaceUsersRepository.create(<WorkspaceUser>{
        userId: userId,
        workspaceId: workspaceId
      });
      await this.workspaceUsersRepository.save(newWorkspaceUser);
    }
  }

  async findAllGroupwise(userId?: number): Promise<WorkspaceGroupDto[]> {
    const workspaceGroups = await this.workspaceGroupRepository.find({order: {name: 'ASC'}});
    const workspaceIds: number[] = [];
    if (userId) {
      const workspaces = await this.findAll(userId);
      workspaces.forEach(ws => workspaceIds.push(ws.id));
    }
    const myReturn: WorkspaceGroupDto[] = [];
    workspaceGroups.forEach(workspaceGroup => {
      const localWorkspaceGroup = <WorkspaceGroupDto>{
        id: workspaceGroup.id,
        name: workspaceGroup.name,
        workspaces: []
      }
      workspaceGroup.workspaces.forEach(workspace => {
        if (!userId || workspaceIds.indexOf(workspace.id) >= 0) {
            localWorkspaceGroup.workspaces.push(<WorkspaceDto>{
              id: workspace.id,
              name: workspace.name
            })
        }
      });
      if (localWorkspaceGroup.workspaces.length > 0) {
        myReturn.push(localWorkspaceGroup)
      }
    })
    return myReturn;
  }

  async findOne(id: number): Promise<WorkspaceFullDto> {
    const workspace = await this.workspacesRepository.findOne(id);
    return <WorkspaceFullDto>{
      id: workspace.id,
      name: workspace.name,
      settings: workspace.settings,
      groupId: workspace.group.id,
      groupName: workspace.group.name
    }
  }

  async create(workspace: CreateWorkspaceDto ): Promise<number> {
    const newWorkspace = await this.workspacesRepository.create(workspace);
    await this.workspacesRepository.save(newWorkspace);
    return newWorkspace.id;
  }

  async patch(workspaceData: WorkspaceFullDto): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne(workspaceData.id);
    if (workspaceData.name) workspaceToUpdate.name = workspaceData.name;
    if (workspaceData.groupId) {
      const workspaceGroups = await this.workspaceGroupRepository.find({where: {id: workspaceData.groupId}});
      if (workspaceGroups.length > 0) {
        workspaceToUpdate.group = workspaceGroups[0];
      }
    }
    await this.workspacesRepository.save(workspaceToUpdate);
  }

  async remove(id: number | number[]): Promise<void> {
    await this.workspacesRepository.delete(id);
  }
}
