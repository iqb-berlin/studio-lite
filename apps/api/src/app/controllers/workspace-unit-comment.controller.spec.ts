import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import {
  CreateUnitCommentDto,
  UnitCommentDto,
  UpdateUnitCommentDto,
  UpdateUnitCommentUnitItemsDto,
  UpdateUnitCommentVisibilityDto,
  UpdateUnitUserDto
} from '@studio-lite-lib/api-dto';
import { AuthService } from '../services/auth.service';
import { UnitUserService } from '../services/unit-user.service';
import { UnitCommentService } from '../services/unit-comment.service';
import { WorkspaceUserService } from '../services/workspace-user.service';
import { WorkspaceUnitCommentController } from './workspace-unit-comment.controller';
import { ItemCommentService } from '../services/item-comment.service';

describe('WorkspaceUnitCommentController', () => {
  let controller: WorkspaceUnitCommentController;
  let unitUserService: UnitUserService;
  let unitCommentService: UnitCommentService;
  let itemCommentService: ItemCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceUnitCommentController],
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
          provide: UnitUserService,
          useValue: createMock<UnitUserService>()
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
          provide: ItemCommentService,
          useValue: createMock<ItemCommentService>()
        }
      ]
    }).compile();

    controller = module.get<WorkspaceUnitCommentController>(WorkspaceUnitCommentController);
    unitUserService = module.get<UnitUserService>(UnitUserService);
    unitCommentService = module.get<UnitCommentService>(UnitCommentService);
    itemCommentService = module.get<ItemCommentService>(ItemCommentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOnesComments', () => {
    it('should return comments for a unit', async () => {
      const result: UnitCommentDto[] = [];
      jest.spyOn(unitCommentService, 'findOnesComments').mockResolvedValue(result);

      expect(await controller.findOnesComments(1)).toBe(result);
      expect(unitCommentService.findOnesComments).toHaveBeenCalledWith(1);
    });
  });

  describe('findLastSeenTimestamp', () => {
    it('should return last seen timestamp', async () => {
      const date = new Date();
      jest.spyOn(unitUserService, 'findLastSeenCommentTimestamp').mockResolvedValue(date);

      expect(await controller.findLastSeenTimestamp({ user: { id: 1 } }, 1)).toBe(date);
      expect(unitUserService.findLastSeenCommentTimestamp).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('patchOnesUnitUserLastSeen', () => {
    it('should patch last seen timestamp', async () => {
      const dto: UpdateUnitUserDto = {} as UpdateUnitUserDto;
      jest.spyOn(unitUserService, 'patchUnitUserCommentsLastSeen').mockResolvedValue(undefined);

      await controller.patchOnesUnitUserLastSeen(1, dto);
      expect(unitUserService.patchUnitUserCommentsLastSeen).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const dto: CreateUnitCommentDto = {
        body: 'comment', unitId: 1, userId: 1, userName: 'user', hidden: false
      };
      jest.spyOn(unitCommentService, 'createComment').mockResolvedValue(1);

      expect(await controller.createComment(dto)).toBe(1);
      expect(unitCommentService.createComment).toHaveBeenCalledWith(dto);
    });
  });

  describe('patchCommentBody', () => {
    it('should patch comment body', async () => {
      const dto: UpdateUnitCommentDto = { body: 'new body', userId: 1 };
      jest.spyOn(unitCommentService, 'patchCommentBody').mockResolvedValue(undefined);

      await controller.patchCommentBody(1, dto);
      expect(unitCommentService.patchCommentBody).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('patchCommentItems', () => {
    it('should patch comment items', async () => {
      const dto: UpdateUnitCommentUnitItemsDto = { unitItemUuids: ['item-uuid'], userId: 1 };
      jest.spyOn(itemCommentService, 'updateCommentItems').mockResolvedValue(undefined);

      await controller.patchCommentItems(1, 1, dto);
      expect(itemCommentService.updateCommentItems).toHaveBeenCalledWith(1, 1, ['item-uuid']);
    });
  });

  describe('removeComment', () => {
    it('should remove a comment', async () => {
      jest.spyOn(unitCommentService, 'removeComment').mockResolvedValue(undefined);

      await controller.removeComment(1);
      expect(unitCommentService.removeComment).toHaveBeenCalledWith(1);
    });
  });

  describe('patchCommentVisibility', () => {
    it('should patch comment visibility', async () => {
      const dto: UpdateUnitCommentVisibilityDto = { hidden: true, userId: 1 };
      jest.spyOn(unitCommentService, 'patchCommentVisibility').mockResolvedValue(undefined);

      await controller.patchCommentVisibility(1, dto);
      expect(unitCommentService.patchCommentVisibility).toHaveBeenCalledWith(1, dto);
    });
  });
});
