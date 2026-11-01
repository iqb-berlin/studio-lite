import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateWorkspaceGroupDto,
  WorkspaceGroupFullDto,
  WorkspaceGroupInListDto,
  WorkspaceGroupSettingsDto
} from '@studio-lite-lib/api-dto';
import { ArgumentOutOfRangeError } from 'rxjs';
import { toW3idProfileId } from '@studio-lite/shared-code';
import WorkspaceGroup from '../entities/workspace-group.entity';
import { AdminWorkspaceGroupNotFoundException } from '../exceptions/admin-workspace-group-not-found.exception';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isListOfObjects(value: unknown): boolean {
  return value == null || (Array.isArray(value) && value.every(isPlainObject));
}

/**
 * The workspace groups and who administers them. {@link findAll} answers either every group or, for
 * a user id, only the groups that user administers -- the same call serves the administrator's view
 * and the group admin's.
 *
 * The group settings name the metadata profiles its workspaces use, which is why the profile ids
 * are brought into their canonical form on the way in (see `profile-id.ts`).
 */
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
    // Same canonicalization as patch(): a group can be created with a profile
    // selection in one request, and there is no global ValidationPipe that would
    // strip it, so this path must not be the one that puts the retired spelling back.
    // Only the name and the settings are taken from the body: an `id` sent along had
    // `save` overwrite that group (#2030).
    WorkspaceGroupService.checkSettings(workspaceGroup.settings);
    const newWorkspaceGroup = await this.workspaceGroupsRepository.create({
      name: workspaceGroup.name,
      settings: WorkspaceGroupService
        .normalizeProfileSelection(workspaceGroup.settings as WorkspaceGroupSettingsDto)
    });
    await this.workspaceGroupsRepository.save(newWorkspaceGroup);
    return newWorkspaceGroup.id;
  }

  /**
   * Nothing else checks the body, and the migrations on this column take the settings for an object.
   * So does {@link patch}, which spreads them into the stored ones: a list or a text left keys "0",
   * "1", ... there (#2091). Settings left out are fine; `null` is not, though `typeof` calls it an object.
   *
   * Inside, only what the interface trips over is checked (#2092): `states` and `profiles` are lists of
   * objects, `lastStateId` is a number, and each may be null, which every reader takes for none. The
   * ids of states are not checked, older data holds them as text; `richNoteTags` may be a URL as well
   * as a list; the rest is not read at group level.
   */
  private static checkSettings(settings: unknown): void {
    if (settings === undefined) return;
    if (!isPlainObject(settings)) {
      throw new BadRequestException('The settings of a workspace group must be an object.');
    }
    const malformed = [
      isListOfObjects(settings.states) ? '' : 'states',
      isListOfObjects(settings.profiles) ? '' : 'profiles',
      settings.lastStateId == null || typeof settings.lastStateId === 'number' ? '' : 'lastStateId'
    ].filter(Boolean);
    if (malformed.length) {
      throw new BadRequestException(`Malformed workspace group settings: ${malformed.join(', ')}.`);
    }
  }

  /**
   * The group's profile selection is what every workspace in it picks its unit and item profile
   * from, and those picks are compared exactly. Canonicalizes the ids on the way in so a client
   * still holding the retired github spelling cannot undo what the 19.0.0 migration did to this
   * column (#1570).
   */
  static normalizeProfileSelection(settings: WorkspaceGroupSettingsDto): WorkspaceGroupSettingsDto {
    if (!settings?.profiles?.length) return settings;
    return {
      ...settings,
      profiles: settings.profiles.map(profile => ({
        ...profile,
        id: toW3idProfileId(profile.id)
      }))
    };
  }

  async patch(id: number, workspaceGroupData: WorkspaceGroupFullDto): Promise<void> {
    this.logger.log(`Updating workspace group with id: ${workspaceGroupData.id}`);
    WorkspaceGroupService.checkSettings(workspaceGroupData.settings);
    if (id) {
      const workspaceGroupToUpdate = await this.workspaceGroupsRepository.findOne({
        where: { id: id }
      });
      if (workspaceGroupData.name !== undefined) workspaceGroupToUpdate.name = workspaceGroupData.name;
      if (workspaceGroupData.settings !== undefined) {
        workspaceGroupToUpdate.settings = {
          ...workspaceGroupToUpdate.settings,
          ...WorkspaceGroupService.normalizeProfileSelection(workspaceGroupData.settings)
        };
      }
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
