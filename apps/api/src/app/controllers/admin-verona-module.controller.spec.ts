import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotAcceptableException } from '@nestjs/common';
import { AdminVeronaModuleController } from './admin-verona-module.controller';
import { VeronaModulesService } from '../services/verona-modules.service';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('AdminVeronaModuleController', () => {
  let controller: AdminVeronaModuleController;
  let veronaModulesService: DeepMocked<VeronaModulesService>;

  beforeEach(async () => {
    veronaModulesService = createMock<VeronaModulesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminVeronaModuleController],
      providers: [
        { provide: VeronaModulesService, useValue: veronaModulesService },
        { provide: IsAdminGuard, useValue: { canActivate: jest.fn(() => true) } },
        { provide: AuthService, useValue: createMock<AuthService>() }
      ]
    }).compile();

    controller = module.get<AdminVeronaModuleController>(
      AdminVeronaModuleController
    );
  });

  // The guards are the authorisation of each method; no other unit test sees them (#1953).
  it.each(['addModuleFile', 'remove'] as const)(
    'should let only administrators reach %s',
    method => {
      expect(Reflect.getMetadata('__guards__', AdminVeronaModuleController.prototype[method]))
        .toEqual([JwtAuthGuard, IsAdminGuard]);
    }
  );

  describe('addModuleFile', () => {
    it('should upload a widget file when type is widget', async () => {
      const mockFile = { buffer: Buffer.from('test') };
      veronaModulesService.upload.mockResolvedValue(undefined);

      await controller.addModuleFile(mockFile, ['WIDGET']);

      expect(veronaModulesService.upload)
        .toHaveBeenCalledWith(mockFile.buffer, ['WIDGET']);
    });

    it('should accept the current upper-case module types', async () => {
      const mockFile = { buffer: Buffer.from('test') };
      veronaModulesService.upload.mockResolvedValue(undefined);

      await controller.addModuleFile(mockFile, ['EDITOR', 'PLAYER', 'SCHEMER']);

      expect(veronaModulesService.upload)
        .toHaveBeenCalledWith(mockFile.buffer, ['EDITOR', 'PLAYER', 'SCHEMER']);
    });

    it('should still accept the legacy lower-case module types', async () => {
      const mockFile = { buffer: Buffer.from('test') };
      veronaModulesService.upload.mockResolvedValue(undefined);

      await controller.addModuleFile(mockFile, ['editor', 'player', 'schemer']);

      expect(veronaModulesService.upload)
        .toHaveBeenCalledWith(mockFile.buffer, ['editor', 'player', 'schemer']);
    });

    it.each([[[]], [[' ', '']]])('should refuse a request without a module type: %p', async types => {
      await expect(controller.addModuleFile({ buffer: Buffer.from('test') }, types))
        .rejects.toThrow(NotAcceptableException);
      expect(veronaModulesService.upload).not.toHaveBeenCalled();
    });

    // `?type=PLAYER,` arrives with an empty entry, which is no type of its own.
    it('should hand on each type once, without blanks around it and without empty ones', async () => {
      const mockFile = { buffer: Buffer.from('test') };

      await controller.addModuleFile(mockFile, [' PLAYER', 'PLAYER ', '', 'WIDGET']);

      expect(veronaModulesService.upload).toHaveBeenCalledWith(mockFile.buffer, ['PLAYER', 'WIDGET']);
    });

    it('should reject unknown types', async () => {
      const mockFile = { buffer: Buffer.from('test') };

      await expect(controller.addModuleFile(mockFile, ['unknown']))
        .rejects.toThrow(NotAcceptableException);
    });
  });
});
