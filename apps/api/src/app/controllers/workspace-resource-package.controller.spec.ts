import { createMock } from '@golevelup/ts-jest';
import { Response } from 'express';
import { WorkspaceResourcePackageController } from './workspace-resource-package.controller';
import { ResourcePackageService } from '../services/resource-package.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReadOrGroupAdminAccessGuard } from '../guards/read-or-group-admin-access.guard';

describe('WorkspaceResourcePackageController', () => {
  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it('should let whoever reads the workspace, a group admin as well, reach findPackageNames (#1358)', () => {
    expect(Reflect.getMetadata('__guards__', WorkspaceResourcePackageController.prototype.findPackageNames))
      .toEqual([JwtAuthGuard, ReadOrGroupAdminAccessGuard]);
  });

  // a module loads the files in its iframe, without a token, as it loads them from api/packages
  it('should serve the files of a package without a login', () => {
    expect(Reflect.getMetadata('__guards__', WorkspaceResourcePackageController.prototype.findPackageFile))
      .toBeUndefined();
  });

  describe('findPackageFile', () => {
    const service = createMock<ResourcePackageService>();
    const controller = new WorkspaceResourcePackageController(service);

    it('should send the file from inside the package that serves the name', async () => {
      service.findPackageFile.mockResolvedValue({ root: '/packages/GeoGebra-5.3', file: 'GeoGebra/deployggb.js' });
      const res = createMock<Response>();

      await controller.findPackageFile(7, ['GeoGebra', 'GeoGebra', 'deployggb.js'], res);

      expect(service.findPackageFile).toHaveBeenCalledWith(7, ['GeoGebra', 'GeoGebra', 'deployggb.js']);
      expect(res.sendFile).toHaveBeenCalledWith(
        'GeoGebra/deployggb.js', { root: '/packages/GeoGebra-5.3' }, expect.any(Function)
      );
    });

    it('should answer 404 when nothing serves the name', async () => {
      service.findPackageFile.mockResolvedValue(null);
      const res = createMock<Response>();

      await controller.findPackageFile(7, 'avatar/avatar.json', res);

      expect(service.findPackageFile).toHaveBeenCalledWith(7, ['avatar', 'avatar.json']);
      expect(res.sendStatus).toHaveBeenCalledWith(404);
      expect(res.sendFile).not.toHaveBeenCalled();
    });
  });
});
