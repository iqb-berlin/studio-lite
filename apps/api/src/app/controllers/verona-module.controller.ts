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
    description: 'specify the type of module if needed: schemer, editor, player',
    required: false
  })
  @ApiOkResponse({ description: 'Verona modules retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiTags('verona-module')
  async findAllByType(@Query('type') type: string): Promise<VeronaModuleInListDto[]> {
    return this.veronaModulesService.findAll(type);
  }

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
