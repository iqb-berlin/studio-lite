import {
  Body,
  Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags
} from "@nestjs/swagger";
import {
  CreateUnitCommentDto,
  ReviewFullDto, UnitCommentDto, UnitDefinitionDto, UnitMetadataDto, UnitSchemeDto, UpdateUnitCommentDto
} from '@studio-lite-lib/api-dto';
import { ApiUnauthorizedResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewService } from '../database/services/review.service';
import { UnitService } from '../database/services/unit.service';
import { UnitCommentService } from '../database/services/unit-comment.service';

@Controller('review/:review_id')
export class ReviewController {
  constructor(
    private reviewService: ReviewService,
    private unitService: UnitService,
    private unitCommentService: UnitCommentService
  ) {}

  @Get()
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

  @Get(':id/metadata')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: UnitMetadataDto
  })
  @ApiParam({ name: 'id', type: Number })
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
  @ApiParam({ name: 'id', type: Number })
  @ApiTags('review')
  async getUnitDefinition(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitDefinitionDto> {
    return this.unitService.findOnesDefinition(unitId);
  }

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comments for unit retrieved successfully.' })
  @ApiTags('review unit')
  async findOnesComments(@Param('id', ParseIntPipe) unitId: number): Promise<UnitCommentDto[]> {
    return this.unitCommentService.findOnesComments(unitId);
  }

  @Get(':id/scheme')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: UnitSchemeDto
  })
  @ApiTags('review unit')
  async findOnesScheme(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitSchemeDto> {
    return this.unitService.findOnesScheme(unitId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new comment in database',
    type: Number
  })
  @ApiTags('review unit')
  async createComment(@Body() createUnitCommentDto: CreateUnitCommentDto) {
    return this.unitCommentService.createComment(createUnitCommentDto);
  }

  @Patch(':unit_id/comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comment body for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to update comment.' })
  @ApiTags('workspace unit')
  async patchCommentBody(@Param('id', ParseIntPipe) id: number, @Body() comment: UpdateUnitCommentDto) {
    return this.unitCommentService.patchCommentBody(id, comment);
  }

  @Delete(':unit_id/comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comment successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to delete comment.' })
  @ApiTags('workspace unit')
  async removeComment(@Param('id', ParseIntPipe) id: number) {
    return this.unitCommentService.removeComment(id);
  }
}
