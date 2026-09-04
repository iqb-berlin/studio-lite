import {
  Controller,
  Get,
  Param,
  Query, Res, StreamableFile,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { VeronaModuleFileDto, VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
import type { Response } from 'express';
import { VeronaModulesService } from '../services/verona-modules.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * `verona-modules` -- reading the installed modules: the list a chooser offers, and the module file
 * itself, which the frontend loads to open a unit. Every logged-in user may read them; installing
 * and deleting is administration ({@link AdminVeronaModuleController}).
 */
@Controller('verona-modules')
export class VeronaModuleController {
  constructor(
    private veronaModulesService: VeronaModulesService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'type',
    type: String,
    description: 'specify the type of module if needed: EDITOR, PLAYER, SCHEMER, WIDGET (case-insensitive)',
    required: false
  })
  @ApiOkResponse({ description: 'Verona modules retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiTags('verona-module')
  async findAllByType(@Query('type') type: string): Promise<VeronaModuleInListDto[]> {
    return this.veronaModulesService.findAll(type);
  }

  /**
   * The module behind this key. `download` decides the form: a file stream to save, or the module
   * wrapped in a DTO for the frontend to run.
   */
  @Get(':key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Verona module retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiNotFoundResponse({ description: 'Verona module not found.' })
  @ApiTags('verona-module')
  @ApiQuery({
    name: 'download',
    type: Boolean,
    required: false
  })
  async findFileById(
    @Param('key') key: string,
      @Res({ passthrough: true }) res: Response,
      @Query('download') download: boolean
  ): Promise<StreamableFile | VeronaModuleFileDto> {
    return this.veronaModulesService.getVeronaModule(key, res, download);
  }
}
