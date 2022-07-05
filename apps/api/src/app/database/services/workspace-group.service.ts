import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateWorkspaceGroupDto, WorkspaceGroupFullDto, WorkspaceGroupInListDto
} from '@studio-lite-lib/api-dto';
import { ArgumentOutOfRangeError } from 'rxjs';
import WorkspaceGroup from '../entities/workspace-group.entity';
import { AdminWorkspaceGroupNotFoundException } from '../../exceptions/admin-workspace-group-not-found.exception';

@Injectable()
export class WorkspaceGroupService {
  private readonly logger = new Logger(WorkspaceGroupService.name);

  constructor(
    @InjectRepository(WorkspaceGroup)
    private workspaceGroupsRepository: Repository<WorkspaceGroup>
  ) {}

  async findAll(): Promise<WorkspaceGroupInListDto[]> {
    // TODO: Warum werden nur id und Name zurückgegeben?
    this.logger.log('Returning all workspace groups.');
    const workspaceGroups: WorkspaceGroup[] = await this.workspaceGroupsRepository.find({ order: { name: 'ASC' } });
    const returnWorkspaces: WorkspaceGroupInListDto[] = [];
    workspaceGroups.forEach(workspaceGroup => returnWorkspaces.push(<WorkspaceGroupInListDto>{
      id: workspaceGroup.id,
      name: workspaceGroup.name
    }));
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
    throw new AdminWorkspaceGroupNotFoundException(id);
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
        where: { id: workspaceGroupData.id },
        select: { settings: true, name: true }
      });
      if (workspaceGroupData.name) workspaceGroupToUpdate.name = workspaceGroupData.name;
      if (workspaceGroupData.settings) workspaceGroupToUpdate.settings = workspaceGroupData.settings;
      await this.workspaceGroupsRepository.save(workspaceGroupToUpdate);
    } else {
      throw new ArgumentOutOfRangeError(); // TODO ?
    }
  }

  async remove(id: number): Promise<void> {
    // TODO: Exception
    this.logger.log(`Deleting workspace group with id: ${id}`);
    await this.workspaceGroupsRepository.delete(id);
  }
}
