import { VeronaModuleFileDto, VeronaModuleInListDto, VeronaModuleMetadataDto } from '@studio-lite-lib/api-dto';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { Response } from 'express';
import { StreamableFile } from '@nestjs/common';
import { VeronaModuleController } from './verona-module.controller';
import { VeronaModulesService } from '../services/verona-modules.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

describe('VeronaModuleController', () => {
  let controller: VeronaModuleController;
  let veronaModulesService: VeronaModulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeronaModuleController],
      providers: [
        {
          provide: VeronaModulesService,
          useValue: createMock<VeronaModulesService>()
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<VeronaModuleController>(VeronaModuleController);
    veronaModulesService = module.get<VeronaModulesService>(VeronaModulesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllByType', () => {
    it('should return all modules when no type is specified', async () => {
      const mockModules: VeronaModuleInListDto[] = [
        {
          key: 'module-1',
          name: 'Module 1',
          version: '1.0.0',
          type: 'editor',
          sortKey: '1',
          metadata: {} as VeronaModuleMetadataDto
        } as VeronaModuleInListDto,
        {
          key: 'module-2',
          name: 'Module 2',
          version: '2.0.0',
          type: 'player',
          sortKey: '2',
          metadata: {} as VeronaModuleMetadataDto
        } as VeronaModuleInListDto
      ];

      jest.spyOn(veronaModulesService, 'findAll')
        .mockResolvedValue(mockModules);

      const result = await controller.findAllByType('');

      expect(result).toEqual(mockModules);
      expect(veronaModulesService.findAll).toHaveBeenCalledWith('');
      expect(veronaModulesService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return filtered modules when type is specified', async () => {
      const mockModules: VeronaModuleInListDto[] = [
        {
          key: 'editor-1',
          name: 'Editor 1',
          version: '1.0.0',
          type: 'editor',
          sortKey: '1',
          metadata: {} as VeronaModuleMetadataDto
        } as VeronaModuleInListDto
      ];

      jest.spyOn(veronaModulesService, 'findAll')
        .mockResolvedValue(mockModules);

      const result = await controller.findAllByType('editor');

      expect(result).toEqual(mockModules);
      expect(veronaModulesService.findAll).toHaveBeenCalledWith('editor');
    });

    it('should return empty array when no modules exist', async () => {
      jest.spyOn(veronaModulesService, 'findAll')
        .mockResolvedValue([]);

      const result = await controller.findAllByType('editor');

      expect(result).toEqual([]);
      expect(veronaModulesService.findAll).toHaveBeenCalledWith('editor');
    });
  });

  describe('findFileById', () => {
    let mockResponse: Response;

    beforeEach(() => {
      mockResponse = {
        set: jest.fn(),
        send: jest.fn()
      } as unknown as Response;
    });

    it('should return module file when download is true', async () => {
      const key = 'module-key-1';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockStreamableFile = new StreamableFile(Buffer.from('file content') as any);

      jest.spyOn(veronaModulesService, 'getVeronaModule')
        .mockResolvedValue(mockStreamableFile);

      const result = await controller.findFileById(key, mockResponse, true);

      expect(result).toBe(mockStreamableFile);
      expect(veronaModulesService.getVeronaModule).toHaveBeenCalledWith(key, mockResponse, true);
      expect(veronaModulesService.getVeronaModule).toHaveBeenCalledTimes(1);
    });

    it('should return module file when download is false', async () => {
      const key = 'module-key-2';
      const mockFileDto: VeronaModuleFileDto = {
        key,
        name: 'Module Name',
        version: '1.0.0',
        content: 'module content',
        file: 'base64content'
      } as VeronaModuleFileDto;

      jest.spyOn(veronaModulesService, 'getVeronaModule')
        .mockResolvedValue(mockFileDto);

      const result = await controller.findFileById(key, mockResponse, false);

      expect(result).toBe(mockFileDto);
      expect(veronaModulesService.getVeronaModule).toHaveBeenCalledWith(key, mockResponse, false);
    });
  });
});
