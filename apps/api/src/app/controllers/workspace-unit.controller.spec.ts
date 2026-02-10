import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import {
  CodingReportDto,
  CopyUnitDto,
  CreateUnitDto,
  IdArrayDto,
  MoveToDto,
  NewNameDto,
  UnitDefinitionDto,
  UnitFullMetadataDto,
  UnitInListDto,
  UnitPropertiesDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { WorkspaceUnitController } from './workspace-unit.controller';
import { AuthService } from '../services/auth.service';
import { UnitService } from '../services/unit.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { SettingService } from '../services/setting.service';
import { WorkspaceService } from '../services/workspace.service';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';
import UserEntity from '../entities/user.entity';

describe('WorkspaceUnitController', () => {
  let controller: WorkspaceUnitController;
  let unitService: UnitService;
  let workspaceService: WorkspaceService;

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
        }
      ]
    }).compile();

    controller = module.get<WorkspaceUnitController>(WorkspaceUnitController);
    unitService = module.get<UnitService>(UnitService);
    workspaceService = module.get<WorkspaceService>(WorkspaceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return units', async () => {
      const result: UnitInListDto[] = [];
      jest.spyOn(unitService, 'findAllForWorkspace').mockResolvedValue(result);

      expect(await controller.findAll({ user: { id: 1 } }, 1, false, false, null)).toBe(result);
      expect(unitService.findAllForWorkspace).toHaveBeenCalledWith(1, 1, false, null, false);
    });
  });

  describe('getCodingReport', () => {
    it('should return coding report', async () => {
      const result: CodingReportDto[] = [];
      jest.spyOn(workspaceService, 'getCodingReport').mockResolvedValue(result);

      expect(await controller.getCodingReport(1)).toBe(result);
      expect(workspaceService.getCodingReport).toHaveBeenCalledWith(1);
    });
  });

  describe('downloadCodingBook', () => {
    it('should download coding book', async () => {
      const mockFileBuffer = Buffer.from('test');
      jest.spyOn(DownloadWorkspacesClass, 'getWorkspaceCodingBook').mockResolvedValue(mockFileBuffer);

      const result = await controller.downloadCodingBook(
        1, [1, 2], 'json', 'profile', false, false, false, false, false, false, false, false
      );

      expect(DownloadWorkspacesClass.getWorkspaceCodingBook).toHaveBeenCalled();
      expect(result).toBeInstanceOf(StreamableFile);
    });
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

  describe('findOnesProperties', () => {
    it('should return unit properties', async () => {
      const result: UnitPropertiesDto = {} as UnitPropertiesDto;
      jest.spyOn(unitService, 'findOnesProperties').mockResolvedValue(result);

      expect(await controller.findOnesProperties(1, 1)).toBe(result);
      expect(unitService.findOnesProperties).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('findOnesMetadata', () => {
    it('should return unit metadata', async () => {
      const result: UnitFullMetadataDto = {} as UnitFullMetadataDto;
      jest.spyOn(unitService, 'findOnesMetadata').mockResolvedValue(result);

      expect(await controller.findOnesMetadata(1)).toBe(result);
      expect(unitService.findOnesMetadata).toHaveBeenCalledWith(1);
    });
  });

  describe('findOnesDefinition', () => {
    it('should return unit definition', async () => {
      const result: UnitDefinitionDto = {} as UnitDefinitionDto;
      jest.spyOn(unitService, 'findOnesDefinition').mockResolvedValue(result);

      expect(await controller.findOnesDefinition(1)).toBe(result);
      expect(unitService.findOnesDefinition).toHaveBeenCalledWith(1);
    });
  });

  describe('findOnesScheme', () => {
    it('should return unit scheme', async () => {
      const result: UnitSchemeDto = {} as UnitSchemeDto;
      jest.spyOn(unitService, 'findOnesScheme').mockResolvedValue(result);

      expect(await controller.findOnesScheme(1)).toBe(result);
      expect(unitService.findOnesScheme).toHaveBeenCalledWith(1);
    });
  });

  describe('patchUnitProperties', () => {
    it('should patch unit properties', async () => {
      const dto: UnitPropertiesDto = {} as UnitPropertiesDto;
      jest.spyOn(unitService, 'patchUnit').mockResolvedValue(undefined);
      jest.spyOn(unitService, 'getDisplayNameForUser').mockResolvedValue('User');

      await controller.patchUnitProperties(1, { id: 1 } as UserEntity, dto);
      expect(unitService.patchUnit).toHaveBeenCalled();
    });
  });

  describe('moveUnits', () => {
    it('should move units', async () => {
      const dto: MoveToDto = { ids: [1], targetId: 2 };
      jest.spyOn(unitService, 'patchWorkspace').mockResolvedValue(undefined);

      await controller.moveUnits(dto, { id: 1 } as UserEntity, 1);
      expect(unitService.patchWorkspace).toHaveBeenCalled();
    });
  });

  describe('patchDropBoxHistory', () => {
    it('should patch dropbox history (move)', async () => {
      const dto: MoveToDto = { ids: [1], targetId: 2 };
      jest.spyOn(unitService, 'patchDropBoxHistory').mockResolvedValue(undefined);

      await controller.patchDropBoxHistory({ id: 1 } as UserEntity, 1, dto);
      expect(unitService.patchDropBoxHistory).toHaveBeenCalled();
    });

    it('should patch dropbox history (return)', async () => {
      const dto: IdArrayDto = { ids: [1] };
      jest.spyOn(unitService, 'patchReturnDropBoxHistory').mockResolvedValue(undefined);

      await controller.patchDropBoxHistory({ id: 1 } as UserEntity, 1, dto);
      expect(unitService.patchReturnDropBoxHistory).toHaveBeenCalled();
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
    it('should patch definition', async () => {
      const dto: UnitDefinitionDto = {} as UnitDefinitionDto;
      jest.spyOn(unitService, 'patchDefinition').mockResolvedValue(undefined);
      jest.spyOn(unitService, 'getDisplayNameForUser').mockResolvedValue('User');

      await controller.patchDefinition(1, { id: 1 } as UserEntity, dto);
      expect(unitService.patchDefinition).toHaveBeenCalled();
    });
  });

  describe('patchScheme', () => {
    it('should patch scheme', async () => {
      const dto: UnitSchemeDto = {} as UnitSchemeDto;
      jest.spyOn(unitService, 'patchScheme').mockResolvedValue(undefined);
      jest.spyOn(unitService, 'getDisplayNameForUser').mockResolvedValue('User');

      await controller.patchScheme(1, { id: 1 } as UserEntity, dto);
      expect(unitService.patchScheme).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a unit', async () => {
      const dto: CreateUnitDto = { key: 'unit', name: 'Unit' } as CreateUnitDto;
      jest.spyOn(unitService, 'create').mockResolvedValue(1);

      await controller.create(1, dto, { id: 1 } as UserEntity);
      expect(unitService.create).toHaveBeenCalled();
    });

    it('should copy units', async () => {
      const dto: CopyUnitDto = { ids: [1], addComments: true };
      jest.spyOn(unitService, 'copy').mockResolvedValue(undefined);

      await controller.create(1, dto, { id: 1 } as UserEntity);
      expect(unitService.copy).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove units', async () => {
      jest.spyOn(unitService, 'remove').mockResolvedValue(undefined);

      await controller.remove([1, 2]);
      expect(unitService.remove).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('removeUnit', () => {
    it('should remove a unit', async () => {
      jest.spyOn(unitService, 'remove').mockResolvedValue(undefined);

      await controller.removeUnit(1);
      expect(unitService.remove).toHaveBeenCalledWith(1);
    });
  });
});
