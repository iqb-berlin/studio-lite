import {
  Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags
} from '@nestjs/swagger';
import { VeronaModuleFileDto, VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { VeronaModulesService } from '../../database/services/verona-modules.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { IsAdminGuard } from '../is-admin.guard';

@Controller('admin') // TODO: müsste das hier nicht 'admin/verona-modules' heißen?
export class VeronaModulesController {
  constructor(
    private veronaModuleService: VeronaModulesService
  ) {}

  @Get('verona-modules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Verona modules retrieved successfully.' }) // TODO Exception
  @ApiTags('admin verona-modules')
  async findAll(): Promise<VeronaModuleInListDto[]> {
    return this.veronaModuleService.findAll();
  }

  // TODO: Kein eigener Endpunkt sondern Nutzung von optionalen QueryParams
  @Get('verona-modules/:type')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Verona modules retrieved successfully.' })
  @ApiTags('admin verona-modules')
  async findAllByType(@Param('type') type: string): Promise<VeronaModuleInListDto[]> {
    return this.veronaModuleService.findAll(type);
  }

  @Get('verona-module/:key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Verona module retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Verona module not found.' })
  @ApiTags('admin verona-modules')
  async findFileById(@Param('key') key: string): Promise<VeronaModuleFileDto> {
    return this.veronaModuleService.findFileById(key);
  }

  @Post('verona-modules')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Verona module created successfully.',
    type: [VeronaModuleInListDto] // TODO: In anderen Fällen gibt die Api immer nur die ID bei Create zurück
  })
  @ApiNotAcceptableResponse({ description: 'Verona module not accepted.' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiTags('admin verona-modules')
  async addModuleFile(@UploadedFile() file) {
    return this.veronaModuleService.upload(file.buffer);
  }

  // TODO: keys als query params umsetzen und eigenen endpunkt vermeiden
  @Delete('verona-modules/:keys')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Verona modules deleted successfully.' }) // TODO: Exception hinzufügen
  @ApiTags('admin verona-modules')
  async remove(@Param('keys') keys: string): Promise<void> {
    const keysAsStringArray: string[] = [];
    keys.split(';').forEach(s => keysAsStringArray.push(s));
    return this.veronaModuleService.remove(keysAsStringArray);
  }
}
