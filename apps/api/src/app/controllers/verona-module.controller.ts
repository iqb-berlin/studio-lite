import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags
} from '@nestjs/swagger';
import { VeronaModuleFileDto, VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
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
  @ApiTags('verona-module')
  async findAllByType(@Query('type') type: string): Promise<VeronaModuleInListDto[]> {
    return this.veronaModulesService.findAll(type);
  }

  @Get(':key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Verona module retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Verona module not found.' })
  @ApiTags('verona-module')
  async findFileById(@Param('key') key: string): Promise<VeronaModuleFileDto> {
    return this.veronaModulesService.findFileById(key);
  }
}
