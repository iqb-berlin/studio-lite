import {
  Controller, Get, Param, ParseIntPipe, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiParam, ApiTags
} from '@nestjs/swagger';
import {
  ReviewFullDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReviewService } from '../services/review.service';

@Controller('reviews')
export class ReviewController {
  constructor(
    private reviewService: ReviewService
  ) {}

  @Get(':review_id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: ReviewFullDto
  })
  @ApiParam({ name: 'review_id', type: Number })
  @ApiTags('review')
  async findOne(
    @Param('review_id', ParseIntPipe) reviewId: number
  ): Promise<ReviewFullDto> {
    return this.reviewService.findOne(reviewId);
  }
}
