import {
  Controller,
  Delete,
  Get, Header,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags
} from '@nestjs/swagger';
import { Express } from 'express';
import 'multer';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { ResourcePackageService } from '../services/resource-package.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { ApiFile } from '../decorators/api-file.decorator';
import { fileMimetypeFilter } from '../utils/file-mimetype-filter';
import { ParseFile } from '../pipes/parse-file-pipe';

@Controller('admin/resource-packages')
export class ResourcePackageController {
  constructor(
    private resourcePackageService: ResourcePackageService
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Resource Packages retrieved successfully.' }) // TODO Exception
  @ApiTags('admin resource-packages')
  async findResourcePackages(): Promise<ResourcePackageDto[]> {
    return this.resourcePackageService.findResourcePackages();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Resource Package deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiTags('admin resource-packages')
  async removeResourcePackage(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.resourcePackageService.removeResourcePackage(id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin resource-packages')
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  @ApiOkResponse({ description: 'Admin resource-packages deleted successfully.' })
  async removeIds(
    @Query('id', new ParseArrayPipe({ items: Number, separator: ',' })) id: number[]
  ) : Promise<void> {
    return this.resourcePackageService.removeResourcePackages(id);
  }

  @Get(':name')
  @Header('Content-Disposition', 'filename="resource-package.zip"')
  @Header('Cache-Control', 'none')
  @Header('Content-Type', 'application/zip')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin resource-packages')
  async getZippedResourcePackage(@Param('name') name: string): Promise<StreamableFile> {
    const file = this.resourcePackageService.getZippedResourcePackage(name);
    return new StreamableFile(file);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiFile('resourcePackage', true, {
    fileFilter: fileMimetypeFilter('application/zip')
  })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new resource package in database',
    type: Number
  })
  @ApiTags('admin resource-packages')
  async create(@UploadedFile(ParseFile) zippedResourcePackage: Express.Multer.File): Promise<number> {
    return this.resourcePackageService.create(zippedResourcePackage);
  }
}
