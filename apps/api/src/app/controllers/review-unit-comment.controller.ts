import {
  Body,
  Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards
} from '@nestjs/common';
import {
  ApiUnauthorizedResponse, ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags
} from '@nestjs/swagger';
import {
  CreateUnitCommentDto, UnitCommentDto, UpdateUnitCommentDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UnitCommentService } from '../services/unit-comment.service';

@Controller('reviews/:review_id/units')
export class ReviewUnitCommentController {
  constructor(
    private unitCommentService: UnitCommentService
  ) {}

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comments for unit retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges to retrieve comments for the unit.' })
  @ApiTags('review unit comment')
  async findOnesComments(@Param('id', ParseIntPipe) unitId: number): Promise<UnitCommentDto[]> {
    return this.unitCommentService.findOnesComments(unitId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new comment in database',
    type: Number
  })
  @ApiUnauthorizedResponse({ description: 'No privileges to post comment for the unit.' })
  @ApiTags('review unit comment')
  async createComment(@Body() createUnitCommentDto: CreateUnitCommentDto) {
    return this.unitCommentService.createComment(createUnitCommentDto);
  }

  @Patch(':unit_id/comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comment body for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to update comment.' })
  @ApiTags('review unit comment')
  async patchCommentBody(@Param('id', ParseIntPipe) id: number, @Body() comment: UpdateUnitCommentDto) {
    return this.unitCommentService.patchCommentBody(id, comment);
  }

  @Delete(':unit_id/comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comment successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to delete comment.' })
  @ApiTags('review unit comment')
  async removeComment(@Param('id', ParseIntPipe) id: number) {
    return this.unitCommentService.removeComment(id);
  }
}
