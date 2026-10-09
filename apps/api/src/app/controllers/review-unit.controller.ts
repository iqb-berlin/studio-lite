import {
  Controller, Get, Param, ParseIntPipe, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiInternalServerErrorResponse, ApiOkResponse, ApiParam, ApiTags, ApiForbiddenResponse
} from '@nestjs/swagger';
import {
  UnitDefinitionDto, UnitPropertiesDto, UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReviewGuard } from '../guards/review.guard';
import { ReviewConfigGuard } from '../guards/review-config.guard';
import { ReviewConfigRequired } from '../decorators/review-config-required.decorator';
import { ReviewService } from '../services/review.service';
import { UnitService } from '../services/unit.service';

/**
 * `reviews/:review_id/units` -- a unit as a reviewer sees it: its properties, its definition, its
 * scheme. The properties go through the review service, which resolves the review's workspace and
 * asks for the unit within it -- so a unit id from another workspace comes back as not found.
 *
 * What the review shows is what its settings say (#1784): the scheme only with "show coding", and
 * the properties without their metadata unless the review shows metadata.
 */
@Controller('reviews/:review_id/units')
export class ReviewUnitController {
  constructor(
    private reviewService: ReviewService,
    private unitService: UnitService
  ) {}

  @Get(':unit_id/properties')
  @UseGuards(JwtAuthGuard, ReviewGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Unit metadata retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges. ' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiParam({ name: 'review_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiTags('review unit')
  async findUnitProperties(
    @Param('review_id', ParseIntPipe) reviewId: number,
    @Param('unit_id', ParseIntPipe) unitId: number
  ): Promise<UnitPropertiesDto> {
    return this.reviewService.findUnitProperties(unitId, reviewId);
  }

  @Get(':unit_id/definition')
  @UseGuards(JwtAuthGuard, ReviewGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Unit definition retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiTags('review unit')
  async getUnitDefinition(
    @Param('unit_id', ParseIntPipe) unitId: number
  ): Promise<UnitDefinitionDto> {
    return this.unitService.findOnesDefinition(unitId);
  }

  @Get(':unit_id/scheme')
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewConfigGuard)
  @ReviewConfigRequired('showCoding')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Unit scheme retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges, or the review does not show the coding.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('review unit')
  async findOnesScheme(
    @Param('unit_id', ParseIntPipe) unitId: number
  ): Promise<UnitSchemeDto> {
    return this.unitService.findOnesScheme(unitId);
  }
}
