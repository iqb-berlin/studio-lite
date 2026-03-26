import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse, ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  CreateUnitRichNoteDto,
  UnitRichNotesDto,
  UpdateUnitRichNoteDto, UpdateUnitRichNoteUnitItemsDto
} from '@studio-lite-lib/api-dto';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { ReadOrGroupAdminAccessGuard } from '../guards/read-or-group-admin-access.guard';
import { WriteOrGroupAdminAccessGuard } from '../guards/write-or-group-admin-access.guard';
import { UnitId } from '../decorators/unit-id.decorator';
import { ItemRichNoteService } from '../services/item-rich-note.service';

@Controller('workspaces/:workspace_id/units/:unit_id/rich-notes')
export class WorkspaceUnitRichNoteController {
  constructor(
    private unitRichNoteService: UnitRichNoteService,
    private itemRichNoteService: ItemRichNoteService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, ReadOrGroupAdminAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Rich notes for unit retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit rich note')
  async findNotes(@Param('unit_id', ParseIntPipe) unitId: number): Promise<UnitRichNotesDto> {
    return this.unitRichNoteService.findNotes(unitId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteOrGroupAdminAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new rich note in database',
    type: Number
  })
  @ApiUnauthorizedResponse({ description: 'No write privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit rich note')
  async createNote(@Body() createUnitRichNoteDto: CreateUnitRichNoteDto) {
    return this.unitRichNoteService.createNote(createUnitRichNoteDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteOrGroupAdminAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Rich note successfully updated.' })
  @ApiNotFoundResponse({ description: 'Rich note not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to update rich note.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit rich note')
  async patchNote(@Param('id', ParseIntPipe) id: number, @Body() note: UpdateUnitRichNoteDto) {
    return this.unitRichNoteService.patchNote(id, note);
  }

  @Patch(':note_id/items')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteOrGroupAdminAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiParam({ name: 'note_id', type: Number })
  @ApiOkResponse({ description: 'Rich note item connections for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Rich note item connections not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to update rich note item connections.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  async patchNoteItems(@Param('note_id', ParseIntPipe) noteId: number,
    @UnitId() unitId: number,
    @Body() connections: UpdateUnitRichNoteUnitItemsDto) {
    return this.itemRichNoteService.updateNoteItems(unitId, noteId, connections.itemReferences);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteOrGroupAdminAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Rich note successfully deleted.' })
  @ApiNotFoundResponse({ description: 'Rich note not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to delete rich note.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit rich note')
  async removeNote(@Param('id', ParseIntPipe) id: number) {
    return this.unitRichNoteService.removeNote(id);
  }
}
