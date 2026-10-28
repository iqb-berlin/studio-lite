import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import {
  CopyUnitDto,
  CreateUnitDto,
  IdArrayDto,
  MoveToDto,
  NewNameDto,
  UnitDefinitionDto,
  UnitInListDto,
  UnitPropertiesDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { WorkspaceUnitController } from './workspace-unit.controller';
import { AuthService } from '../services/auth.service';
import { UnitService } from '../services/unit.service';
import { UnitMetadataService } from '../services/unit-metadata.service';
import { UnitDefinitionService } from '../services/unit-definition.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { SettingService } from '../services/setting.service';
import { WorkspaceService } from '../services/workspace.service';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';
import UserEntity from '../entities/user.entity';
import { UnitCommentService } from '../services/unit-comment.service';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { UnitInWorkspaceGuard } from '../guards/unit-in-workspace.guard';
import { UnitsInWorkspaceGuard } from '../guards/units-in-workspace.guard';
import { QueryUnitsInWorkspaceGuard } from '../guards/query-units-in-workspace.guard';
import { DeleteAccessGuard } from '../guards/delete-access.guard';
import { CommentAccessGuard } from '../guards/comment-access.guard';
import { WriteAccessGuard } from '../guards/write-access.guard';
import { MoveTargetAccessGuard } from '../guards/move-target-access.guard';
import { DropBoxTargetGuard } from '../guards/drop-box-target.guard';
import { CopySourcesAccessibleGuard } from '../guards/copy-sources-accessible.guard';

describe('WorkspaceUnitController', () => {
  let controller: WorkspaceUnitController;
  let unitService: UnitService;
  let unitDefinitionService: UnitDefinitionService;
  let settingsService: SettingService;
  let unitCommentService: UnitCommentService;
  let unitRichNoteService: UnitRichNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceUnitController],
      providers: [
        {
          provide: 'APP_VERSION',
          useValue: '0.0.0'
        },
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        },
        {
          provide: UnitService,
          useValue: createMock<UnitService>()
        },
        {
          provide: UnitMetadataService,
          useValue: createMock<UnitMetadataService>()
        },
        {
          provide: UnitDefinitionService,
          useValue: createMock<UnitDefinitionService>()
        },
        {
          provide: SettingService,
          useValue: createMock<SettingService>()
        },
        {
          provide: WorkspaceService,
          useValue: createMock<WorkspaceService>()
        },
        {
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        },
        {
          provide: UnitCommentService,
          useValue: createMock<UnitCommentService>()
        },
        {
          provide: UnitRichNoteService,
          useValue: createMock<UnitRichNoteService>()
        }
      ]
    }).compile();

    controller = module.get<WorkspaceUnitController>(WorkspaceUnitController);
    unitService = module.get<UnitService>(UnitService);
    unitDefinitionService = module.get<UnitDefinitionService>(UnitDefinitionService);
    settingsService = module.get<SettingService>(SettingService);
    unitCommentService = module.get<UnitCommentService>(UnitCommentService);
    unitRichNoteService = module.get<UnitRichNoteService>(UnitRichNoteService);
  });

  // The access guards ask about the workspace in the path alone; the unit has to be held to it
  // before anything else is asked about the unit (#1775).
  it.each([
    'findOnesProperties', 'findOnesMetadata', 'findOnesDefinition', 'findOnesScheme',
    'patchUnitProperties', 'patchDefinition', 'patchScheme'
  ] as const)('should hold the unit of %s to the workspace in its path', method => {
    expect(Reflect.getMetadata('__guards__', WorkspaceUnitController.prototype[method]).slice(0, 3))
      .toEqual([JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard]);
  });

  it('should hold the unit of removeUnit to the workspace in its path, after the group admin', () => {
    expect(Reflect.getMetadata('__guards__', WorkspaceUnitController.prototype.removeUnit))
      .toEqual([JwtAuthGuard, IsWorkspaceGroupAdminGuard, UnitInWorkspaceGuard]);
  });

  it.each(['moveUnits', 'patchDropBoxHistory'] as const)(
    'should hold the units in the body of %s to the workspace in its path',
    method => {
      expect(Reflect.getMetadata('__guards__', WorkspaceUnitController.prototype[method]).slice(0, 3))
        .toEqual([JwtAuthGuard, WorkspaceGuard, UnitsInWorkspaceGuard]);
    }
  );

  // Where units cross into another workspace, that one is asked about too, after the path (#1779, #1780)
  it.each([
    ['moveUnits', [UnitsInWorkspaceGuard, DeleteAccessGuard, MoveTargetAccessGuard]],
    ['patchDropBoxHistory', [UnitsInWorkspaceGuard, CommentAccessGuard, DropBoxTargetGuard]],
    ['create', [WriteAccessGuard, CopySourcesAccessibleGuard]]
  ] as const)('should hold the other workspace of %s to the user', (method, guards) => {
    expect(Reflect.getMetadata('__guards__', WorkspaceUnitController.prototype[method]))
      .toEqual([JwtAuthGuard, WorkspaceGuard, ...guards]);
  });

  // remove deletes the units of the query; a guard that read the body could be shown other units.
  it('should hold the units in the query of remove to the workspace in its path', () => {
    expect(Reflect.getMetadata('__guards__', WorkspaceUnitController.prototype.remove).slice(0, 3))
      .toEqual([JwtAuthGuard, WorkspaceGuard, QueryUnitsInWorkspaceGuard]);
  });

  describe('findAll', () => {
    it('should return units', async () => {
      const result: UnitInListDto[] = [];
      jest.spyOn(unitService, 'findAllForWorkspace').mockResolvedValue(result);

      expect(await controller.findAll({ user: { id: 1 } }, 1, false, false, null)).toBe(result);
      expect(unitService.findAllForWorkspace).toHaveBeenCalledWith(1, 1, false, null, false);
    });
  });

  describe('downloadCodingBook', () => {
    it.each([undefined, 'all', 'required', 'not-required'] as const)(
      'forwards training selection %s to the shared generator',
      async trainingRequirement => {
        const mockFileBuffer = Buffer.from('test');
        jest.spyOn(DownloadWorkspacesClass, 'getWorkspaceCodingBook').mockResolvedValue(mockFileBuffer);
        const result = await controller.downloadCodingBook(
          1,
          [1, 2],
          'json',
          'profile',
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          trainingRequirement
        );
        expect(DownloadWorkspacesClass.getWorkspaceCodingBook).toHaveBeenCalledWith(
          1,
          unitService,
          settingsService,
          expect.objectContaining({ trainingRequirement: trainingRequirement || 'all' }),
          [1, 2]
        );
        expect(result).toBeInstanceOf(StreamableFile);
      }
    );
  });

  describe('findAllWithProperties', () => {
    it('should return properties', async () => {
      const result: UnitPropertiesDto[] = [];
      jest.spyOn(unitService, 'findAllWithProperties').mockResolvedValue(result);

      expect(await controller.findAllWithProperties(1, null, null, 'other', createMock<Response>())).toBe(result);
    });

    it('should download report', async () => {
      const mockFileBuffer = Buffer.from('test');
      jest.spyOn(DownloadWorkspacesClass, 'getWorkspaceMetadataReport').mockResolvedValue(mockFileBuffer);
      const res = createMock<Response>();

      const result = await controller.findAllWithProperties(1, ['col'], [1], 'unit', res);

      expect(DownloadWorkspacesClass.getWorkspaceMetadataReport).toHaveBeenCalled();
      expect(res.set).toHaveBeenCalled();
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });

  describe('findExportContents', () => {
    it('should answer for every unit of the workspace which optional export files it fills', async () => {
      jest.spyOn(unitService, 'findAllExportSources').mockResolvedValue([
        { id: 1, metadata: { profiles: [], items: [{ id: 'item1' }] }, scheme: '{}' },
        { id: 2, metadata: null, scheme: '' }
      ]);
      jest.spyOn(unitCommentService, 'findUnitIdsWithComments').mockResolvedValue(new Set([2]));
      jest.spyOn(unitRichNoteService, 'findUnitIdsWithNotes').mockResolvedValue(new Set([1]));

      expect(await controller.findExportContents(7)).toEqual([
        {
          unitId: 1, metadata: false, items: true, codingScheme: true, comments: false, richNotes: true
        },
        {
          unitId: 2, metadata: false, items: false, codingScheme: false, comments: true, richNotes: false
        }
      ]);
      expect(unitService.findAllExportSources).toHaveBeenCalledWith(7);
      expect(unitCommentService.findUnitIdsWithComments).toHaveBeenCalledWith([1, 2]);
      expect(unitRichNoteService.findUnitIdsWithNotes).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('patchUnitProperties', () => {
    it('should record the display name of the caller as the one who changed the properties', async () => {
      const dto: UnitPropertiesDto = {} as UnitPropertiesDto;
      jest.spyOn(unitService, 'patchUnit').mockResolvedValue(undefined);
      jest.spyOn(unitService, 'getDisplayNameForUser').mockResolvedValue('User');

      await controller.patchUnitProperties(1, { id: 7 } as UserEntity, dto);

      expect(unitService.getDisplayNameForUser).toHaveBeenCalledWith(7);
      expect(unitService.patchUnit).toHaveBeenCalledWith(1, dto, 'User');
    });
  });

  describe('moveUnits', () => {
    it('should move the units out of the workspace of the path', async () => {
      const dto: MoveToDto = { ids: [1], targetId: 2 };
      const user = { id: 7 } as UserEntity;
      jest.spyOn(unitService, 'patchWorkspace').mockResolvedValue(undefined);

      await controller.moveUnits(dto, user, 3);

      expect(unitService.patchWorkspace).toHaveBeenCalledWith([1], 2, user, 3, 'moveTo');
    });
  });

  describe('patchDropBoxHistory', () => {
    it('should submit the units to the drop box a body with a target names', async () => {
      const dto: MoveToDto = { ids: [1], targetId: 2 };
      const user = { id: 7 } as UserEntity;
      jest.spyOn(unitService, 'patchDropBoxHistory').mockResolvedValue(undefined);

      await controller.patchDropBoxHistory(user, 3, dto);

      expect(unitService.patchDropBoxHistory).toHaveBeenCalledWith([1], 2, 3, user);
      expect(unitService.patchReturnDropBoxHistory).not.toHaveBeenCalled();
    });

    it('should send the units back when the body names no target', async () => {
      const dto: IdArrayDto = { ids: [1] };
      const user = { id: 7 } as UserEntity;
      jest.spyOn(unitService, 'patchReturnDropBoxHistory').mockResolvedValue(undefined);

      await controller.patchDropBoxHistory(user, 3, dto);

      expect(unitService.patchReturnDropBoxHistory).toHaveBeenCalledWith([1], 3, user);
      expect(unitService.patchDropBoxHistory).not.toHaveBeenCalled();
    });
  });

  describe('patchUnitsGroup', () => {
    it('should patch units group', async () => {
      const dto: NewNameDto = { name: 'New Group', ids: [1] };
      jest.spyOn(unitService, 'patchUnitGroup').mockResolvedValue(undefined);

      await controller.patchUnitsGroup(1, dto);
      expect(unitService.patchUnitGroup).toHaveBeenCalledWith(1, dto.name, dto.ids);
    });
  });

  describe('patchDefinition', () => {
    it('should record the display name of the caller with the definition', async () => {
      const dto: UnitDefinitionDto = {} as UnitDefinitionDto;
      jest.spyOn(unitDefinitionService, 'patchDefinition').mockResolvedValue(undefined);
      jest.spyOn(unitService, 'getDisplayNameForUser').mockResolvedValue('User');

      await controller.patchDefinition(1, { id: 7 } as UserEntity, dto);

      expect(unitService.getDisplayNameForUser).toHaveBeenCalledWith(7);
      expect(unitDefinitionService.patchDefinition).toHaveBeenCalledWith(1, dto, 'User', expect.any(Date));
    });
  });

  describe('patchScheme', () => {
    it('should record the display name of the caller with the scheme', async () => {
      const dto: UnitSchemeDto = {} as UnitSchemeDto;
      jest.spyOn(unitDefinitionService, 'patchScheme').mockResolvedValue(undefined);
      jest.spyOn(unitService, 'getDisplayNameForUser').mockResolvedValue('User');

      await controller.patchScheme(1, { id: 7 } as UserEntity, dto);

      expect(unitService.getDisplayNameForUser).toHaveBeenCalledWith(7);
      expect(unitDefinitionService.patchScheme).toHaveBeenCalledWith(1, dto, 'User', expect.any(Date));
    });
  });

  describe('create', () => {
    it('should create a unit in the workspace of the path when the body is no copy', async () => {
      const dto: CreateUnitDto = { key: 'unit', name: 'Unit' } as CreateUnitDto;
      const user = { id: 7 } as UserEntity;
      jest.spyOn(unitService, 'create').mockResolvedValue(1);

      await controller.create(3, dto, user);

      expect(unitService.create).toHaveBeenCalledWith(3, dto, user, false);
      expect(unitService.copy).not.toHaveBeenCalled();
    });

    it('should copy the units when the body says whether to take the comments', async () => {
      const dto: CopyUnitDto = { ids: [1], addComments: true };
      const user = { id: 7 } as UserEntity;
      jest.spyOn(unitService, 'copy').mockResolvedValue(undefined);

      await controller.create(3, dto, user);

      expect(unitService.copy).toHaveBeenCalledWith([1], 3, user, true);
      expect(unitService.create).not.toHaveBeenCalled();
    });
  });
});
