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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('ReviewUnitCommentController', () => {
  let controller: ReviewUnitCommentController;
  let unitCommentService: UnitCommentService;
  let itemCommentService: ItemCommentService;

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
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReviewUnitCommentController>(ReviewUnitCommentController);
    unitCommentService = module.get<UnitCommentService>(UnitCommentService);
    itemCommentService = module.get<ItemCommentService>(ItemCommentService);
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

      const result = await controller.findOnesComments(unitId);

      expect(result).toEqual(mockComments);
      expect(unitCommentService.findOnesComments).toHaveBeenCalledWith(unitId);
      expect(unitCommentService.findOnesComments).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no comments exist', async () => {
      const unitId = 10;

      jest.spyOn(unitCommentService, 'findOnesComments')
        .mockResolvedValue([]);

      const result = await controller.findOnesComments(unitId);

      expect(result).toEqual([]);
      expect(unitCommentService.findOnesComments).toHaveBeenCalledWith(unitId);
    });
  });

  describe('createComment', () => {
    it('should create a new comment and return its id', async () => {
      const createDto: CreateUnitCommentDto = {
        unitId: 10,
        body: 'New comment',
        userId: 1
      } as CreateUnitCommentDto;
      const newCommentId = 5;

      jest.spyOn(unitCommentService, 'createComment')
        .mockResolvedValue(newCommentId);

      const result = await controller.createComment(createDto);

      expect(result).toBe(newCommentId);
      expect(unitCommentService.createComment).toHaveBeenCalledWith(createDto);
      expect(unitCommentService.createComment).toHaveBeenCalledTimes(1);
    });

    it('should handle comments with different content', async () => {
      const createDto: CreateUnitCommentDto = {
        unitId: 20,
        body: 'Another comment with different content',
        userId: 2
      } as CreateUnitCommentDto;
      const newCommentId = 10;

      jest.spyOn(unitCommentService, 'createComment')
        .mockResolvedValue(newCommentId);

      const result = await controller.createComment(createDto);

      expect(result).toBe(newCommentId);
      expect(unitCommentService.createComment).toHaveBeenCalledWith(createDto);
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
