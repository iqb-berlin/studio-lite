import {
  Controller, Delete,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {VeronaModuleFileDto, VeronaModuleInListDto, WorkspaceInListDto} from "@studio-lite-lib/api-dto";
import {VeronaModulesService} from "../../database/services/verona-modules.service";
import {FileInterceptor} from "@nestjs/platform-express";
import {IsAdminGuard} from "../is-admin.guard";

@Controller('admin')
export class VeronaModulesController {
  constructor(
    private veronaModuleService: VeronaModulesService
  ) {}

  @Get('verona-modules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [VeronaModuleInListDto],
  })
  @ApiTags('admin verona-modules')
  async findAll(): Promise<VeronaModuleInListDto[]> {
    return this.veronaModuleService.findAll();
  }

  @Get('verona-modules/:type')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [VeronaModuleInListDto],
  })
  @ApiTags('admin verona-modules')
  async findAllByType(@Param('type') type: string): Promise<VeronaModuleInListDto[]> {
    return this.veronaModuleService.findAll(type);
  }

  @Get('verona-module/:key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: VeronaModuleFileDto,
  })
  @ApiTags('admin verona-modules')
  async findFileById(@Param('key') key: string): Promise<VeronaModuleFileDto> {
    return this.veronaModuleService.findFileById(key);
  }

  @Post('verona-modules')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiTags('admin verona-modules')
  async addModuleFile(@UploadedFile() file) {
    return this.veronaModuleService.upload(file.buffer);
  }

  @Delete('verona-modules/:keys')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin verona-modules')
  async remove(@Param('keys') keys: string): Promise<void> {
    const keysAsStringArray: string[] = [];
    keys.split(';').forEach(s => keysAsStringArray.push(s));
    return this.veronaModuleService.remove(keysAsStringArray);
  }
}
