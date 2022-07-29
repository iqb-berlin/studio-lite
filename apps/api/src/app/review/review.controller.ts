import {
  Controller, Get, Param, ParseIntPipe, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiTags
} from '@nestjs/swagger';
import {
  ReviewFullDto, UnitDefinitionDto, UnitMetadataDto
} from '@studio-lite-lib/api-dto';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewService } from '../database/services/review.service';
import { UnitService } from '../database/services/unit.service';

@Controller('review/:review_id')
export class ReviewController {
  constructor(
    private reviewService: ReviewService,
    private unitService: UnitService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: ReviewFullDto
  })
  @ApiImplicitParam({ name: 'review_id', type: Number })
  @ApiTags('review')
  async findOne(
    @Param('review_id', ParseIntPipe) reviewId: number
  ): Promise<ReviewFullDto> {
    return this.reviewService.findOne(reviewId);
  }

  @Get(':id/metadata')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: UnitMetadataDto
  })
  @ApiImplicitParam({ name: 'id', type: Number })
  @ApiTags('review')
  async getUnitMetadata(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitMetadataDto> {
    return this.unitService.findOnesMetadata(unitId);
  }

  @Get(':id/definition')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: UnitDefinitionDto
  })
  @ApiImplicitParam({ name: 'id', type: Number })
  @ApiTags('review')
  async getUnitDefinition(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitDefinitionDto> {
    return this.unitService.findOnesDefinition(unitId);
  }
}
