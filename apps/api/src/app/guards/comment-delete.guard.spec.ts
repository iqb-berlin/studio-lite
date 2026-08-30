import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitCommentDto, WorkspaceFullDto } from '@studio-lite-lib/api-dto';
import { CommentDeleteGuard } from './comment-delete.guard';
import { UnitCommentService } from '../services/unit-comment.service';
import { AuthService } from '../services/auth.service';
import { WorkspaceService } from '../services/workspace.service';

describe('CommentDeleteGuard', () => {
  let guard: CommentDeleteGuard;
  let unitCommentService: DeepMocked<UnitCommentService>;
  let authService: DeepMocked<AuthService>;
  let workspaceService: DeepMocked<WorkspaceService>;

  const contextFor = (userId: number, params: Record<string, string>): ExecutionContext => createMock<
  ExecutionContext>({
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: userId }, params })
    })
  });

  const ownComment = { id: 42, userId: 1 } as UnitCommentDto;
  const foreignComment = { id: 42, userId: 2 } as UnitCommentDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UnitCommentService,
          useValue: createMock<UnitCommentService>()
        },
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        },
        {
          provide: WorkspaceService,
          useValue: createMock<WorkspaceService>()
        },
        CommentDeleteGuard
      ]
    }).compile();

    guard = module.get<CommentDeleteGuard>(CommentDeleteGuard);
    unitCommentService = module.get(UnitCommentService);
    authService = module.get(AuthService);
    workspaceService = module.get(WorkspaceService);
    authService.isAdminUser.mockResolvedValue(false);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(false);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true for the author of the comment', async () => {
    unitCommentService.findOneComment.mockResolvedValue(ownComment);

    expect(await guard.canActivate(contextFor(1, { id: '42', workspace_id: '3' }))).toBe(true);
    expect(authService.isAdminUser).not.toHaveBeenCalled();
  });

  it('should return true for an administrator', async () => {
    unitCommentService.findOneComment.mockResolvedValue(foreignComment);
    authService.isAdminUser.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor(1, { id: '42', workspace_id: '3' }))).toBe(true);
  });

  it('should return true for the admin of the workspace group', async () => {
    unitCommentService.findOneComment.mockResolvedValue(foreignComment);
    workspaceService.findOne.mockResolvedValue({ groupId: 9 } as WorkspaceFullDto);
    authService.isWorkspaceGroupAdmin.mockResolvedValue(true);

    expect(await guard.canActivate(contextFor(1, { id: '42', workspace_id: '3' }))).toBe(true);
    expect(authService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(1, 9);
  });

  it('should throw UnauthorizedException for another commenter of the workspace', async () => {
    unitCommentService.findOneComment.mockResolvedValue(foreignComment);
    workspaceService.findOne.mockResolvedValue({ groupId: 9 } as WorkspaceFullDto);

    await expect(guard.canActivate(contextFor(1, { id: '42', workspace_id: '3' })))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException for a review session', async () => {
    await expect(guard.canActivate(contextFor(0, { id: '42', workspace_id: '3' })))
      .rejects.toThrow(UnauthorizedException);
    expect(unitCommentService.findOneComment).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException without a comment in the route', async () => {
    await expect(guard.canActivate(contextFor(1, { workspace_id: '3' })))
      .rejects.toThrow(UnauthorizedException);
  });
});
