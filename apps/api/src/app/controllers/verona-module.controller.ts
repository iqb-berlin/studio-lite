import {
  Controller,
  Delete,
  Get,
  NotAcceptableException,
  Param,
  ParseArrayPipe,
  Post,
  Query, Res, StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  VeronaModuleFileDto, VeronaModuleInListDto, VeronaModuleType
} from '@studio-lite-lib/api-dto';
import { VERONA_MODULE_TYPES, isKnownVeronaModuleType } from '@studio-lite/shared-code';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { VeronaModulesService } from '../services/verona-modules.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';

/**
 * `verona-modules` -- the installed modules. Every logged-in user may read them: the list a chooser
 * offers, and the module file itself, which the frontend loads to open a unit. Installing and
 * deleting is for administrators.
 *
 * On installation a module's type is read from the module itself; the types named on the request are
 * the set it has to fall into. They are checked here so a typo is refused with 406 before the upload
 * is opened at all, and the module's own declared type is matched against them in
 * {@link VeronaModulesService.upload}.
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

  /**
   * Installs an uploaded module. The types named on the request are trimmed, checked against the
   * four known ones in either spelling, and de-duplicated -- they are the allow-list the module's
   * own declared type is then held against, not what is stored with it.
   */
  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Verona module created successfully.',
    type: [VeronaModuleInListDto]
  })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiNotAcceptableResponse({ description: 'Verona module not accepted.' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiTags('verona-module')
  @ApiQuery({
    name: 'type',
    type: String,
    // Both the current upper-case spelling and the legacy lower-case spelling are accepted.
    description: 'required, array of module types: EDITOR, PLAYER, SCHEMER, WIDGET',
    required: true,
    isArray: true,
    enum: VERONA_MODULE_TYPES
  })
  async addModuleFile(
    @UploadedFile() file,
    @Query('type', new ParseArrayPipe({ items: String, separator: ',' })) types: string[]
  ) {
    const normalizedTypes = types.map(type => type.trim()).filter(Boolean);

    if (!normalizedTypes.length) {
      throw new NotAcceptableException('Module type is required.');
    }

    const invalidTypes = normalizedTypes.filter(type => !isKnownVeronaModuleType(type));
    if (invalidTypes.length) {
      throw new NotAcceptableException(`Unknown module type(s): ${invalidTypes.join(', ')}`);
    }

    const uniqueTypes = Array.from(new Set(normalizedTypes)) as VeronaModuleType[];
    return this.veronaModulesService.upload(file.buffer, uniqueTypes);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Verona modules deleted successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('verona-module')
  @ApiQuery({
    name: 'key',
    type: String,
    isArray: true,
    required: true
  })
  async remove(
    @Query('key', new ParseArrayPipe({ items: String, separator: ',' })) keys: string[]
  ): Promise<void> {
    return this.veronaModulesService.remove(keys);
  }
}
