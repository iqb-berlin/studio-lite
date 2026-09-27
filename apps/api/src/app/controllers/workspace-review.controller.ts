import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiForbiddenResponse, ApiNotFoundResponse, ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import {
  ReviewInListDto,
  ReviewFullDto,
  CreateReviewDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { ManageOrGroupAdminAccessGuard } from '../guards/manage-or-group-admin-access.guard';
import { WorkspaceId } from '../decorators/workspace.decorator';
import { ReviewService } from '../services/review.service';

/**
 * `workspaces/:workspace_id/reviews` -- managing the reviews of a workspace: which units they
 * contain, what a reviewer may do in them, and the link they are reached by. What the reviewer
 * themselves then calls is in {@link ReviewController} and its neighbours.
 *
 * Access to the workspace is all these routes ask for, no access level: whoever is in the workspace
 * may set up a review of it.
 */
@Controller('workspaces/:workspace_id/reviews')
export class WorkspaceReviewController {
  constructor(
    private reviewService: ReviewService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Reviews retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace review')
  async findAll(@WorkspaceId() workspaceId: number): Promise<ReviewInListDto[]> {
    return this.reviewService.findAll(workspaceId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Review retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiNotFoundResponse({ description: 'No such review in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace review')
  async findOne(
    @WorkspaceId() workspaceId: number,
    @Param('id', ParseIntPipe) reviewId: number
  ): Promise<ReviewFullDto> {
    return this.reviewService.findOne(reviewId, workspaceId);
  }

  // Creating, changing and deleting reviews need the manage level -- the frontend offers the review
  // dialog from level 3 on -- or the group's admin. They used to ask WorkspaceGuard alone, which
  // every member passes, down to a commenter (#1715).
  @Patch(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, ManageOrGroupAdminAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Review data changed' })
  @ApiForbiddenResponse({ description: 'No manage privileges in the workspace.' })
  @ApiNotFoundResponse({ description: 'No such review in the workspace.' })
  @ApiUnprocessableEntityResponse({ description: 'No name, or a unit of another workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace review')
  async patchReview(
    @WorkspaceId() workspaceId: number,
    @Param('id', ParseIntPipe) reviewId: number,
    @Body() updateReview: ReviewFullDto
  ): Promise<void> {
    return this.reviewService.patch(workspaceId, reviewId, updateReview);
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, ManageOrGroupAdminAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new review in database',
    type: Number
  })
  @ApiUnprocessableEntityResponse({ description: 'Saving of review is forbidden.' })
  @ApiForbiddenResponse({ description: 'No manage privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace review')
  async create(@WorkspaceId() workspaceId: number, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(workspaceId, createReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, ManageOrGroupAdminAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Workspace review deleted successfully.' })
  @ApiForbiddenResponse({ description: 'No manage privileges in the workspace.' })
  @ApiNotFoundResponse({ description: 'No such review in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace review')
  async remove(
    @WorkspaceId() workspaceId: number,
    @Param('id', ParseIntPipe) reviewId: number): Promise<void> {
    return this.reviewService.remove(workspaceId, reviewId);
  }
}
