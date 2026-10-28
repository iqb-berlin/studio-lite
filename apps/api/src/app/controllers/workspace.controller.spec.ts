import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { BadRequestException, StreamableFile } from '@nestjs/common';
import { UnitDownloadSettingsDto, WorkspaceFullDto } from '@studio-lite-lib/api-dto';
import { Response } from 'express';
import { WorkspaceController } from './workspace.controller';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceImportService } from '../services/workspace-import.service';
import { UnitService } from '../services/unit.service';
import { UnitMetadataService } from '../services/unit-metadata.service';
import { UnitDefinitionService } from '../services/unit-definition.service';
import { VeronaModulesService } from '../services/verona-modules.service';
import { SettingService } from '../services/setting.service';
import { UsersService } from '../services/users.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { UnitCommentService } from '../services/unit-comment.service';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { UnitDownloadClass } from '../classes/unit-download.class';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';

describe('WorkspaceController', () => {
  let controller: WorkspaceController;
  let workspaceService: WorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        },
        {
          provide: WorkspaceService,
          useValue: createMock<WorkspaceService>()
        },
        {
          provide: WorkspaceImportService,
          useValue: createMock<WorkspaceImportService>()
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
          provide: VeronaModulesService,
          useValue: createMock<VeronaModulesService>()
        },
        {
          provide: SettingService,
          useValue: createMock<SettingService>()
        },
        {
          provide: UnitRichNoteService,
          useValue: createMock<UnitRichNoteService>()
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>()
        },
        {
          provide: WorkspaceUserService,
          useValue: createMock<WorkspaceUserService>()
        },
        {
          provide: UnitCommentService,
          useValue: createMock<UnitCommentService>()
        }
      ]
    }).compile();

    controller = module.get<WorkspaceController>(WorkspaceController);
    workspaceService = module.get<WorkspaceService>(WorkspaceService);
  });

  describe('find', () => {
    it('should return a workspace', async () => {
      const result: WorkspaceFullDto = { id: 1, name: 'Workspace', dropBoxId: 0 };
      jest.spyOn(workspaceService, 'findOne').mockResolvedValue(result);

      const res = await controller.find(1, false, null, createMock<Response>());
      expect(res).toEqual(result);
    });

    it('should download units as StreamableFile', async () => {
      const mockFileBuffer = Buffer.from('test');
      jest.spyOn(UnitDownloadClass, 'get').mockResolvedValue(mockFileBuffer);
      const res = createMock<Response>();

      const result = await controller.find(1, true, '{}', res);

      expect(UnitDownloadClass.get).toHaveBeenCalled();
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="studio-export-units.zip"'
      });
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should pass xml as explicit exportFormat argument', async () => {
      const mockFileBuffer = Buffer.from('test');
      const spy = jest.spyOn(UnitDownloadClass, 'get').mockResolvedValue(mockFileBuffer);
      const res = createMock<Response>();

      await controller.find(1, true, '{}', res);

      expect(spy.mock.lastCall[9]).toBe('xml');
    });

    it('should throw BadRequestException for malformed settings JSON', async () => {
      const res = createMock<Response>();

      await expect(controller.find(1, true, '{not-json}', res))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('downloadUnitsJson', () => {
    const minimalSettings = (): UnitDownloadSettingsDto => ({
      unitIdList: [1, 2],
      exportFormat: 'xml',
      addPlayers: false,
      addComments: false,
      addRichNotes: false,
      addTestTakersReview: 0,
      addTestTakersMonitor: 0,
      addTestTakersHot: 0,
      passwordLess: false,
      bookletSettings: []
    });

    afterEach(() => jest.restoreAllMocks());

    it('should return a StreamableFile', async () => {
      jest.spyOn(UnitDownloadClass, 'get').mockResolvedValue(Buffer.from('test'));
      const result = await controller.downloadUnitsJson(1, minimalSettings(), createMock<Response>());
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should pass json as explicit exportFormat argument', async () => {
      const spy = jest.spyOn(UnitDownloadClass, 'get').mockResolvedValue(Buffer.from('test'));

      await controller.downloadUnitsJson(1, minimalSettings(), createMock<Response>());

      expect(spy.mock.lastCall[9]).toBe('json');
    });

    it('should set application/zip content-type header', async () => {
      jest.spyOn(UnitDownloadClass, 'get').mockResolvedValue(Buffer.from('test'));
      const res = createMock<Response>();

      await controller.downloadUnitsJson(1, minimalSettings(), res);

      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="studio-export-units.zip"'
      });
    });
  });

  // Renaming and choosing the drop box asked WorkspaceGuard alone, which a commenter passes (#1715);
  // the frontend offers both only in the group-admin area.
  it.each(['patchName', 'patchDropBox'] as const)('should guard %s for the group admin', method => {
    expect(Reflect.getMetadata('__guards__', WorkspaceController.prototype[method]))
      .toEqual([JwtAuthGuard, WorkspaceGuard, IsWorkspaceGroupAdminGuard]);
  });
});
