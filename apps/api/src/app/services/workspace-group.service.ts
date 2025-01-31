import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateWorkspaceGroupDto,
  WorkspaceGroupFullDto,
  WorkspaceGroupInListDto
} from '@studio-lite-lib/api-dto';
import { ArgumentOutOfRangeError } from 'rxjs';
import WorkspaceGroup from '../entities/workspace-group.entity';
import { AdminWorkspaceGroupNotFoundException } from '../exceptions/admin-workspace-group-not-found.exception';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';

@Injectable()
export class WorkspaceGroupService {
  private readonly logger = new Logger(WorkspaceGroupService.name);

  constructor(
    @InjectRepository(WorkspaceGroup)
    private workspaceGroupsRepository: Repository<WorkspaceGroup>,

    @InjectRepository(WorkspaceGroupAdmin)
    private workspaceGroupAdminRepository: Repository<WorkspaceGroupAdmin>
  ) {}

  async findAll(userId?: number): Promise<WorkspaceGroupInListDto[]> {
    // TODO: Warum werden nur id und Name zurückgegeben?
    this.logger.log('Returning all workspace groups.');
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
    this.logger.log(`Returning workspace group with id: ${id}`);
    const workspaceGroup = await this.workspaceGroupsRepository.findOne({
      where: { id: id },
      select: { id: true, name: true, settings: true }
    });
    if (workspaceGroup) {
      return <WorkspaceGroupFullDto>{
        id: workspaceGroup.id,
        name: workspaceGroup.name,
        settings: workspaceGroup.settings
      };
    }
    throw new AdminWorkspaceGroupNotFoundException(id, 'GET');
  }

  async create(workspaceGroup: CreateWorkspaceGroupDto): Promise<number> {
    this.logger.log(`Creating workspace group with name: ${workspaceGroup.name}`);
    const newWorkspaceGroup = await this.workspaceGroupsRepository.create(workspaceGroup);
    await this.workspaceGroupsRepository.save(newWorkspaceGroup);
    return newWorkspaceGroup.id;
  }

  // TODO: Pfad mit Id (s. patch bei WorkspaceService und UsersService)
  async patch(workspaceGroupData: WorkspaceGroupFullDto): Promise<void> {
    this.logger.log(`Updating workspace group with id: ${workspaceGroupData.id}`);
    if (workspaceGroupData.id) {
      const workspaceGroupToUpdate = await this.workspaceGroupsRepository.findOne({
        where: { id: workspaceGroupData.id }
      });
      if (workspaceGroupData.name) workspaceGroupToUpdate.name = workspaceGroupData.name;
      if (workspaceGroupData.settings) workspaceGroupToUpdate.settings = workspaceGroupData.settings;
      await this.workspaceGroupsRepository.save(workspaceGroupToUpdate);
    } else {
      throw new ArgumentOutOfRangeError();
    }
  }

  async remove(id: number[]): Promise<void> {
    // TODO: Exception
    this.logger.log(`Deleting workspace group with id: ${id.join(', ')}`);
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
