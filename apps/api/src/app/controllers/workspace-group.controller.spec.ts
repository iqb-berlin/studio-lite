import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { WorkspaceGroupFullDto } from '@studio-lite-lib/api-dto';
import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { WorkspaceGroupController } from './workspace-group.controller';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';

describe('WorkspaceGroupController', () => {
  let controller: WorkspaceGroupController;
  let workspaceGroupService: WorkspaceGroupService;
  let workspaceService: WorkspaceService;
  let unitService: UnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceGroupController],
      providers: [
        { provide: WorkspaceGroupService, useValue: createMock<WorkspaceGroupService>() },
        { provide: WorkspaceService, useValue: createMock<WorkspaceService>() },
        { provide: UnitService, useValue: createMock<UnitService>() }
      ]
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(IsWorkspaceGroupAdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkspaceGroupController>(WorkspaceGroupController);
    workspaceGroupService = module.get<WorkspaceGroupService>(WorkspaceGroupService);
    workspaceService = module.get<WorkspaceService>(WorkspaceService);
    unitService = module.get<UnitService>(UnitService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a workspace group', async () => {
      const result: WorkspaceGroupFullDto = { id: 1, name: 'Group 1' };
      jest.spyOn(workspaceGroupService, 'findOne').mockResolvedValue(result);

      const response = await controller.findOne(1, false, createMock<Response>());
      expect(response).toEqual(result);
    });

    it('should download a report', async () => {
      const mockFileBuffer = Buffer.from('test');
      jest.spyOn(DownloadWorkspacesClass, 'getWorkspaceReport').mockResolvedValue(mockFileBuffer);
      const res = createMock<Response>();

      const result = await controller.findOne(1, true, res);

      expect(DownloadWorkspacesClass.getWorkspaceReport).toHaveBeenCalledWith(workspaceService, unitService, 1);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'attachment; filename="iqb-studio-workspace-report.xlsx"',
        'Content-Disposition': 'attachment; filename="iqb-studio-workspace-report.xlsx"'
      });
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });

  describe('patch', () => {
    it('should update a workspace group', async () => {
      const dto: WorkspaceGroupFullDto = { id: 1, name: 'New Name' };
      jest.spyOn(workspaceGroupService, 'patch').mockResolvedValue(undefined);

      await controller.patch(1, dto);
      expect(workspaceGroupService.patch).toHaveBeenCalledWith(1, dto);
    });
  });
});
