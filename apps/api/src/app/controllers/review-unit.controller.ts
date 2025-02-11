import {
  Controller, Get, Param, ParseIntPipe, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags
} from '@nestjs/swagger';
import {
  UnitDefinitionDto, UnitMetadataDto, UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReviewService } from '../services/review.service';
import { UnitService } from '../services/unit.service';

@Controller('reviews/:review_id/units')
export class ReviewUnitController {
  constructor(
    private reviewService: ReviewService,
    private unitService: UnitService
  ) {}

  @Get(':id/metadata')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Unit metadata retrieved successfully.' })
  @ApiParam({ name: 'review_id', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiTags('review unit')
  async getUnitMetadata(
    @Param('review_id', ParseIntPipe) reviewId: number,
      @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitMetadataDto> {
    return this.reviewService.findUnitMetadata(unitId, reviewId);
  }

  @Get(':id/definition')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Unit definition retrieved successfully.' })
  @ApiParam({ name: 'id', type: Number })
  @ApiTags('review unit')
  async getUnitDefinition(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitDefinitionDto> {
    return this.unitService.findOnesDefinition(unitId);
  }

  @Get(':id/scheme')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Unit scheme retrieved successfully.' })
  @ApiTags('review unit')
  async findOnesScheme(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitSchemeDto> {
    return this.unitService.findOnesScheme(unitId);
  }
}
