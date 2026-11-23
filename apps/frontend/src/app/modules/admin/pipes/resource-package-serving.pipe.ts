import { Pipe, PipeTransform } from '@angular/core';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { ResourcePackageChoice, resolveResourcePackage } from '@studio-lite/shared-code';

/**
 * Whether a package is the one a workspace group without a choice of its own gets for its package
 * name (#1358): the default, or -- with none set -- the package installed under exactly that name.
 */
@Pipe({
  name: 'resourcePackageServing'
})
export class ResourcePackageServingPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(
    resourcePackage: ResourcePackageDto,
    packages: ResourcePackageDto[],
    defaults: ResourcePackageChoice
  ): boolean {
    return resolveResourcePackage(resourcePackage.packageName, packages, undefined, defaults)?.name ===
      resourcePackage.name;
  }
}
