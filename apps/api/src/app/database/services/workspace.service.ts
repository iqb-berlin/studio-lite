import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateWorkspaceDto,
  WorkspaceGroupDto,
  WorkspaceFullDto,
  WorkspaceInListDto, RequestReportDto, WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import * as AdmZip from 'adm-zip';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import WorkspaceGroup from '../entities/workspace-group.entity';
import { FileIo } from '../../interfaces/file-io.interface';
import { UnitImportData } from '../../workspace/unit-import-data.class';
import { UnitService } from './unit.service';
import { AdminWorkspaceNotFoundException } from '../../exceptions/admin-workspace-not-found.exception';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import { UsersService } from './users.service';
import { WorkspaceUserService } from './workspace-user.service';
import { UnitUserService } from './unit-user.service';

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
    private workspaceUserService: WorkspaceUserService,
    private usersService: UsersService,
    private unitService: UnitService,
    private unitUserService: UnitUserService
  ) {
  }

  async findAll(userId?: number): Promise<WorkspaceInListDto[]> {
    this.logger.log(`Returning workspaces${userId ? ` for userId: ${userId}` : '.'}`);
    const validWorkspaces: number[] = [];
    // TODO: hier fehlt echte User Abfrage!
    if (userId) {
      const workspaceUsers: WorkspaceUser[] = await this.workspaceUsersRepository
        .find({ where: { userId: userId } });
      workspaceUsers.forEach(wsU => validWorkspaces.push(wsU.workspaceId));
    }
    const workspaces: Workspace[] = await this.workspacesRepository.find({ order: { name: 'ASC' } });
    const returnWorkspaces: WorkspaceInListDto[] = [];
    workspaces.forEach(workspace => {
      if (!userId || (validWorkspaces.indexOf(workspace.id) > -1)) {
        returnWorkspaces.push(<WorkspaceInListDto>{
          id: workspace.id,
          name: workspace.name,
          groupId: workspace.groupId
        });
      }
    });
    return returnWorkspaces;
  }

  // TODO: setWorkspacesForUser? //was ändert sich hier?
  async setWorkspacesByUser(userId: number, workspaceGroupId: number, workspaces: number[]) {
    this.logger.log(`Set workspace for userId: ${userId}.`);
    return this.workspaceUserService.deleteAllByWorkspaceGroup(workspaceGroupId, userId).then(async () => {
      await Promise.all(workspaces.map(async workspaceId => {
        const newWorkspaceUser = await this.workspaceUsersRepository.create(<WorkspaceUser>{
          userId: userId,
          workspaceId: workspaceId
        });
        await this.workspaceUsersRepository.save(newWorkspaceUser);

        const units = await this.unitService.findAll(workspaceId);
        this.logger.log(`Found units: ${units.length}.`);
        await Promise.all(units.map(async unit => {
          await this.unitUserService.createUnitUser(userId, unit.id);
        }));
      }));
    });
  }

  async findAllGroupwise(userId?: number): Promise<WorkspaceGroupDto[]> {
    this.logger.log(`Returning groupwise ordered workspaces${userId ? ` for userId: ${userId}` : '.'}`);
    let workspaceGroupsToAdminList: number[] = [];
    let isSuperAdmin = false;
    if (userId) {
      isSuperAdmin = await this.usersService.getUserIsAdmin(userId);
      if (!isSuperAdmin) {
        const workspaceGroupsToAdmin = await this.workspaceGroupAdminRepository.find({
          where: { userId: userId },
          select: { workspaceGroupId: true }
        });
        workspaceGroupsToAdminList = workspaceGroupsToAdmin.map(workspaceGroup => workspaceGroup.workspaceGroupId);
      }
    }
    const workspaceGroups = await this.workspaceGroupRepository.find({ order: { name: 'ASC' } });
    const workspaces = await this.findAll(userId);
    const myReturn: WorkspaceGroupDto[] = [];
    workspaceGroups.forEach(workspaceGroup => {
      const localWorkspaceGroup = <WorkspaceGroupDto>{
        id: workspaceGroup.id,
        name: workspaceGroup.name,
        isAdmin: isSuperAdmin || workspaceGroupsToAdminList.indexOf(workspaceGroup.id) >= 0,
        workspaces: workspaces.filter(ws => workspaceGroup.id === ws.groupId)
      };
      if (!userId || localWorkspaceGroup.isAdmin || localWorkspaceGroup.workspaces.length > 0) {
        myReturn.push(localWorkspaceGroup);
      }
    });
    return myReturn;
  }

  async findAllByGroup(workspaceGroupId: number): Promise<WorkspaceInListDto[]> {
    const workspaces: Workspace[] = await this.workspacesRepository.find({
      order: { name: 'ASC' },
      where: { groupId: workspaceGroupId }
    });
    const workspacesReturn: WorkspaceInListDto[] = [];
    workspaces.forEach(workspace => {
      workspacesReturn.push(<WorkspaceInListDto>{
        id: workspace.id,
        name: workspace.name,
        groupId: workspaceGroupId
      });
    });
    return workspacesReturn;
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
        groupName: workspaceGroup.name,
        settings: workspace.settings
      };
    }
    throw new AdminWorkspaceNotFoundException(id, 'GET');
  }

  async create(workspace: CreateWorkspaceDto): Promise<number> {
    this.logger.log(`Creating workspace with name: ${workspace.name}`);
    const newWorkspace = await this.workspacesRepository.create(workspace);
    await this.workspacesRepository.save(newWorkspace);
    return newWorkspace.id;
  }

  // TODO: id als Parameter
  async patch(workspaceData: WorkspaceFullDto): Promise<void> {
    this.logger.log(`Updating workspace with id: ${workspaceData.id}`);
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: workspaceData.id }
    });
    if (workspaceToUpdate) {
      if (workspaceData.name) workspaceToUpdate.name = workspaceData.name;
      if (workspaceData.groupId) workspaceToUpdate.groupId = workspaceData.groupId;
      await this.workspacesRepository.save(workspaceToUpdate);
    } else {
      throw new AdminWorkspaceNotFoundException(workspaceData.id, 'PATCH');
    }
  }

  async patchName(id: number, newName: string): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    workspaceToUpdate.name = newName;
    await this.workspacesRepository.save(workspaceToUpdate);
  }

  async patchSettings(id: number, settings: WorkspaceSettingsDto): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    workspaceToUpdate.settings = settings;
    await this.workspacesRepository.save(workspaceToUpdate);
  }

  async remove(id: number | number[]): Promise<void> {
    // TODO: sollte Fehler liefern wenn eine nicht gültige id verwendet wird
    this.logger.log(`Deleting workspace with id: ${id}`);
    await this.workspacesRepository.delete(id);
  }

  async uploadUnits(id: number, originalFiles: FileIo[]): Promise<RequestReportDto> {
    const functionReturn: RequestReportDto = {
      source: 'upload-units',
      messages: []
    };
    const files: FileIo[] = [];
    const zipMimeTypes = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'];
    originalFiles.forEach(f => {
      if (zipMimeTypes.indexOf(f.mimetype) >= 0) {
        try {
          const zip = new AdmZip(f.buffer);
          const zipEntries = zip.getEntries();
          zipEntries.forEach(zipEntry => {
            const isXmlFile = /\.xml$/i.test(zipEntry.entryName);
            const fileContent = zipEntry.getData();
            files.push({
              originalname: `${f.originalname}/${zipEntry.entryName}`,
              mimetype: isXmlFile ? 'text/xml' : 'application/octet-stream',
              fieldname: f.fieldname,
              encoding: f.encoding,
              buffer: fileContent,
              size: fileContent.length
            });
          });
        } catch {
          functionReturn.messages.push({ objectKey: f.originalname, messageKey: 'unit-upload.api-error.zip' });
        }
      } else {
        files.push(f);
      }
    });

    const unitData: UnitImportData[] = [];
    const notXmlFiles: { [fName: string]: FileIo } = {};
    const usedFiles: string[] = [];
    files.forEach(f => {
      if (f.mimetype === 'text/xml') {
        try {
          unitData.push(new UnitImportData(f));
        } catch {
          functionReturn.messages.push({ objectKey: f.originalname, messageKey: 'unit-upload.api-warning.xml-parse' });
          usedFiles.push(f.originalname);
        }
      } else {
        notXmlFiles[f.originalname] = f;
      }
    });
    await Promise.all(unitData.map(async u => {
      usedFiles.push(u.fileName);
      const newUnitId = await this.unitService.create(id, {
        key: u.key,
        name: u.name
      });
      if (newUnitId > 0) {
        if (u.definitionFileName && notXmlFiles[u.definitionFileName]) {
          u.definition = notXmlFiles[u.definitionFileName].buffer.toString();
          usedFiles.push(u.definitionFileName);
        }
        await this.unitService.patchMetadata(newUnitId, {
          id: newUnitId,
          editor: u.editor,
          player: u.player,
          description: u.description
        });
        await this.unitService.patchDefinition(newUnitId, {
          definition: u.definition
        });
        if (!u.definition) {
          functionReturn.messages.push(
            { objectKey: u.fileName, messageKey: 'unit-upload.api-warning.missing-definition' }
          );
        }
      } else {
        functionReturn.messages.push({
          objectKey: u.fileName, messageKey: 'unit-patch.duplicate-unit-id'
        });
      }
    }));
    files.forEach(f => {
      if (usedFiles.indexOf(f.originalname) < 0) {
        functionReturn.messages.push({ objectKey: f.originalname, messageKey: 'unit-upload.api-warning.ignore-file' });
      }
    });
    return functionReturn;
  }
}
