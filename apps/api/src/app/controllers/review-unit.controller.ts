import {
  Controller, Get, Param, ParseIntPipe, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiInternalServerErrorResponse, ApiOkResponse, ApiParam, ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  UnitDefinitionDto, UnitPropertiesDto, UnitSchemeDto
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

  @Get(':id/properties')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Unit metadata retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges. ' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. Review_id or unit_id are invalid. ' })
  @ApiParam({ name: 'review_id', type: Number })
  @ApiParam({ name: 'id', type: Number })
  @ApiTags('review unit')
  async findUnitProperties(
    @Param('review_id', ParseIntPipe) reviewId: number,
      @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitPropertiesDto> {
    return this.reviewService.findUnitProperties(unitId, reviewId);
  }

  @Get(':id/definition')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Unit definition retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. Unit_id is invalid. ' })
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
  @ApiUnauthorizedResponse({ description: 'No privileges.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. Unit_id is invalid. ' })
  @ApiTags('review unit')
  async findOnesScheme(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitSchemeDto> {
    return this.unitService.findOnesScheme(unitId);
  }
}
