import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags
} from '@nestjs/swagger';
import { UnitItemDto, UnitItemWithMetadataDto } from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReviewGuard } from '../guards/review.guard';
import { UnitItemService } from '../services/unit-item.service';
import { ReviewService } from '../services/review.service';
import { UnitId } from '../decorators/unit-id.decorator';

/**
 * `reviews/:review_id/units/:unit_id/items` -- the items of a unit as a review shows them. The
 * same data the workspace serves under {@link WorkspaceUnitItemController}, reachable with a
 * review login instead of a workspace assignment.
 */
@Controller('reviews/:review_id/units/:unit_id/items')
export class ReviewUnitItemController {
  constructor(
    private unitItemsService: UnitItemService,
    private reviewService: ReviewService
  ) {}

  /**
   * All items of the unit. `withoutMetadata` leaves the metadata out, which is much the cheaper read.
   * A review that does not show metadata serves the items without it whatever is asked (#1784).
   */
  @Get()
  @UseGuards(JwtAuthGuard, ReviewGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'review_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiOkResponse()
  @ApiTags('review unit item')
  async findAll(
    @Param('review_id', ParseIntPipe) reviewId: number,
    @UnitId() unitId: number,
    @Query('withoutMetadata', new ParseBoolPipe({ optional: true })) withoutMetadata: boolean
  ): Promise<UnitItemDto[] | UnitItemWithMetadataDto[]> {
    if (withoutMetadata || (await this.reviewService.reviewConfigOf(reviewId)).showMetadata !== true) {
      return this.unitItemsService.getAllByUnitId(unitId);
    }
    return this.unitItemsService.getAllByUnitIdWithMetadata(unitId);
  }
}
