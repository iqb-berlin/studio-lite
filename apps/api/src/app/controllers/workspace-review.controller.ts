import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiTags
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
  @ApiTags('workspace review')
  async findAll(@WorkspaceId() workspaceId: number): Promise<ReviewInListDto[]> {
    return this.reviewService.findAll(workspaceId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Review retrieved successfully.' })
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
  @ApiTags('workspace review')
  async create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Workspace review deleted successfully.' })
  @ApiTags('workspace review')
  async remove(
    @Param('id', ParseIntPipe) reviewId: number): Promise<void> {
    return this.reviewService.remove(reviewId);
  }
}
