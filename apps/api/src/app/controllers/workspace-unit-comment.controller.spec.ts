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
import { WorkspaceService } from '../services/workspace.service';
import { CommentInUnitGuard } from '../guards/comment-in-unit.guard';
import { UnitInWorkspaceGuard } from '../guards/unit-in-workspace.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { UnitService } from '../services/unit.service';
import { UsersService } from '../services/users.service';
import { ReviewService } from '../services/review.service';

describe('WorkspaceUnitCommentController', () => {
  let controller: WorkspaceUnitCommentController;
  let unitUserService: UnitUserService;
  let unitCommentService: UnitCommentService;
  let itemCommentService: ItemCommentService;
  let usersService: UsersService;

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
          provide: UsersService,
          useValue: createMock<UsersService>()
        },
        {
          provide: ReviewService,
          useValue: createMock<ReviewService>()
        }
      ]
    }).compile();

    controller = module.get<WorkspaceUnitCommentController>(WorkspaceUnitCommentController);
    unitUserService = module.get<UnitUserService>(UnitUserService);
    unitCommentService = module.get<UnitCommentService>(UnitCommentService);
    itemCommentService = module.get<ItemCommentService>(ItemCommentService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // The access guards ask about the workspace in the path alone; the unit has to be held to it
  // before anything else is asked about the unit.
  it.each([
    'findOnesComments', 'findLastSeenTimestamp', 'patchOnesUnitUserLastSeen', 'createComment',
    'patchCommentBody', 'patchCommentItems', 'removeComment',
    'patchCommentVisibility', 'toggleVote', 'getCommentVoters'
  ] as const)('should hold the unit of %s to the workspace in its path', method => {
    expect(Reflect.getMetadata('__guards__', WorkspaceUnitCommentController.prototype[method]).slice(0, 3))
      .toEqual([JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard]);
  });

  // Only DELETE held the comment to the unit in its path (#1697), and only for a numeric unit (#1696).
  // The check comes last, after the guards that decide whether the caller may do this at all.
  it.each([
    'patchCommentBody', 'patchCommentItems', 'removeComment',
    'patchCommentVisibility', 'toggleVote', 'getCommentVoters'
  ] as const)('should hold %s to the unit in its path, as the last guard', method => {
    expect(Reflect.getMetadata('__guards__', WorkspaceUnitCommentController.prototype[method]).at(-1))
      .toBe(CommentInUnitGuard);
  });

  describe('findOnesComments', () => {
    it('should return comments for a unit', async () => {
      const result: UnitCommentDto[] = [];
      const mockRequest = { user: { id: 1 } };
      jest.spyOn(unitCommentService, 'findOnesComments').mockResolvedValue(result);

      expect(await controller.findOnesComments(mockRequest, 1)).toBe(result);
      expect(unitCommentService.findOnesComments).toHaveBeenCalledWith(1, 1);
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
    it('should patch the last seen timestamp of the caller, whatever user the body names', async () => {
      const lastSeen = new Date(2026, 9, 9);
      const dto: UpdateUnitUserDto = { userId: 99, lastSeenCommentChangedAt: lastSeen };
      jest.spyOn(unitUserService, 'patchUnitUserCommentsLastSeen').mockResolvedValue(undefined);

      await controller.patchOnesUnitUserLastSeen({ user: { id: 7 } }, 1, dto);
      expect(unitUserService.patchUnitUserCommentsLastSeen).toHaveBeenCalledWith(1, 7, lastSeen);
    });
  });

  describe('createComment', () => {
    it('should create the comment as the caller on the unit of the path, whatever the body names', async () => {
      const dto: CreateUnitCommentDto = {
        body: 'comment', unitId: 99, userId: 99, userName: 'someone else', hidden: false
      };
      jest.spyOn(usersService, 'commentAuthorOf').mockResolvedValue({ id: 7, name: 'Muster, Max' });
      jest.spyOn(unitCommentService, 'createCommentAs').mockResolvedValue(1);

      expect(await controller.createComment({ user: { id: 7, name: 'max' } }, 1, dto)).toBe(1);
      expect(usersService.commentAuthorOf).toHaveBeenCalledWith(7);
      expect(unitCommentService.createCommentAs).toHaveBeenCalledWith({ id: 7, name: 'Muster, Max' }, 1, dto);
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
