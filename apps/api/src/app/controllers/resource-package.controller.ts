import {
  Controller, Get, UseGuards
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import 'multer';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { ResourcePackageService } from '../services/resource-package.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * `resource-packages` -- the list of installed resource packages, readable by every logged-in
 * user because any workspace's units may draw on them. Installing and removing one is
 * administration and lives in {@link AdminResourcePackageController}.
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
}
