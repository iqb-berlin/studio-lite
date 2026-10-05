import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitCommentDto } from '@studio-lite-lib/api-dto';
import { CommentInUnitGuard } from './comment-in-unit.guard';
import { UnitCommentService } from '../services/unit-comment.service';
import { UnitCommentNotFoundException } from '../exceptions/unit-comment-not-found.exception';

describe('CommentInUnitGuard', () => {
  let guard: CommentInUnitGuard;
  let unitCommentService: DeepMocked<UnitCommentService>;

  const contextFor = (params: Record<string, string>, method = 'PATCH'): ExecutionContext => createMock<
    ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 1 }, params, method })
    })
  });

  const comment = createMock<UnitCommentDto>({ id: 42, userId: 1, unitId: 10 });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UnitCommentService,
          useValue: createMock<UnitCommentService>()
        },
        CommentInUnitGuard
      ]
    }).compile();

    guard = module.get<CommentInUnitGuard>(CommentInUnitGuard);
    unitCommentService = module.get(UnitCommentService);
    unitCommentService.findOneComment.mockResolvedValue(comment);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should pass when the unit in the route is the unit of the comment', async () => {
    expect(await guard.canActivate(contextFor({ id: '42', unit_id: '10' }))).toBe(true);
    expect(unitCommentService.findOneComment).toHaveBeenCalledWith(42);
  });

  it('should read the comment from comment_id as well', async () => {
    expect(await guard.canActivate(contextFor({ comment_id: '42', unit_id: '10' }))).toBe(true);
    expect(unitCommentService.findOneComment).toHaveBeenCalledWith(42);
  });

  it.each(['99', 'abc', '0', '0xa', ' 10', '10.0'])(
    'should throw UnitCommentNotFoundException for the unit %p in the route',
    async unitId => {
      await expect(guard.canActivate(contextFor({ id: '42', unit_id: unitId })))
        .rejects.toThrow(UnitCommentNotFoundException);
    }
  );

  it('should throw UnitCommentNotFoundException without a unit in the route', async () => {
    await expect(guard.canActivate(contextFor({ id: '42' })))
      .rejects.toThrow(UnitCommentNotFoundException);
  });

  it('should name the method of the request in the exception', async () => {
    await expect(guard.canActivate(contextFor({ comment_id: '42', unit_id: '99' }, 'GET')))
      .rejects.toMatchObject({ response: { id: 42, method: 'GET' } });
  });

  it('should pass on the not-found of a comment that does not exist', async () => {
    unitCommentService.findOneComment.mockRejectedValue(new UnitCommentNotFoundException(42, 'DELETE'));

    await expect(guard.canActivate(contextFor({ id: '42', unit_id: '10' })))
      .rejects.toThrow(UnitCommentNotFoundException);
  });

  it('should throw ForbiddenException without a comment in the route, without looking one up', async () => {
    await expect(guard.canActivate(contextFor({ unit_id: '10' })))
      .rejects.toThrow(ForbiddenException);
    expect(unitCommentService.findOneComment).not.toHaveBeenCalled();
  });
});
