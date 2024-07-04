import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import {
  CreateWorkspaceDto, WorkspaceGroupDto, WorkspaceFullDto, RequestReportDto, WorkspaceSettingsDto,
  UnitMetadataDto, UnitMetadataValues, UsersWorkspaceInListDto, UserWorkspaceAccessDto, UserWorkspaceFullDto,
  CodingReportDto
} from '@studio-lite-lib/api-dto';
import * as AdmZip from 'adm-zip';
import {
  CodeData, CodingRule, CodingScheme, CodingSchemeProblem, RuleSet, VariableCodingData
} from '@iqb/responses';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import WorkspaceGroup from '../entities/workspace-group.entity';
import Unit from '../entities/unit.entity';
import { FileIo } from '../../interfaces/file-io.interface';
import { UnitImportData } from '../../workspace/unit-import-data.class';
import { UnitService } from './unit.service';
import { AdminWorkspaceNotFoundException } from '../../exceptions/admin-workspace-not-found.exception';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import { UsersService } from './users.service';
import { WorkspaceUserService } from './workspace-user.service';
import { UnitUserService } from './unit-user.service';
import {
  UserWorkspaceGroupNotAdminException
} from '../../exceptions/user-workspace-group-not-admin';

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
    private unitUserService: UnitUserService
  ) {
  }

  async findAll(userId: number): Promise<UsersWorkspaceInListDto[]> {
    this.logger.log(`Returning workspaces${userId ? ` for userId: ${userId}` : '.'}`);
    const validWorkspaces: UserWorkspaceAccessDto[] = [];
    if (userId) {
      const workspaceUsers: WorkspaceUser[] = await this.workspaceUsersRepository
        .find({ where: { userId: userId } });
      workspaceUsers.forEach(wsU => validWorkspaces.push(
        { id: wsU.workspaceId, accessLevel: wsU.accessLevel }
      ));
    }
    const workspaces: Workspace[] = await this.workspacesRepository
      .find({ order: { name: 'ASC' } });
    return Promise.all(
      workspaces
        .filter(w => !userId || validWorkspaces
          .find(validWorkspace => validWorkspace.id === w.id))
        .map(async workspace => (
          {
            id: workspace.id,
            name: workspace.name,
            userAccessLevel: validWorkspaces
              .find(validWorkspace => validWorkspace.id === workspace.id)?.accessLevel || 0,
            groupId: workspace.groupId,
            unitsCount: (await this.unitsRepository.find({
              where: { workspaceId: workspace.id }
            })).length
          })
        ));
  }

  async setWorkspacesByUser(userId: number, workspaceGroupId: number, workspaces: UserWorkspaceAccessDto[]) {
    this.logger.log(`Set workspace for userId: ${userId}.`);
    return this.workspaceUserService.deleteAllByWorkspaceGroup(workspaceGroupId, userId).then(async () => {
      await Promise.all(workspaces.map(async workspace => {
        const newWorkspaceUser = this.workspaceUsersRepository.create(<WorkspaceUser>{
          userId: userId,
          workspaceId: workspace.id,
          accessLevel: workspace.accessLevel
        });
        await this.workspaceUsersRepository.save(newWorkspaceUser);

        const units = await this.unitService.findAllForWorkspace(workspace.id);
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

  async findAllByGroup(workspaceGroupId: number): Promise<UsersWorkspaceInListDto[]> {
    const workspaces: Workspace[] = await this.workspacesRepository.find({
      order: { name: 'ASC' },
      where: { groupId: workspaceGroupId }
    });
    return Promise.all(workspaces.map(async workspace => ({
      id: workspace.id,
      name: workspace.name,
      groupId: workspaceGroupId,
      unitsCount: (await this.unitsRepository.find({
        where: { workspaceId: workspace.id }
      })).length
    } as UsersWorkspaceInListDto)));
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

  async findOneByUser(id: number, userId: number): Promise<UserWorkspaceFullDto> {
    this.logger.log(`Returning workspace with id: ${id}`);
    const workspace = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    const workspaceUser = await this.workspaceUsersRepository.findOne({
      where: { workspaceId: id, userId: userId }
    });
    if (workspace && workspaceUser) {
      const workspaceGroup = await this.workspaceGroupRepository.findOne({
        where: { id: workspace.groupId }
      });
      return <UserWorkspaceFullDto>{
        id: workspace.id,
        name: workspace.name,
        groupId: workspace.groupId,
        groupName: workspaceGroup.name,
        userAccessLevel: workspaceUser.accessLevel,
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
      const settingsGroups = workspace.settings ? workspace.settings.unitGroups : [];
      const unitGroups = await this.unitsRepository.find({
        where: { workspaceId: id },
        select: { groupName: true }
      });
      const groups = unitGroups.map(u => u.groupName).filter(
        (value, index, self) => (self.indexOf(value) === index) && (settingsGroups.indexOf(value) < 0)
      );
      return [...groups, ...settingsGroups].filter(g => !!g).sort();
    }
    throw new AdminWorkspaceNotFoundException(id, 'GET');
  }

  async create(workspace: CreateWorkspaceDto): Promise<number> {
    this.logger.log(`Creating workspace with name: ${workspace.name}`);
    const newWorkspace = await this.workspacesRepository.create(workspace);
    await this.workspacesRepository.save(newWorkspace);
    return newWorkspace.id;
  }

  async createGroup(id: number, newGroup: string): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    const settings = workspaceToUpdate.settings || {
      defaultEditor: '',
      defaultPlayer: '',
      defaultSchemer: '',
      unitGroups: []
    };
    const transformedGroups = settings.unitGroups.map(g => g.toUpperCase());
    if (transformedGroups.indexOf(newGroup.toUpperCase()) < 0) {
      settings.unitGroups.push(newGroup);
      workspaceToUpdate.settings = settings;
      await this.workspacesRepository.save(workspaceToUpdate);
    }
  }

  async getCodingReport(id: number): Promise<CodingReportDto[]> {
    const unitDataRows:CodingReportDto[] = [];
    const unitListWithMetadata = await this.unitService.findAllWithMetadata(id);
    if (unitListWithMetadata) {
      unitListWithMetadata?.forEach((unit: UnitMetadataDto) => {
        if (unit.scheme && unit.scheme !== 'undefined' && unit.schemer.split('@')[1] >= '1.5') {
          const parsedUnitScheme = JSON.parse(unit.scheme as string);
          let codingType:string;
          if (parsedUnitScheme) {
            const schemer = new CodingScheme(parsedUnitScheme.variableCodings);
            const validation = schemer.validate(unit.variables);
            let validationResultText: string;
            parsedUnitScheme.variableCodings?.forEach((codingVariable: VariableCodingData) => {
              const validationResult = validation
                .find((v: CodingSchemeProblem) => v.variableId === codingVariable.id);
              if (validationResult) {
                if (validationResult.breaking) {
                  validationResultText = 'Fehler';
                } else validationResultText = 'Warnung';
              } else {
                validationResultText = 'OK';
              }
              /* eslint-disable  @typescript-eslint/no-explicit-any */
              const foundItem = unit.metadata.items?.find((item: any) => item.variableId === codingVariable.id);
              let closedCoding = false;
              let manualCodingOnly = true;
              let hasRules = false;
              if (codingVariable.codes?.length > 0) {
                codingVariable.codes.forEach((code: CodeData) => {
                  if (code.manualInstruction.length === 0)manualCodingOnly = false;
                  code.ruleSets.forEach((ruleSet: RuleSet) => {
                    if (code.manualInstruction.length > 0 && ruleSet.rules.length > 0) manualCodingOnly = false;
                    hasRules = ruleSet.rules.length > 0;
                    ruleSet.rules.forEach((rule: CodingRule) => {
                      if (rule.method === 'ELSE') {
                        closedCoding = true;
                      }
                    });
                  });
                });
              }
              if (closedCoding) {
                codingType = 'geschlossen';
              } else if (manualCodingOnly) {
                codingType = 'manuell';
              } else if (hasRules) {
                codingType = 'regelbasiert';
              } else {
                codingType = 'keine Regeln';
              }
              unitDataRows.push({
                unit: `${unit.key}${unit.name ? ':' : ''}${unit.name}` || '-',
                variable: codingVariable.id || '–',
                item: foundItem?.id || '–',
                validation: validationResultText,
                codingType: codingType
              });
            });
          }
        } else {
          unitDataRows.push({
            unit: `${unit.key}${unit.name ? ':' : ''}${unit.name}` || '-',
            variable: '',
            item: '',
            validation: 'Kodierschema mit Schemer Version ab 1.5 erzeugen!',
            codingType: ''
          });
        }
      });
      return unitDataRows as CodingReportDto[];
    }
    return [];
  }

  // TODO: id als Parameter
  async patch(workspaceData: WorkspaceFullDto): Promise<void> {
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

  async patchWorkspaceGroups(ids:string[], newWorkspaceGroupId:number, userId:number): Promise<void> {
    await Promise.all(ids.map(async id => {
      const parsedId = parseInt(id, 10);
      const workspaceById = await this.findOne(parsedId);
      if (await this.usersService.isWorkspaceGroupAdmin(userId, workspaceById.groupId)) {
        await this.patch({ id: parsedId, groupId: newWorkspaceGroupId });
      } else {
        throw new UserWorkspaceGroupNotAdminException(newWorkspaceGroupId, 'PATCH');
      }
    }));
  }

  async patchGroupName(id: number, oldName: string, newName: string): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    const settings = workspaceToUpdate.settings || {
      defaultEditor: '',
      defaultPlayer: '',
      defaultSchemer: '',
      unitGroups: []
    };
    const groupPos = settings.unitGroups.indexOf(oldName);
    if (groupPos >= 0) settings.unitGroups = settings.unitGroups.filter(g => g !== oldName);
    settings.unitGroups.push(newName);
    workspaceToUpdate.settings = settings;
    await this.workspacesRepository.save(workspaceToUpdate);
    await this.unitsRepository.update({
      workspaceId: id,
      groupName: oldName
    },
    {
      groupName: newName
    });
  }

  async patchUnitsGroup(id: number, groupName: string, units: number[]): Promise<void> {
    await this.unitsRepository.update({
      workspaceId: id,
      groupName: groupName,
      id: Not(In(units))
    },
    {
      groupName: ''
    });
    await this.unitsRepository.update({
      workspaceId: id,
      id: In(units)
    },
    {
      groupName: groupName
    });
  }

  async removeGroup(id: number, groupName: string): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    if (workspaceToUpdate.settings) {
      const groupPos = workspaceToUpdate.settings.unitGroups.indexOf(groupName);
      if (groupPos >= 0) {
        workspaceToUpdate.settings.unitGroups = workspaceToUpdate.settings.unitGroups.filter(g => g !== groupName);
      }
      await this.workspacesRepository.save(workspaceToUpdate);
    }
    await this.unitsRepository.update({
      workspaceId: id,
      groupName: groupName
    },
    {
      groupName: ''
    });
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
        } catch (e) {
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

        if (u.metadataFileName && notXmlFiles[u.metadataFileName]) {
          u.metadata = JSON.parse(notXmlFiles[u.metadataFileName].buffer.toString());
          usedFiles.push(u.metadataFileName);
        }
        await this.unitService.patchDefinition(newUnitId, {
          definition: u.definition,
          variables: u.baseVariables
        });
        if (u.codingSchemeFileName && notXmlFiles[u.codingSchemeFileName]) {
          u.codingScheme = notXmlFiles[u.codingSchemeFileName].buffer.toString();
          usedFiles.push(u.codingSchemeFileName);
          await this.unitService.patchScheme(newUnitId, {
            scheme: u.codingScheme,
            schemeType: u.schemeType
          });
        }
        await this.unitService.patchMetadata(newUnitId, {
          id: newUnitId,
          editor: u.editor,
          player: u.player,
          schemer: u.schemer,
          metadata: u.metadata as UnitMetadataValues,
          description: u.description,
          transcript: u.transcript,
          reference: u.reference,
          lastChangedMetadata: u.lastChangedMetadata,
          lastChangedDefinition: u.lastChangedDefinition,
          lastChangedScheme: u.lastChangedScheme
        });
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
