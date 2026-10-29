import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreateWorkspaceDto,
  WorkspaceGroupDto,
  WorkspaceFullDto,
  WorkspaceSettingsDto,
  UsersWorkspaceInListDto,
  UserWorkspaceAccessDto,
  UserWorkspaceFullDto,
  CodingReportDto,
  WorkspaceInListDto,
  GroupNameDto,
  RenameGroupNameDto
} from '@studio-lite-lib/api-dto';
import { profileIdsMatch, toW3idProfileId } from '@studio-lite/shared-code';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import WorkspaceGroup from '../entities/workspace-group.entity';
import Unit from '../entities/unit.entity';
import { CodingReportClass } from '../classes/coding-report.class';
import { UnitService } from './unit.service';
import { UnitMetadataService } from './unit-metadata.service';
import { AdminWorkspaceNotFoundException } from '../exceptions/admin-workspace-not-found.exception';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import { UsersService } from './users.service';
import { WorkspaceUserService } from './workspace-user.service';
import { UnitUserService } from './unit-user.service';
import { GroupAdminUnprocessableWorkspaceException } from '../exceptions/group-admin-unprocessable-workspace.exception';

/**
 * The workspaces: creating and deleting them, moving them between groups, their settings, their
 * unit groups, and who works in them.
 *
 * The settings are the part that reaches furthest -- they decide the default modules and the
 * metadata profiles of every unit in the workspace, so a change here is felt by units that are
 * never touched themselves.
 *
 * A unit group is not a table: it is a name in the settings and the same name on each unit, which
 * is why creating, renaming and removing one all write both sides.
 *
 * The coding report over a workspace is asked for here and built by {@link CodingReportClass} from
 * the units alone.
 */
@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(
    @InjectRepository(Workspace)
    private workspacesRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceUser)
    private workspaceUsersRepository: Repository<WorkspaceUser>,
    @InjectRepository(WorkspaceGroup)
    private workspaceGroupRepository: Repository<WorkspaceGroup>,
    @InjectRepository(WorkspaceGroupAdmin)
    private workspaceGroupAdminRepository: Repository<WorkspaceGroupAdmin>,
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
    private workspaceUserService: WorkspaceUserService,
    private usersService: UsersService,
    private unitService: UnitService,
    private unitMetadataService: UnitMetadataService,
    private unitUserService: UnitUserService
  ) {}

  async getAllWorkspaces(): Promise<WorkspaceFullDto[]> {
    return this.workspacesRepository.find({ order: { id: 'ASC' } });
  }

  async findAll(userId: number): Promise<UsersWorkspaceInListDto[]> {
    this.logger.log(
      `Returning workspaces${userId ? ` for userId: ${userId}` : '.'}`
    );
    const validWorkspaces: UserWorkspaceAccessDto[] = [];
    if (userId) {
      const workspaceUsers: WorkspaceUser[] =
        await this.workspaceUsersRepository.find({ where: { userId: userId } });
      workspaceUsers.forEach(wsU => validWorkspaces.push({
        id: wsU.workspaceId,
        accessLevel: wsU.accessLevel
      })
      );
    }
    const workspaces: Workspace[] = await this.workspacesRepository.find({
      order: { name: 'ASC' }
    });
    return Promise.all(
      workspaces
        .filter(
          w => !userId ||
            validWorkspaces.find(validWorkspace => validWorkspace.id === w.id)
        )
        .map(async workspace => ({
          id: workspace.id,
          name: workspace.name,
          userAccessLevel:
            validWorkspaces.find(
              validWorkspace => validWorkspace.id === workspace.id
            )?.accessLevel || 0,
          groupId: workspace.groupId,
          dropBoxId: workspace.dropBoxId,
          settings: workspace.settings,
          unitsCount: (
            await this.unitsRepository.find({
              where: { workspaceId: workspace.id }
            })
          ).length
        }))
    );
  }

  async setWorkspacesByUser(
    userId: number,
    workspaceGroupId: number,
    workspaces: UserWorkspaceAccessDto[]
  ) {
    this.logger.log(`Set workspace for userId: ${userId}.`);
    return this.workspaceUserService
      .deleteAllByWorkspaceGroup(workspaceGroupId, userId)
      .then(async () => {
        await Promise.all(
          workspaces.map(async workspace => {
            const newWorkspaceUser = this.workspaceUsersRepository.create(<
              WorkspaceUser
            >{
              userId: userId,
              workspaceId: workspace.id,
              accessLevel: workspace.accessLevel
            });
            await this.workspaceUsersRepository.save(newWorkspaceUser);

            const units = await this.unitService.findAllForWorkspace(
              workspace.id
            );
            this.logger.log(`Found units: ${units.length}.`);
            await Promise.all(
              units.map(async unit => {
                await this.unitUserService.createUnitUser(userId, unit.id);
              })
            );
          })
        );
      });
  }

  /**
   * A user's workspaces as a group admin sees them: only those in groups the requester
   * administers; an administrator sees all of them (#1650). The group-admin area asks this to tick
   * the boxes of the group it shows, and handed out the person's workspaces in foreign groups too.
   *
   * {@link findAll} stays as it is: it also builds a user's own list of workspaces
   * ({@link findAllGroupwise}), where a filter by administered groups would hide them from anyone
   * who administers none.
   */
  async findAllInAdministeredGroups(userId: number, requesterId: number): Promise<UsersWorkspaceInListDto[]> {
    const workspaces = await this.findAll(userId);
    if (await this.usersService.getUserIsAdmin(requesterId)) return workspaces;
    const administeredGroups = await this.workspaceGroupAdminRepository.find({
      where: { userId: requesterId },
      select: { workspaceGroupId: true }
    });
    const groupIds = new Set(administeredGroups.map(group => group.workspaceGroupId));
    return workspaces.filter(workspace => groupIds.has(workspace.groupId));
  }

  async findAllGroupwise(userId?: number): Promise<WorkspaceGroupDto[]> {
    this.logger.log(
      `Returning groupwise ordered workspaces${
        userId ? ` for userId: ${userId}` : '.'
      }`
    );
    let workspaceGroupsToAdminList: number[] = [];
    let isSuperAdmin = false;
    if (userId) {
      isSuperAdmin = await this.usersService.getUserIsAdmin(userId);
      if (!isSuperAdmin) {
        const workspaceGroupsToAdmin =
          await this.workspaceGroupAdminRepository.find({
            where: { userId: userId },
            select: { workspaceGroupId: true }
          });
        workspaceGroupsToAdminList = workspaceGroupsToAdmin.map(
          workspaceGroup => workspaceGroup.workspaceGroupId
        );
      }
    }
    const workspaceGroups = await this.workspaceGroupRepository.find({
      order: { name: 'ASC' }
    });
    const workspaces = await this.findAll(userId);
    const myReturn: WorkspaceGroupDto[] = [];
    workspaceGroups.forEach(workspaceGroup => {
      const localWorkspaceGroup = <WorkspaceGroupDto>{
        id: workspaceGroup.id,
        name: workspaceGroup.name,
        isAdmin:
          isSuperAdmin ||
          workspaceGroupsToAdminList.indexOf(workspaceGroup.id) >= 0,
        workspaces: workspaces.filter(ws => workspaceGroup.id === ws.groupId)
      };
      if (
        !userId ||
        localWorkspaceGroup.isAdmin ||
        localWorkspaceGroup.workspaces.length > 0
      ) {
        myReturn.push(localWorkspaceGroup);
      }
    });
    return myReturn;
  }

  async findAllByGroup(
    workspaceGroupId: number
  ): Promise<WorkspaceInListDto[]> {
    const workspaces: Workspace[] = await this.workspacesRepository.find({
      order: { name: 'ASC' },
      where: { groupId: workspaceGroupId }
    });
    return Promise.all(
      workspaces.map(async workspace => ({
        id: workspace.id,
        name: workspace.name,
        groupId: workspaceGroupId,
        dropBoxId: workspace.dropBoxId,
        settings: workspace.settings,
        unitsCount: (
          await this.unitsRepository.find({
            where: { workspaceId: workspace.id }
          })
        ).length
      }))
    );
  }

  /**
   * The groups these workspaces belong to, each named once, in a single query. Ids that belong to
   * no workspace are simply absent: a caller deciding whether someone may touch this list wants
   * the groups it actually reaches, not a failure over an id that has gone in the meantime.
   */
  async findGroupIdsOfWorkspaces(ids: number[]): Promise<number[]> {
    const workspaces = await this.workspacesRepository.find({
      where: { id: In(ids) },
      select: { groupId: true }
    });
    return [...new Set(workspaces.map(workspace => workspace.groupId))];
  }

  async findOne(id: number): Promise<WorkspaceFullDto> {
    this.logger.log(`Returning workspace with id: ${id}`);
    const workspace = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    if (workspace) {
      // TODO: ist das richtig, hier eine zweite Anfrage zu starten?
      const workspaceGroup = await this.workspaceGroupRepository.findOne({
        where: { id: workspace.groupId }
      });
      return <WorkspaceFullDto>{
        id: workspace.id,
        name: workspace.name,
        groupId: workspace.groupId,
        dropBoxId: workspace.dropBoxId,
        groupName: workspaceGroup.name,
        settings: workspace.settings
      };
    }
    throw new AdminWorkspaceNotFoundException(id, 'GET');
  }

  async findOneByUser(
    id: number,
    userId: number
  ): Promise<UserWorkspaceFullDto> {
    this.logger.log(`Returning workspace with id: ${id}`);
    const workspace = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    // The level includes the one an administrator holds without being assigned (#1571); the
    // frontend opens the workspace with it, so an unassigned administrator sees it as commenter.
    const userAccessLevel = await this.workspaceUserService.accessLevel(userId, id);
    if (workspace && userAccessLevel !== null) {
      const workspaceGroup = await this.workspaceGroupRepository.findOne({
        where: { id: workspace.groupId }
      });
      return <UserWorkspaceFullDto>{
        id: workspace.id,
        name: workspace.name,
        groupId: workspace.groupId,
        dropBoxId: workspace.dropBoxId,
        groupName: workspaceGroup.name,
        userAccessLevel: userAccessLevel,
        settings: workspace.settings
      };
    }
    throw new AdminWorkspaceNotFoundException(id, 'GET');
  }

  async findAllWorkspaceGroups(id: number): Promise<string[]> {
    this.logger.log(`Returning groups of workspace with id: ${id}`);
    const workspace = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    if (workspace) {
      const settingsGroups = workspace.settings?.unitGroups || [];
      const unitGroups = await this.unitsRepository.find({
        where: { workspaceId: id },
        select: { groupName: true }
      });
      const groups = unitGroups
        .map(u => u.groupName)
        .filter(
          (value, index, self) => self.indexOf(value) === index && settingsGroups.indexOf(value) < 0
        );
      return [...groups, ...settingsGroups].filter(g => !!g).sort();
    }
    throw new AdminWorkspaceNotFoundException(id, 'GET');
  }

  async create(workspace: CreateWorkspaceDto): Promise<number> {
    const workspaceGroup = await this.workspaceGroupRepository.findOne({
      where: { id: workspace.groupId }
    });
    const isBackupFolder = workspaceGroup.name.toLowerCase().includes('backup');
    if (isBackupFolder) {
      const workspaces = await this.workspacesRepository.find({
        where: { groupId: workspace.groupId }
      });
      if (workspaces.length >= 10) {
        // same maximum used in frontend
        this.logger.warn(
          `Cannot create more than 10 workspaces in backup group: ${workspaceGroup.name}`
        );
        throw new GroupAdminUnprocessableWorkspaceException(
          workspace.groupId,
          'POST'
        );
      }
    }
    this.logger.log(`Creating workspace with name: ${workspace.name}`);
    const newWorkspace = this.workspacesRepository.create({
      ...workspace,
      settings: {
        ...new WorkspaceSettingsDto(),
        hiddenRoutes: ['notes']
      }
    });
    const savedWorkspace = await this.workspacesRepository.save(newWorkspace);
    this.logger.log(
      `Workspace created successfully with ID: ${savedWorkspace.id}`
    );
    return savedWorkspace.id;
  }

  private async createGroup(id: number, newGroup: string): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    const settings = workspaceToUpdate.settings || {
      defaultEditor: '',
      defaultPlayer: '',
      defaultSchemer: '',
      unitGroups: []
    };
    if (!settings.unitGroups) settings.unitGroups = [];
    const transformedGroups = settings.unitGroups.map(g => g.toUpperCase());
    if (transformedGroups.indexOf(newGroup.toUpperCase()) < 0) {
      settings.unitGroups.push(newGroup);
      workspaceToUpdate.settings = settings;
      await this.workspacesRepository.save(workspaceToUpdate);
    }
  }

  /**
   * One row per coding variable of every unit in the workspace -- see {@link CodingReportClass}
   * for what the rows say.
   */
  async getCodingReport(id: number): Promise<CodingReportDto[]> {
    const unitListWithMetadata = await this.unitService.findAllWithProperties(
      id
    );
    if (!unitListWithMetadata) return [];
    return CodingReportClass.build(id, unitListWithMetadata);
  }

  /**
   * Moves workspaces into another group and resets the state of their units; both groups have been
   * checked by the controller (#1984). Ids that belong to no workspace are passed over, as by
   * {@link remove}. Move and reset happen together or not at all: a workspace left moved with its
   * old states would be passed over by a second attempt, as it is in the target group already.
   */
  async patchWorkspaceGroups(ids: number[], newWorkspaceGroupId: number): Promise<void> {
    // Nothing validates the body: a target sent as a string would never equal a stored group,
    // and the states of workspaces that stay where they are would be reset.
    const targetId = Number(newWorkspaceGroupId);
    const workspaces = await this.workspacesRepository.find({
      where: { id: In(ids) },
      select: { id: true, groupId: true }
    });
    const movedIds = workspaces
      .filter(workspace => workspace.groupId !== targetId)
      .map(workspace => workspace.id);
    if (!movedIds.length) return;
    await this.workspacesRepository.manager.transaction(async manager => {
      await manager.update(Workspace, { id: In(movedIds) }, { groupId: targetId });
      await manager.update(Unit, { workspaceId: In(movedIds) }, { state: '0' });
    });
  }

  async patchGroupName(
    workspaceId: number,
    dto: GroupNameDto | RenameGroupNameDto
  ): Promise<void> {
    if (dto.operation === 'remove') {
      return this.removeGroup(workspaceId, dto.groupName);
    }
    if (dto.operation === 'rename' && 'newGroupName' in dto) {
      return this.renameGroupName(workspaceId, dto.groupName, dto.newGroupName);
    }
    return this.createGroup(workspaceId, dto.groupName);
  }

  private async renameGroupName(
    id: number,
    oldName: string,
    newName: string
  ): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    const settings = workspaceToUpdate.settings || {
      defaultEditor: '',
      defaultPlayer: '',
      defaultSchemer: '',
      unitGroups: []
    };
    if (!settings.unitGroups) settings.unitGroups = [];
    const groupPos = settings.unitGroups.indexOf(oldName);
    if (groupPos >= 0) settings.unitGroups = settings.unitGroups.filter(g => g !== oldName);
    settings.unitGroups.push(newName);
    workspaceToUpdate.settings = settings;
    await this.workspacesRepository.save(workspaceToUpdate);
    await this.unitsRepository.update(
      {
        workspaceId: id,
        groupName: oldName
      },
      {
        groupName: newName
      }
    );
  }

  private async removeGroup(id: number, groupName: string): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    if (workspaceToUpdate.settings?.unitGroups) {
      const groupPos = workspaceToUpdate.settings.unitGroups.indexOf(groupName);
      if (groupPos >= 0) {
        workspaceToUpdate.settings.unitGroups =
          workspaceToUpdate.settings.unitGroups.filter(g => g !== groupName);
      }
      await this.workspacesRepository.save(workspaceToUpdate);
    }
    await this.unitsRepository.update(
      {
        workspaceId: id,
        groupName: groupName
      },
      {
        groupName: ''
      }
    );
  }

  async patchName(id: number, newName: string): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    workspaceToUpdate.name = newName;
    await this.workspacesRepository.save(workspaceToUpdate);
  }

  /** The drop box set for the workspace, or `null` when it has none or does not exist. */
  async dropBoxIdOf(id: number): Promise<number | null> {
    const workspace = await this.workspacesRepository.findOne({
      where: { id: id },
      select: ['id', 'dropBoxId']
    });
    return workspace?.dropBoxId ?? null;
  }

  /**
   * Sets the workspace that units of this one are submitted to, or none. A drop box is another
   * workspace of the same group, as the group admin's dialog offers it; anything else was saved as
   * sent, and the submission check of #1780 then sent units wherever it pointed (#1805). A workspace
   * of another group, one that does not exist and the workspace itself are all answered as not
   * found, so the answer tells nothing about workspaces outside the group.
   */
  async patchDropBoxId(id: number, dropBoxId: number | null): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    if (dropBoxId) {
      const dropBox = await this.workspacesRepository.findOne({
        where: { id: dropBoxId },
        select: { id: true, groupId: true }
      });
      // The route hands the workspace id on as the text it arrives as (see WorkspaceId)
      if (!dropBox || dropBox.id === Number(id) || dropBox.groupId !== workspaceToUpdate.groupId) {
        throw new AdminWorkspaceNotFoundException(dropBoxId, 'PATCH');
      }
    }
    workspaceToUpdate.dropBoxId = dropBoxId || null;
    await this.workspacesRepository.save(workspaceToUpdate);
  }

  /**
   * The configured profile urls are canonicalized before anything else looks at them:
   * checkForProfileUpdate and the mat-select in the settings dialog compare them exactly against
   * the ids stored on the metadata, so a client still holding the retired github spelling must not
   * put it back into the column the 19.0.0 migration just rewrote (#1570).
   */
  static normalizeProfileSettings(settings: WorkspaceSettingsDto): WorkspaceSettingsDto {
    if (!settings) return settings;
    return {
      ...settings,
      ...(settings.unitMDProfile && { unitMDProfile: toW3idProfileId(settings.unitMDProfile) }),
      ...(settings.itemMDProfile && { itemMDProfile: toW3idProfileId(settings.itemMDProfile) })
    };
  }

  /**
   * PATCH, not PUT: a key the request does not carry keeps its stored value.
   *
   * Replacing the whole blob turned every partial request into a removal — a PATCH that only
   * changed defaultEditor arrived without the profile keys, counted as "profile removed", and hid
   * the metadata of every unit in the workspace (order = -1, gone from the export) (#1576).
   * Removing a profile deliberately still works: send the key with null or ''. The distinction is
   * reliable because no ValidationPipe instantiates the DTO — the body arrives as parsed JSON,
   * where an absent key is undefined and JSON cannot encode undefined explicitly.
   */
  async patchSettings(
    id: number,
    settings: WorkspaceSettingsDto
  ): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    const normalizedSettings = WorkspaceService.normalizeProfileSettings(settings);
    const mergedSettings: WorkspaceSettingsDto = {
      ...workspaceToUpdate.settings,
      ...WorkspaceService.definedSettings(normalizedSettings)
    };
    // Reclassify first, save after: if a unit update fails, the request fails
    // visibly and the stored settings still name the profile the metadata was
    // classified under. The reverse order would commit settings whose
    // reclassification never happened — silently, since nothing awaited it.
    await this.checkForProfileUpdate(workspaceToUpdate, mergedSettings);
    workspaceToUpdate.settings = mergedSettings;
    await this.workspacesRepository.save(workspaceToUpdate);
  }

  // Guards the merge above against non-JSON callers (tests, future internal
  // use) that could pass explicitly-undefined keys: spreading those would
  // overwrite stored values with undefined.
  private static definedSettings(settings: WorkspaceSettingsDto): Partial<WorkspaceSettingsDto> {
    return Object.fromEntries(
      Object.entries(settings ?? {}).filter(([, value]) => value !== undefined)
    ) as Partial<WorkspaceSettingsDto>;
  }

  async remove(id: number | number[]): Promise<void> {
    this.logger.log(`Deleting workspace with id: ${id}`);
    await this.workspacesRepository.delete(id);
  }

  // Compared via profileIdsMatch, not string equality: a stored github spelling
  // and an incoming w3id of the same profile are the same configuration, and
  // reclassifying on a spelling change would be wrong — patchMetadataCurrentProfile
  // matches by the same canonicalization downstream. Both sides coalesce to ''
  // so that "never configured" (undefined) and "explicitly removed" (null/'')
  // count as the same absent state instead of as a change.
  private async checkForProfileUpdate(
    workspace: Workspace,
    newSettings: WorkspaceSettingsDto
  ): Promise<void> {
    const unitProfileChanged = !profileIdsMatch(
      workspace.settings?.unitMDProfile ?? '',
      newSettings?.unitMDProfile ?? ''
    );
    const itemProfileChanged = !profileIdsMatch(
      workspace.settings?.itemMDProfile ?? '',
      newSettings?.itemMDProfile ?? ''
    );
    if (!unitProfileChanged && !itemProfileChanged) return;
    const unitIds = await this.unitService.getUnitIdsByWorkspaceId(
      workspace.id
    );
    // Awaited on purpose. Fire-and-forget left the reclassification racing the
    // settings save with no error path at all — a failure mid-way meant settings
    // on the new profile, part of the units still classified under the old one,
    // and an unhandled rejection as the only trace (#1576).
    await Promise.all(
      unitIds.map(unitId => this.unitMetadataService.patchMetadataCurrentProfile(
        unitId,
        newSettings?.unitMDProfile,
        newSettings?.itemMDProfile
      ))
    );
  }
}
