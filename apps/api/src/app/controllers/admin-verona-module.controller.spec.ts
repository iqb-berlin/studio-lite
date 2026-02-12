import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotAcceptableException } from '@nestjs/common';
import { AdminVeronaModuleController } from './admin-verona-module.controller';
import { VeronaModulesService } from '../services/verona-modules.service';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { AuthService } from '../services/auth.service';

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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addModuleFile', () => {
    it('should upload a module file for multiple types', async () => {
      const mockFile = { buffer: Buffer.from('test') };
      veronaModulesService.upload.mockResolvedValue(undefined);

      await controller.addModuleFile(mockFile, ['editor', 'player', 'schemer']);

      expect(veronaModulesService.upload)
        .toHaveBeenCalledWith(mockFile.buffer, ['editor', 'player', 'schemer']);
    });

    it('should upload a widget file when type is widget', async () => {
      const mockFile = { buffer: Buffer.from('test') };
      veronaModulesService.upload.mockResolvedValue(undefined);

      await controller.addModuleFile(mockFile, ['widget']);

      expect(veronaModulesService.upload)
        .toHaveBeenCalledWith(mockFile.buffer, ['widget']);
    });

    it('should reject unknown types', async () => {
      const mockFile = { buffer: Buffer.from('test') };

      await expect(controller.addModuleFile(mockFile, ['unknown']))
        .rejects.toThrow(NotAcceptableException);
    });
  });

  describe('remove', () => {
    it('should remove modules by keys', async () => {
      const keys = ['mod1', 'mod2'];
      veronaModulesService.remove.mockResolvedValue(undefined);

      await controller.remove(keys);

      expect(veronaModulesService.remove).toHaveBeenCalledWith(keys);
    });
  });
});
