import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateWorkspaceDto,
  WorkspaceGroupDto,
  WorkspaceFullDto,
  WorkspaceInListDto, RequestReportDto, WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import WorkspaceGroup from '../entities/workspace-group.entity';
import { FileIo } from '../../interfaces/file-io.interface';
import { UnitImportData } from '../../workspace/unit-import-data.class';
import { UnitService } from './unit.service';
import * as AdmZip from 'adm-zip';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspacesRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceUser)
    private workspaceUsersRepository: Repository<WorkspaceUser>,
    @InjectRepository(WorkspaceGroup)
    private workspaceGroupRepository: Repository<WorkspaceGroup>,
    private unitService: UnitService
  ) {
  }

  async findAll(userId?: number): Promise<WorkspaceInListDto[]> {
    const validWorkspaces: number[] = [];
    if (userId) {
      const workspaceUsers: WorkspaceUser[] = await this.workspaceUsersRepository.find({ where: { userId: userId } });
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

  async setWorkspacesByUser(userId: number, workspaces: number[]) {
    return this.workspaceUsersRepository.delete({ userId: userId }).then(async () => {
      await Promise.all(workspaces.map(async workspaceId => {
        const newWorkspaceUser = await this.workspaceUsersRepository.create(<WorkspaceUser>{
          userId: userId,
          workspaceId: workspaceId
        });
        await this.workspaceUsersRepository.save(newWorkspaceUser);
      }));
    });
  }

  async findAllGroupwise(userId?: number): Promise<WorkspaceGroupDto[]> {
    const workspaceGroups = await this.workspaceGroupRepository.find({ order: { name: 'ASC' } });
    const workspaces = await this.findAll(userId);
    const myReturn: WorkspaceGroupDto[] = [];
    workspaceGroups.forEach(workspaceGroup => {
      const localWorkspaceGroup = <WorkspaceGroupDto>{
        id: workspaceGroup.id,
        name: workspaceGroup.name,
        workspaces: []
      };
      workspaces.forEach(workspace => {
        if (workspaceGroup.id === workspace.groupId) {
          localWorkspaceGroup.workspaces.push(workspace);
        }
      });
      if (!userId || localWorkspaceGroup.workspaces.length > 0) {
        myReturn.push(localWorkspaceGroup);
      }
    });
    return myReturn;
  }

  async findOne(id: number): Promise<WorkspaceFullDto> {
    const workspace = await this.workspacesRepository.findOne({
      where: {id: id}
    });
    const workspaceGroup = await this.workspaceGroupRepository.findOne({
      where: {id: workspace.groupId}
    });
    return <WorkspaceFullDto>{
      id: workspace.id,
      name: workspace.name,
      groupId: workspace.groupId,
      groupName: workspaceGroup.name,
      settings: workspace.settings
    };
  }

  async create(workspace: CreateWorkspaceDto): Promise<number> {
    const newWorkspace = await this.workspacesRepository.create(workspace);
    await this.workspacesRepository.save(newWorkspace);
    return newWorkspace.id;
  }

  async patch(workspaceData: WorkspaceFullDto): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: {id: workspaceData.id}
    });
    if (workspaceData.name) workspaceToUpdate.name = workspaceData.name;
    if (workspaceData.groupId) workspaceToUpdate.groupId = workspaceData.groupId;
    await this.workspacesRepository.save(workspaceToUpdate);
  }

  async patchSettings(id: number, settings: WorkspaceSettingsDto): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: {id: id}
    });
    workspaceToUpdate.settings = settings;
    await this.workspacesRepository.save(workspaceToUpdate);
  }

  async remove(id: number | number[]): Promise<void> {
    await this.workspacesRepository.delete(id);
  }

  async uploadUnits(id: number, originalFiles: FileIo[]): Promise<RequestReportDto> {
    const functionReturn: RequestReportDto = {
      source: 'upload-units',
      messages: []
    };
    const files: FileIo[] = [];
    originalFiles.forEach(f => {
      if (f.mimetype === 'application/zip') {
        try {
          const zip = new AdmZip(f.buffer);
          const zipEntries = zip.getEntries();
          zipEntries.forEach(function (zipEntry) {
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
