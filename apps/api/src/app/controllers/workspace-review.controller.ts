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
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  ReviewInListDto,
  ReviewFullDto,
  CreateReviewDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { WorkspaceId } from '../decorators/workspace.decorator';
import { ReviewService } from '../services/review.service';

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
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace review')
  async findAll(@WorkspaceId() workspaceId: number): Promise<ReviewInListDto[]> {
    return this.reviewService.findAll(workspaceId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Review retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace review')
  async findOne(
    @Param('id', ParseIntPipe) reviewId: number
  ): Promise<ReviewFullDto> {
    return this.reviewService.findOne(reviewId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Review data changed' })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace review')
  async patchOnesUnits(
    @Param('id', ParseIntPipe) reviewId: number,
      @Body() updateReview: ReviewFullDto
  ): Promise<void> {
    return this.reviewService.patch(reviewId, updateReview);
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new review in database',
    type: Number
  })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace review')
  async create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Workspace review deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace review')
  async remove(
    @Param('id', ParseIntPipe) reviewId: number): Promise<void> {
    return this.reviewService.remove(reviewId);
  }
}
