import {
  CreateUnitCommentDto,
  UnitCommentDto,
  UpdateUnitCommentDto,
  UpdateUnitCommentUnitItemsDto,
  UpdateUnitCommentVisibilityDto
} from '@studio-lite-lib/api-dto';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ReviewUnitCommentController } from './review-unit-comment.controller';
import { UnitCommentService } from '../services/unit-comment.service';
import { ItemCommentService } from '../services/item-comment.service';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReviewGuard } from '../guards/review.guard';
import { ReviewCommentAccessGuard } from '../guards/review-comment-access.guard';

describe('ReviewUnitCommentController', () => {
  let controller: ReviewUnitCommentController;
  let unitCommentService: UnitCommentService;
  let itemCommentService: ItemCommentService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewUnitCommentController],
      providers: [
        {
          provide: UnitCommentService,
          useValue: createMock<UnitCommentService>()
        },
        {
          provide: ItemCommentService,
          useValue: createMock<ItemCommentService>()
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>()
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ReviewGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ReviewCommentAccessGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReviewUnitCommentController>(ReviewUnitCommentController);
    unitCommentService = module.get<UnitCommentService>(UnitCommentService);
    itemCommentService = module.get<ItemCommentService>(ItemCommentService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOnesComments', () => {
    it('should return an array of unit comments', async () => {
      const unitId = 10;
      const mockComments: UnitCommentDto[] = [
        {
          id: 1,
          unitId,
          body: 'Test comment 1',
          userId: 1,
          userName: 'User 1',
          hidden: false,
          createdAt: new Date()
        } as UnitCommentDto,
        {
          id: 2,
          unitId,
          body: 'Test comment 2',
          userId: 2,
          userName: 'User 2',
          hidden: true,
          createdAt: new Date()
        } as UnitCommentDto
      ];

      jest.spyOn(unitCommentService, 'findOnesComments')
        .mockResolvedValue(mockComments);

      const result = await controller.findOnesComments({ user: { id: 1 } }, unitId);

      expect(result).toEqual(mockComments);
      expect(unitCommentService.findOnesComments).toHaveBeenCalledWith(unitId, 1);
      expect(unitCommentService.findOnesComments).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no comments exist', async () => {
      const unitId = 10;

      jest.spyOn(unitCommentService, 'findOnesComments')
        .mockResolvedValue([]);

      const result = await controller.findOnesComments({ user: { id: 1 } }, unitId);

      expect(result).toEqual([]);
      expect(unitCommentService.findOnesComments).toHaveBeenCalledWith(unitId, 1);
    });
  });

  describe('createComment', () => {
    const createDto: CreateUnitCommentDto = {
      unitId: 99,
      body: 'New comment',
      userId: 99,
      userName: 'Besucherin'
    } as CreateUnitCommentDto;

    it('should create the comment as the caller on the unit of the path, with the name typed at hand', async () => {
      jest.spyOn(usersService, 'commentAuthorOf').mockResolvedValue({ id: 7, name: 'Muster, Max' });
      jest.spyOn(unitCommentService, 'createCommentAs').mockResolvedValue(5);

      expect(await controller.createComment({ user: { id: 7, name: 'max' } }, 10, createDto)).toBe(5);
      expect(usersService.commentAuthorOf).toHaveBeenCalledWith(7, 'Besucherin');
      expect(unitCommentService.createCommentAs)
        .toHaveBeenCalledWith({ id: 7, name: 'Muster, Max' }, 10, createDto);
    });

    it('should ask for the author of a review link as user 0', async () => {
      jest.spyOn(usersService, 'commentAuthorOf').mockResolvedValue({ id: 0, name: 'Besucherin' });
      jest.spyOn(unitCommentService, 'createCommentAs').mockResolvedValue(6);

      expect(await controller.createComment({ user: { id: 0, name: '' } }, 10, createDto)).toBe(6);
      expect(usersService.commentAuthorOf).toHaveBeenCalledWith(0, 'Besucherin');
      expect(unitCommentService.createCommentAs)
        .toHaveBeenCalledWith({ id: 0, name: 'Besucherin' }, 10, createDto);
    });
  });

  describe('patchCommentBody', () => {
    it('should update comment body', async () => {
      const commentId = 1;
      const updateDto: UpdateUnitCommentDto = {
        body: 'Updated comment body'
      } as UpdateUnitCommentDto;

      jest.spyOn(unitCommentService, 'patchCommentBody')
        .mockResolvedValue(undefined);

      await controller.patchCommentBody(commentId, updateDto);

      expect(unitCommentService.patchCommentBody).toHaveBeenCalledWith(commentId, updateDto);
      expect(unitCommentService.patchCommentBody).toHaveBeenCalledTimes(1);
    });

    it('should handle different comment ids', async () => {
      const commentId = 99;
      const updateDto: UpdateUnitCommentDto = {
        body: 'Another updated body'
      } as UpdateUnitCommentDto;

      jest.spyOn(unitCommentService, 'patchCommentBody')
        .mockResolvedValue(undefined);

      await controller.patchCommentBody(commentId, updateDto);

      expect(unitCommentService.patchCommentBody).toHaveBeenCalledWith(commentId, updateDto);
    });
  });

  describe('patchCommentVisibility', () => {
    it('should update comment visibility', async () => {
      const commentId = 1;
      const updateDto: UpdateUnitCommentVisibilityDto = {
        hidden: true
      } as UpdateUnitCommentVisibilityDto;

      jest.spyOn(unitCommentService, 'patchCommentVisibility')
        .mockResolvedValue(undefined);

      await controller.patchCommentVisibility(commentId, updateDto);

      expect(unitCommentService.patchCommentVisibility).toHaveBeenCalledWith(commentId, updateDto);
      expect(unitCommentService.patchCommentVisibility).toHaveBeenCalledTimes(1);
    });

    it('should handle visibility set to false', async () => {
      const commentId = 2;
      const updateDto: UpdateUnitCommentVisibilityDto = {
        hidden: false
      } as UpdateUnitCommentVisibilityDto;

      jest.spyOn(unitCommentService, 'patchCommentVisibility')
        .mockResolvedValue(undefined);

      await controller.patchCommentVisibility(commentId, updateDto);

      expect(unitCommentService.patchCommentVisibility).toHaveBeenCalledWith(commentId, updateDto);
    });
  });

  describe('removeComment', () => {
    it('should delete a comment', async () => {
      const commentId = 1;

      jest.spyOn(unitCommentService, 'removeComment')
        .mockResolvedValue(undefined);

      await controller.removeComment(commentId);

      expect(unitCommentService.removeComment).toHaveBeenCalledWith(commentId);
      expect(unitCommentService.removeComment).toHaveBeenCalledTimes(1);
    });

    it('should handle different comment ids', async () => {
      const commentId = 50;

      jest.spyOn(unitCommentService, 'removeComment')
        .mockResolvedValue(undefined);

      await controller.removeComment(commentId);

      expect(unitCommentService.removeComment).toHaveBeenCalledWith(commentId);
    });
  });

  describe('patchCommentItems', () => {
    it('should update comment items', async () => {
      const commentId = 1;
      const unitId = 10;
      const updateDto: UpdateUnitCommentUnitItemsDto = {
        unitItemUuids: ['uuid-1', 'uuid-2', 'uuid-3']
      } as UpdateUnitCommentUnitItemsDto;

      jest.spyOn(itemCommentService, 'updateCommentItems')
        .mockResolvedValue(undefined);

      await controller.patchCommentItems(commentId, unitId, updateDto);

      expect(itemCommentService.updateCommentItems).toHaveBeenCalledWith(
        unitId,
        commentId,
        updateDto.unitItemUuids
      );
      expect(itemCommentService.updateCommentItems).toHaveBeenCalledTimes(1);
    });

    it('should handle empty item list', async () => {
      const commentId = 2;
      const unitId = 20;
      const updateDto: UpdateUnitCommentUnitItemsDto = {
        unitItemUuids: []
      } as UpdateUnitCommentUnitItemsDto;

      jest.spyOn(itemCommentService, 'updateCommentItems')
        .mockResolvedValue(undefined);

      await controller.patchCommentItems(commentId, unitId, updateDto);

      expect(itemCommentService.updateCommentItems).toHaveBeenCalledWith(
        unitId,
        commentId,
        []
      );
    });

    it('should handle multiple item uuids', async () => {
      const commentId = 3;
      const unitId = 30;
      const updateDto: UpdateUnitCommentUnitItemsDto = {
        unitItemUuids: ['uuid-a', 'uuid-b', 'uuid-c', 'uuid-d']
      } as UpdateUnitCommentUnitItemsDto;

      jest.spyOn(itemCommentService, 'updateCommentItems')
        .mockResolvedValue(undefined);

      await controller.patchCommentItems(commentId, unitId, updateDto);

      expect(itemCommentService.updateCommentItems).toHaveBeenCalledWith(
        unitId,
        commentId,
        updateDto.unitItemUuids
      );
    });
  });
});
