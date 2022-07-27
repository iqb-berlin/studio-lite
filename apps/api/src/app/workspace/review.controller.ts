import {
  Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Patch, Post, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags
} from '@nestjs/swagger';
import {
  ReviewInListDto,
  ReviewFullDto,
  CreateReviewDto
} from '@studio-lite-lib/api-dto';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGuard } from './workspace.guard';
import { WorkspaceId } from './workspace.decorator';
import { ReviewService } from '../database/services/review.service';

@Controller('workspace/:workspace_id/reviews')
export class ReviewController {
  constructor(
    private reviewService: ReviewService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: [ReviewInListDto]
  })
  @ApiTags('workspace reviews')
  async findAll(@WorkspaceId() workspaceId: number): Promise<ReviewInListDto[]> {
    return this.reviewService.findAll(workspaceId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: ReviewFullDto
  })
  @ApiTags('workspace reviews')
  async findOne(
    @Param('id', ParseIntPipe) reviewId: number
  ): Promise<ReviewFullDto> {
    return this.reviewService.findOne(reviewId);
  }

  @Patch(':id/name')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Name of the review changed' })
  @ApiTags('workspace reviews')
  async patchOnesName(
    @Param('id', ParseIntPipe) reviewId: number,
      @Body() updateReview: ReviewFullDto
  ): Promise<void> {
    return this.reviewService.patchName(reviewId, updateReview.name);
  }

  @Patch(':id/units')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Units of the review changed' })
  @ApiTags('workspace reviews')
  async patchOnesUnits(
    @Param('id', ParseIntPipe) reviewId: number,
      @Body() updateReview: ReviewFullDto
  ): Promise<void> {
    return this.reviewService.patchUnits(reviewId, updateReview.units);
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new review in database',
    type: Number
  })
  @ApiTags('workspace reviews')
  async create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Delete(':ids')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiTags('workspace reviews')
  async remove(@WorkspaceId() workspaceId: number,
    @Param('ids') ids: string): Promise<void> {
    const idsAsNumberArray: number[] = [];
    ids.split(';').forEach(s => idsAsNumberArray.push(parseInt(s, 10)));
    return this.reviewService.remove(idsAsNumberArray);
  }
}
