import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { StreamableFile } from '@nestjs/common';
import {
  GroupNameDto,
  NameDto,
  RequestReportDto,
  UsersInWorkspaceDto,
  UserWorkspaceFullDto,
  WorkspaceFullDto,
  WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import { Response } from 'express';
import { WorkspaceController } from './workspace.controller';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';
import { VeronaModulesService } from '../services/verona-modules.service';
import { SettingService } from '../services/setting.service';
import { UsersService } from '../services/users.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { UnitCommentService } from '../services/unit-comment.service';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { UnitDownloadClass } from '../classes/unit-download.class';
import UserEntity from '../entities/user.entity';

describe('WorkspaceController', () => {
  let controller: WorkspaceController;
  let workspaceService: WorkspaceService;
  let usersService: UsersService;

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
          provide: UnitService,
          useValue: createMock<UnitService>()
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
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find', () => {
    it('should return a workspace', async () => {
      const result: WorkspaceFullDto = { id: 1, name: 'Workspace', dropBoxId: 0 };
      jest.spyOn(workspaceService, 'findOne').mockResolvedValue(result);

      const res = await controller.find(1, false, null, createMock<Response>());
      expect(res).toEqual(result);
    });

    it('should download units', async () => {
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
  });

  describe('findByUser', () => {
    it('should return a user in workspace', async () => {
      const result: UserWorkspaceFullDto = {} as UserWorkspaceFullDto;
      jest.spyOn(workspaceService, 'findOneByUser').mockResolvedValue(result);

      expect(await controller.findByUser(1, 1)).toBe(result);
      expect(workspaceService.findOneByUser).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('findUsers', () => {
    it('should return users in workspace', async () => {
      const result: UsersInWorkspaceDto = [] as unknown as UsersInWorkspaceDto;
      jest.spyOn(usersService, 'findAllWorkspaceUsers').mockResolvedValue(result);

      expect(await controller.findUsers(1)).toBe(result);
      expect(usersService.findAllWorkspaceUsers).toHaveBeenCalledWith(1);
    });
  });

  describe('findGroups', () => {
    it('should return groups in workspace', async () => {
      const result: string[] = ['Group 1'];
      jest.spyOn(workspaceService, 'findAllWorkspaceGroups').mockResolvedValue(result);

      expect(await controller.findGroups(1)).toBe(result);
      expect(workspaceService.findAllWorkspaceGroups).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteUnitGroup', () => {
    it('should rename or delete unit group', async () => {
      const dto: GroupNameDto = { groupName: 'Group', operation: 'add' };
      jest.spyOn(workspaceService, 'patchGroupName').mockResolvedValue(undefined);

      await controller.deleteUnitGroup(1, dto);
      expect(workspaceService.patchGroupName).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('addUnitFiles', () => {
    it('should upload files', async () => {
      const result: RequestReportDto = {} as RequestReportDto;
      const user = {} as UserEntity;
      const files = [];
      jest.spyOn(workspaceService, 'uploadFiles').mockResolvedValue(result);

      expect(await controller.addUnitFiles(1, user, files)).toBe(result);
      expect(workspaceService.uploadFiles).toHaveBeenCalledWith(1, files, user);
    });
  });

  describe('patchSettings', () => {
    it('should patch settings', async () => {
      const dto: WorkspaceSettingsDto = {} as WorkspaceSettingsDto;
      jest.spyOn(workspaceService, 'patchSettings').mockResolvedValue(undefined);

      await controller.patchSettings(1, dto);
      expect(workspaceService.patchSettings).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('patchName', () => {
    it('should patch name', async () => {
      const dto: NameDto = { name: 'New Name' };
      jest.spyOn(workspaceService, 'patchName').mockResolvedValue(undefined);

      await controller.patchName(1, dto);
      expect(workspaceService.patchName).toHaveBeenCalledWith(1, 'New Name');
    });
  });

  describe('patchDropBox', () => {
    it('should patch dropbox id', async () => {
      jest.spyOn(workspaceService, 'patchDropBoxId').mockResolvedValue(undefined);

      await controller.patchDropBox(1, 10);
      expect(workspaceService.patchDropBoxId).toHaveBeenCalledWith(1, 10);
    });
  });
});
