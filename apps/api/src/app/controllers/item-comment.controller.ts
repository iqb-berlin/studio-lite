// import {
//   Body, Controller, Get, ParseIntPipe, Post, UseGuards
// } from '@nestjs/common';
// import {
//   ApiBearerAuth,
//   ApiInternalServerErrorResponse,
//   ApiNotFoundResponse,
//   ApiOkResponse,
//   ApiParam,
//   ApiTags, ApiUnauthorizedResponse
// } from '@nestjs/swagger';
// import {
//   UnitCommentUnitItemDto
// } from '@studio-lite-lib/api-dto';
// import { JwtAuthGuard } from '../guards/jwt-auth.guard';
// import { WorkspaceGuard } from '../guards/workspace.guard';
// import { CommentAccessGuard } from '../guards/comment-access.guard';
// import { ItemCommentService } from '../services/item-comment.service';
// import { UnitId } from '../decorators/unit-id.decorator';
// import { ItemUuid } from '../decorators/item-uuid.decorator';
//
// @Controller('workspaces/:workspace_id/units/:unit_id/items/:item_uuid/comments')
//
// export class ItemCommentController {
//   constructor(private itemCommentService: ItemCommentService
//   ) {}
//
//   // @Get()
//   // @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard)
//   // @ApiBearerAuth()
//   // @ApiParam({ name: 'workspace_id', type: Number })
//   // @ApiParam({ name: 'unit_id', type: Number })
//   // @ApiParam({ name: 'item_uuid', type: String })
//   // @ApiOkResponse({ description: 'Comments for item retrieved successfully.' })
//   // @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
//   // @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
//   // @ApiTags('item comment')
//   // async findItemComments(@ItemUuid() itemUuid: string): Promise<UnitCommentUnitItemDto[]> {
//   //   return this.itemCommentService.findItemComments(itemUuid);
//   // }
//
//   // @Post()
//   // @ApiParam({ name: 'workspace_id', type: Number })
//   // @ApiParam({ name: 'unit_id', type: Number })
//   // @ApiParam({ name: 'item_uuid', type: String })
//   // @ApiOkResponse({ description: 'Comment body for successfully updated.' })
//   // @ApiNotFoundResponse({ description: 'Comment not found.' })
//   // @ApiUnauthorizedResponse({ description: 'Not authorized to update comment.' })
//   // @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
//   // @ApiTags('item comment')
//   // async createCommentItemConnection(@UnitId(ParseIntPipe) unitId: number,
//   //   @ItemUuid() itemUuid: string,
//   //   @Body() comment: UnitCommentUnitItemDto) {
//   //   return this.itemCommentService.createCommentItemConnection(unitId, itemUuid, comment.unitCommentId);
//   // }
// }
