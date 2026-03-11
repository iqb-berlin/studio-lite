import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { UnitItemDto, UnitItemWithMetadataDto } from '@studio-lite-lib/api-dto';
import { WorkspaceUnitItemController } from './workspace-unit-item.controller';
import { UnitItemService } from '../services/unit-item.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { AppVersionGuard } from '../guards/app-version.guard';
import { WriteAccessGuard } from '../guards/write-access.guard';
import { WorkspaceAccessGuard } from '../guards/workspace-access.guard';
import { WriteOrGroupAdminAccessGuard } from '../guards/write-or-group-admin-access.guard';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import UnitCommentUnitItem from '../entities/unit-comment-unit-item.entity';

describe('WorkspaceUnitItemController', () => {
  let controller: WorkspaceUnitItemController;
  let unitItemService: UnitItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceUnitItemController],
      providers: [
        { provide: UnitItemService, useValue: createMock<UnitItemService>() },
        { provide: AuthService, useValue: createMock<AuthService>() },
        { provide: WorkspaceService, useValue: createMock<WorkspaceService>() },
        { provide: WorkspaceUserService, useValue: createMock<WorkspaceUserService>() },
        WriteOrGroupAdminAccessGuard
      ]
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AppVersionGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WriteAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceAccessGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WriteOrGroupAdminAccessGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WorkspaceUnitItemController>(WorkspaceUnitItemController);
    unitItemService = module.get<UnitItemService>(UnitItemService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return unit items without metadata', async () => {
      const result: UnitItemDto[] = [];
      jest.spyOn(unitItemService, 'getAllByUnitId').mockResolvedValue(result);

      expect(await controller.findAll(1, true)).toBe(result);
      expect(unitItemService.getAllByUnitId).toHaveBeenCalledWith(1);
    });

    it('should return unit items with metadata', async () => {
      const result: UnitItemWithMetadataDto[] = [];
      jest.spyOn(unitItemService, 'getAllByUnitIdWithMetadata').mockResolvedValue(result);

      expect(await controller.findAll(1, false)).toBe(result);
      expect(unitItemService.getAllByUnitIdWithMetadata).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a unit item', async () => {
      const dto: UnitItemWithMetadataDto = {} as UnitItemWithMetadataDto;
      jest.spyOn(unitItemService, 'addItem').mockResolvedValue('new-uuid');

      expect(await controller.create(1, dto)).toBe('new-uuid');
      expect(unitItemService.addItem).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a unit item', async () => {
      jest.spyOn(unitItemService, 'removeItem').mockResolvedValue(undefined);

      await controller.remove('uuid');
      expect(unitItemService.removeItem).toHaveBeenCalledWith('uuid');
    });
  });

  describe('findItemCommentsByUnitId', () => {
    it('should return item comments', async () => {
      const result: UnitCommentUnitItem[] = [];
      jest.spyOn(unitItemService, 'findItemCommentsByUnitId').mockResolvedValue(result);

      expect(await controller.findItemCommentsByUnitId(1)).toBe(result);
      expect(unitItemService.findItemCommentsByUnitId).toHaveBeenCalledWith(1);
    });
  });
});
