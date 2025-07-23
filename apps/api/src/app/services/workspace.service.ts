import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateWorkspaceDto,
  WorkspaceGroupDto,
  WorkspaceFullDto,
  RequestReportDto,
  WorkspaceSettingsDto,
  UnitPropertiesDto,
  UsersWorkspaceInListDto,
  UserWorkspaceAccessDto,
  UserWorkspaceFullDto,
  CodingReportDto,
  WorkspaceInListDto,
  GroupNameDto,
  RenameGroupNameDto,
  UnitFullMetadataDto,
  ItemsMetadataValues
} from '@studio-lite-lib/api-dto';
import * as AdmZip from 'adm-zip';
import {
  VariableCodingData, RuleSet, CodeData, CodingScheme
} from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { CodingSchemeFactory, CodingSchemeProblem } from '@iqb/responses';
import Workspace from '../entities/workspace.entity';
import WorkspaceUser from '../entities/workspace-user.entity';
import WorkspaceGroup from '../entities/workspace-group.entity';
import Unit from '../entities/unit.entity';
import { FileIo } from '../interfaces/file-io.interface';
import { UnitImportData } from '../classes/unit-import-data.class';
import { UnitService } from './unit.service';
import { AdminWorkspaceNotFoundException } from '../exceptions/admin-workspace-not-found.exception';
import WorkspaceGroupAdmin from '../entities/workspace-group-admin.entity';
import { UsersService } from './users.service';
import { WorkspaceUserService } from './workspace-user.service';
import { UnitUserService } from './unit-user.service';
import {
  UserWorkspaceGroupNotAdminException
} from '../exceptions/user-workspace-group-not-admin';
// eslint-disable-next-line import/no-duplicates
import UserEntity from '../entities/user.entity';
import { UnitCommentService } from './unit-comment.service';
// eslint-disable-next-line import/no-duplicates
import User from '../entities/user.entity';
import { ItemUuidLookup } from '../interfaces/item-uuid-lookup.interface';

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
    private unitUserService: UnitUserService,
    private unitCommentService: UnitCommentService
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
            dropBoxId: workspace.dropBoxId,
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

  async findAllByGroup(workspaceGroupId: number): Promise<WorkspaceInListDto[]> {
    const workspaces: Workspace[] = await this.workspacesRepository.find({
      order: { name: 'ASC' },
      where: { groupId: workspaceGroupId }
    });
    return Promise.all(workspaces.map(async workspace => ({
      id: workspace.id,
      name: workspace.name,
      groupId: workspaceGroupId,
      dropBoxId: workspace.dropBoxId,
      unitsCount: (await this.unitsRepository.find({
        where: { workspaceId: workspace.id }
      })).length
    })));
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
        dropBoxId: workspace.dropBoxId,
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
    const newWorkspace = this.workspacesRepository.create(workspace);
    const savedWorkspace = await this.workspacesRepository.save(newWorkspace);
    this.logger.log(`Workspace created successfully with ID: ${savedWorkspace.id}`);
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
    const transformedGroups = settings.unitGroups.map(g => g.toUpperCase());
    if (transformedGroups.indexOf(newGroup.toUpperCase()) < 0) {
      settings.unitGroups.push(newGroup);
      workspaceToUpdate.settings = settings;
      await this.workspacesRepository.save(workspaceToUpdate);
    }
  }

  async getCodingReport(id: number): Promise<CodingReportDto[]> {
    const unitDataRows: CodingReportDto[] = [];
    const unitListWithMetadata = await this.unitService.findAllWithProperties(id);
    if (!unitListWithMetadata) return [];

    unitListWithMetadata.forEach((unit: UnitPropertiesDto) => {
      if (WorkspaceService.isValidScheme(unit.scheme, unit.schemer)) {
        const parsedUnitScheme = WorkspaceService.parseScheme(unit.scheme);
        if (parsedUnitScheme) {
          const validationResults = CodingSchemeFactory
            .validate(unit.variables, parsedUnitScheme.variableCodings);
          WorkspaceService
            .processVariableCodings(parsedUnitScheme, validationResults, unit, id, unitDataRows);
        }
      } else {
        WorkspaceService.addInvalidSchemeRow(unit, id, unitDataRows);
      }
    });

    return unitDataRows;
  }

  private static isValidScheme(scheme: string | undefined, schemer: string): boolean {
    return scheme && scheme !== 'undefined' && schemer.split('@')[1] >= '1.5';
  }

  private static parseScheme(scheme: string): CodingScheme | null {
    try {
      return JSON.parse(scheme);
    } catch {
      return null; // Catch JSON parsing errors gracefully
    }
  }

  static processVariableCodings(
    parsedUnitScheme: CodingScheme,
    validationResults: CodingSchemeProblem[],
    unit: UnitPropertiesDto,
    workspaceId: number,
    unitDataRows: CodingReportDto[]
  ): void {
    parsedUnitScheme.variableCodings?.filter(vc => vc.sourceType !== 'BASE_NO_VALUE')
      .forEach((codingVariable: VariableCodingData) => {
        const validationResultText = WorkspaceService.getValidationResult(validationResults, codingVariable);
        const codingType = WorkspaceService.determineCodingType(codingVariable);
        const foundItem = WorkspaceService.findMatchingItem(unit, codingVariable);

        unitDataRows.push({
          unit: WorkspaceService.generateUnitLink(workspaceId, unit),
          variable: codingVariable.alias || codingVariable.id || '–',
          item: foundItem?.id || '–',
          validation: validationResultText,
          codingType: codingType
        });
      });
  }

  static getValidationResult(
    validationResults: CodingSchemeProblem[],
    codingVariable: VariableCodingData
  ): string {
    const codingVariableId = codingVariable.alias || codingVariable.id;
    const validationResult = validationResults
      .find(v => v.variableId === codingVariableId);

    if (validationResult) {
      return validationResult.breaking ? 'Fehler' : 'Warnung';
    }
    return 'OK';
  }

  static determineCodingType(codingVariable: VariableCodingData): string {
    let closedCoding = false;
    let manualCodingOnly = true;
    let hasRules = false;

    codingVariable.codes?.forEach((code: CodeData) => {
      if (code.manualInstruction.length === 0) manualCodingOnly = false;

      code.ruleSets.forEach((ruleSet: RuleSet) => {
        hasRules ||= ruleSet.rules.length > 0;
        manualCodingOnly &&= code.manualInstruction.length > 0 && ruleSet.rules.length === 0;
      });

      closedCoding ||= ['RESIDUAL_AUTO', 'INTENDED_INCOMPLETE'].includes(code.type);
    });

    if (closedCoding) return 'geschlossen';
    if (manualCodingOnly) return 'manuell';
    if (hasRules) return 'regelbasiert';
    return 'keine Regeln';
  }

  static findMatchingItem(unit: UnitPropertiesDto, codingVariable: VariableCodingData): ItemsMetadataValues {
    const codingVariableId = codingVariable.alias || codingVariable.id;
    return unit.metadata.items?.find(item => item.variableId === codingVariableId);
  }

  static generateUnitLink(id: number, unit: UnitPropertiesDto): string {
    return `<a href=#/a/${id}/${unit.id}>${unit.key}${unit.name ? ': ' : ''}${unit.name}</a>` || '-';
  }

  static addInvalidSchemeRow(
    unit: UnitPropertiesDto,
    id: number,
    unitDataRows: CodingReportDto[]
  ): void {
    unitDataRows.push({
      unit: WorkspaceService.generateUnitLink(id, unit),
      variable: '',
      item: '',
      validation: 'Kodierschema mit Schemer Version ab 1.5 erzeugen!',
      codingType: ''
    });
  }

  async patch(workspaceData: Partial<WorkspaceFullDto>): Promise<void> {
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

  async patchWorkspaceGroups(ids:number[], newWorkspaceGroupId:number, user: User): Promise<void> {
    await Promise.all(ids.map(async id => {
      const workspace = await this.findOne(id);

      if (workspace.groupId !== newWorkspaceGroupId) {
        this.unitService.findAllForWorkspace(workspace.id).then(async units => {
          await Promise
            .all(units
              .map(async unit => this.unitService.removeUnitState(unit.id))
            );
        });
      }
      if (await this.usersService.isWorkspaceGroupAdmin(user.id, workspace.groupId)) {
        await this.patch({ id, groupId: newWorkspaceGroupId });
      } else {
        throw new UserWorkspaceGroupNotAdminException(newWorkspaceGroupId, 'PATCH');
      }
    }));
  }

  async patchGroupName(workspaceId: number, dto: GroupNameDto | RenameGroupNameDto): Promise<void> {
    if (dto.operation === 'remove') {
      return this.removeGroup(workspaceId, dto.groupName);
    }
    if (dto.operation === 'rename' && 'newGroupName' in dto) {
      return this.renameGroupName(workspaceId, dto.groupName, dto.newGroupName);
    }
    return this.createGroup(workspaceId, dto.groupName);
  }

  private async renameGroupName(id: number, oldName: string, newName: string): Promise<void> {
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

  private async removeGroup(id: number, groupName: string): Promise<void> {
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

  async patchDropBoxId(id: number, dropBoxId: number): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    workspaceToUpdate.dropBoxId = dropBoxId;
    await this.workspacesRepository.save(workspaceToUpdate);
  }

  async patchSettings(id: number, settings: WorkspaceSettingsDto): Promise<void> {
    const workspaceToUpdate = await this.workspacesRepository.findOne({
      where: { id: id }
    });
    await this.checkForProfileUpdate(workspaceToUpdate, settings);
    workspaceToUpdate.settings = settings;
    await this.workspacesRepository.save(workspaceToUpdate);
  }

  async remove(id: number | number[]): Promise<void> {
    this.logger.log(`Deleting workspace with id: ${id}`);
    await this.workspacesRepository.delete(id);
  }

  async uploadFiles(workspaceId: number, originalFiles: FileIo[], user: UserEntity): Promise<RequestReportDto> {
    const functionReturn: RequestReportDto = {
      source: 'upload-units',
      messages: []
    };
    const files = WorkspaceService.getZippedFiles(originalFiles, functionReturn);

    const { unitData, notXmlFiles, usedFiles } = WorkspaceService.readImportData(files, functionReturn);

    await Promise.all(unitData.map(async u => {
      await this.uploadFile(usedFiles, u, workspaceId, user, functionReturn, notXmlFiles);
    }));

    files.forEach(f => {
      if (usedFiles.indexOf(f.originalname) < 0) {
        functionReturn.messages.push({
          objectKey: f.originalname, messageKey: 'unit-upload.api-warning.ignore-file'
        });
      }
    });
    return functionReturn;
  }

  private static readImportData(files: FileIo[], functionReturn: RequestReportDto): {
    unitData: UnitImportData[],
    notXmlFiles: { [fName: string]: FileIo },
    usedFiles: string[]
  } {
    const unitData: UnitImportData[] = [];
    const notXmlFiles: { [fName: string]: FileIo } = {};
    const usedFiles: string[] = [];
    files.forEach(f => {
      if (f.mimetype === 'text/xml') {
        try {
          unitData.push(new UnitImportData(f));
        } catch (e) {
          functionReturn.messages
            .push({ objectKey: f.originalname, messageKey: 'unit-upload.api-warning.xml-parse' });
          usedFiles.push(f.originalname);
        }
      } else {
        notXmlFiles[f.originalname] = f;
      }
    });
    return {
      unitData, notXmlFiles, usedFiles
    };
  }

  private async uploadFile(
    usedFiles: string[],
    unitImportData: UnitImportData,
    workspaceId: number,
    user: UserEntity,
    functionReturn: RequestReportDto,
    notXmlFiles: { [fName: string]: FileIo }
  ) {
    usedFiles.push(unitImportData.fileName);
    const newUnitId = await this.unitService.create(
      workspaceId,
      { key: unitImportData.key, name: unitImportData.name },
      user,
      true
    );
    if (newUnitId > 0) {
      if (unitImportData.definitionFileName && notXmlFiles[unitImportData.definitionFileName]) {
        unitImportData.definition = notXmlFiles[unitImportData.definitionFileName].buffer.toString();
        usedFiles.push(unitImportData.definitionFileName);
      }
      await this.importDefinition(newUnitId, unitImportData, user);

      if (unitImportData.metadataFileName && notXmlFiles[unitImportData.metadataFileName]) {
        unitImportData.metadata = JSON.parse(notXmlFiles[unitImportData.metadataFileName].buffer.toString());
        usedFiles.push(unitImportData.metadataFileName);
      }
      const itemUuidLookups = await this.importUnitProperties(workspaceId, newUnitId, unitImportData, user);

      if (unitImportData.commentsFileName && notXmlFiles[unitImportData.commentsFileName]) {
        const comments = notXmlFiles[unitImportData.commentsFileName].buffer.toString();
        usedFiles.push(unitImportData.commentsFileName);
        await this.importComments(newUnitId, comments, itemUuidLookups);
      }

      if (unitImportData.codingSchemeFileName && notXmlFiles[unitImportData.codingSchemeFileName]) {
        unitImportData.codingScheme = notXmlFiles[unitImportData.codingSchemeFileName].buffer.toString();
        usedFiles.push(unitImportData.codingSchemeFileName);
        await this.importScheme(newUnitId, unitImportData, user);
      }
    } else {
      functionReturn.messages.push({
        objectKey: unitImportData.fileName, messageKey: 'unit-patch.duplicate-unit-id'
      });
    }
  }

  private static getZippedFiles(originalFiles: FileIo[], functionReturn: RequestReportDto): FileIo[] {
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
    return files;
  }

  private async importUnitProperties(
    workspaceId: number,
    newUnitId: number,
    unitImportData: UnitImportData,
    user: UserEntity
  ) : Promise<ItemUuidLookup[]> {
    let itemUuidLookups: ItemUuidLookup[] = [];
    await this.unitService.patchUnitProperties(newUnitId, {
      id: newUnitId,
      editor: unitImportData.editor,
      player: unitImportData.player,
      schemer: unitImportData.schemer,
      description: unitImportData.description,
      transcript: unitImportData.transcript,
      lastChangedMetadata: unitImportData.lastChangedMetadata,
      lastChangedDefinition: unitImportData.lastChangedDefinition,
      lastChangedScheme: unitImportData.lastChangedScheme,
      lastChangedMetadataUser: unitImportData.lastChangedMetadataUser,
      lastChangedDefinitionUser: unitImportData.lastChangedDefinitionUser,
      lastChangedSchemeUser: unitImportData.lastChangedSchemeUser
    }, user);
    if (unitImportData.metadata) {
      const workspace = await this.workspacesRepository.findOne({ where: { id: workspaceId } });
      const metadata = UnitService.setCurrentProfiles(
        workspace.settings?.unitMDProfile,
        workspace.settings?.itemMDProfile,
        unitImportData.metadata as UnitFullMetadataDto
      );
      itemUuidLookups = await this.unitService.copyItemsWithMetadata(newUnitId, metadata);
    }
    return itemUuidLookups;
  }

  private async importDefinition(
    newUnitId: number,
    unitImportData: UnitImportData,
    user: UserEntity
  ) {
    await this.unitService.patchDefinition(newUnitId, {
      definition: unitImportData.definition,
      variables: unitImportData.baseVariables
    }, user);
  }

  private async importScheme(
    newUnitId: number,
    unitImportData: UnitImportData,
    user: UserEntity
  ) {
    await this.unitService.patchScheme(newUnitId, {
      scheme: unitImportData.codingScheme,
      schemeType: unitImportData.schemeType
    }, user);
  }

  private async importComments(unitId: number, comments: string, itemUuidLookups: ItemUuidLookup[]) {
    await this.unitCommentService.createComments(JSON.parse(comments), unitId, itemUuidLookups);
  }

  private async checkForProfileUpdate(workspace: Workspace, newSettings: WorkspaceSettingsDto) {
    if ((workspace.settings?.itemMDProfile && workspace.settings?.itemMDProfile !== newSettings?.itemMDProfile) ||
    (workspace.settings?.unitMDProfile && workspace.settings?.unitMDProfile !== newSettings?.unitMDProfile)) {
      const unitIds = await this.unitService.getUnitIdsByWorkspaceId(workspace.id);
      unitIds.map(async unitId => this.unitService
        .patchMetadataCurrentProfile(unitId, newSettings.unitMDProfile, newSettings.itemMDProfile));
    }
  }
}
