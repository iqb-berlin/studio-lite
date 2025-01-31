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
import { ReviewService } from '../database/services/review.service';

@Controller('workspaces/:workspace_id/reviews')
export class WorkspaceReviewController {
  constructor(
    private reviewService: ReviewService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Review data changed' })
  @ApiTags('workspace reviews')
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
