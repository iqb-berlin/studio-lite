import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiQuery, ApiTags
} from '@nestjs/swagger';
import { ResourcePackageChoice, ResourcePackageGroup } from '@studio-lite/shared-code';
import { Express } from 'express';
import 'multer';
import { ResourcePackageDto, UpdateResourcePackageDto } from '@studio-lite-lib/api-dto';
import { ResourcePackageService } from '../services/resource-package.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { ApiFile } from '../decorators/api-file.decorator';
import { fileMimetypeFilter } from '../filters/file-mimetype.filter';
import { ParseFilePipe } from '../pipes/parse-file.pipe';
import { ZIP_MIME_TYPES } from '../constants/zip-mime-types';

/**
 * `resource-packages` -- the installed resource packages. The list and the defaults are readable by
 * every logged-in user because any workspace's units may draw on them, and a group admin chooses
 * from them. Installing, replacing, renaming and removing one and setting the defaults are
 * installation-wide acts and therefore an administrator's; an upload is a zip and is refused with
 * 415 if it is not.
 *
 * `defaults` and `groups` stand before `:id`, so that they are not read as an id.
 */
@Controller('resource-packages')
export class ResourcePackageController {
  constructor(
    private resourcePackageService: ResourcePackageService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Resource Packages retrieved successfully.' })
  @ApiTags('resource-package')
  async findResourcePackages(): Promise<ResourcePackageDto[]> {
    return this.resourcePackageService.findResourcePackages();
  }

  @Get('defaults')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'The default package per package name (#1358).' })
  @ApiTags('resource-package')
  async findDefaults(): Promise<ResourcePackageChoice> {
    return this.resourcePackageService.findDefaults();
  }

  @Patch('defaults')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Defaults set (#1358).' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('resource-package')
  async setDefaults(@Body() defaults: ResourcePackageChoice): Promise<void> {
    return this.resourcePackageService.setDefaults(defaults);
  }

  @Get('groups')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Every workspace group with the packages it chose (#1358).' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('resource-package')
  async findGroups(): Promise<ResourcePackageGroup[]> {
    return this.resourcePackageService.findGroups();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Package name changed (#1358).' })
  @ApiConflictResponse({ description: 'The package is in use.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('resource-package')
  async patchPackageName(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateResourcePackageDto
  ): Promise<void> {
    return this.resourcePackageService.patchPackageName(id, body?.packageName);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('resource-package')
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  @ApiOkResponse({ description: 'Resource-packages deleted successfully.' })
  @ApiConflictResponse({ description: 'A package is in use.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  async removeIds(
    @Query('id', new ParseArrayPipe({ items: Number, separator: ',' })) id: number[]
  ) : Promise<void> {
    return this.resourcePackageService.removeResourcePackages(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiFile('resourcePackage', true, {
    fileFilter: fileMimetypeFilter(...ZIP_MIME_TYPES)
  })
  @ApiQuery({
    name: 'packageName',
    required: false,
    description: 'The package name it stands in for; without it, the one its file name suggests (#1358)'
  })
  @ApiQuery({
    name: 'overwrite',
    required: false,
    description: "'true' replaces a package installed under the same name"
  })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new resource package in database',
    type: Number
  })
  @ApiConflictResponse({ description: 'A package of that name is installed, and overwrite is not set.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('resource-package')
  async create(
    @UploadedFile(ParseFilePipe) zippedResourcePackage: Express.Multer.File,
    @Query('packageName') packageName?: string,
    @Query('overwrite') overwrite?: string
  ): Promise<number> {
    return this.resourcePackageService.create(zippedResourcePackage, {
      packageName,
      overwrite: overwrite === 'true'
    });
  }
}
