import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotAcceptableException, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { VeronaModulesService } from './verona-modules.service';
import VeronaModule from '../entities/verona-module.entity';

describe('VeronaModulesService', () => {
  let service: VeronaModulesService;
  let repository: Repository<VeronaModule>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VeronaModulesService,
        {
          provide: getRepositoryToken(VeronaModule),
          useValue: mockRepository
        }
      ]
    }).compile();

    service = module.get<VeronaModulesService>(VeronaModulesService);
    repository = module.get<Repository<VeronaModule>>(getRepositoryToken(VeronaModule));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getVeronaModule', () => {
    it('should return module file info if download false', async () => {
      const key = 'module-1';
      const file = {
        key, metadata: { name: 'm', id: 'm', version: '1' }, file: Buffer.from('content') as unknown as Uint8Array
      } as VeronaModule;
      mockRepository.findOne.mockResolvedValue(file);

      const result = await service.getVeronaModule(key, {} as Response, false);
      expect(result).toHaveProperty('fileName');
    });

    it('should return streamable file if download true', async () => {
      const key = 'module-1';
      const file = {
        key, metadata: { name: 'm', id: 'm', version: '1' }, file: Buffer.from('content') as unknown as Uint8Array
      } as VeronaModule;
      mockRepository.findOne.mockResolvedValue(file);
      const res = { set: jest.fn() } as unknown as Response;

      const result = await service.getVeronaModule(key, res, true);
      expect(result).toBeInstanceOf(StreamableFile);
      expect(res.set).toHaveBeenCalled();
    });
  });

  describe('findFileById', () => {
    it('should throw if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findFileById('key')).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return modules', async () => {
      const modules = [{
        key: 'k', metadata: { type: 'editor', model: '', name: 'n' }, file_size: 1, file_datetime: new Date()
      }];
      mockRepository.find.mockResolvedValue(modules);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should filter by type', async () => {
      const modules = [
        { key: 'e', metadata: { type: 'editor', name: 'e' } },
        { key: 'p', metadata: { type: 'player', name: 'p' } }
      ];
      mockRepository.find.mockResolvedValue(modules);

      const result = await service.findAll('editor');
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('e');
    });

    it('should match the query type case-insensitively (upper-case query, legacy metadata)', async () => {
      const modules = [
        { key: 'e', metadata: { type: 'editor', name: 'e' } },
        { key: 'p', metadata: { type: 'player', name: 'p' } }
      ];
      mockRepository.find.mockResolvedValue(modules);

      const result = await service.findAll('EDITOR');
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('e');
    });

    it('should match the query type case-insensitively (legacy query, upper-case metadata)', async () => {
      const modules = [
        { key: 'e', metadata: { type: 'EDITOR', name: 'e' } },
        { key: 'p', metadata: { type: 'PLAYER', name: 'p' } }
      ];
      mockRepository.find.mockResolvedValue(modules);

      const result = await service.findAll('editor');
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('e');
    });
  });

  describe('upload', () => {
    const buildModuleBuffer = (type: string): Buffer => {
      const jsonLd = JSON.stringify({
        type,
        model: 'm',
        id: 'mod',
        version: '1.0.0',
        specVersion: '5.0',
        name: [{ lang: 'de', value: 'Name' }]
      });
      return Buffer.from(
        `<html><head><script type="application/ld+json">${jsonLd}</script></head></html>`
      );
    };

    it('accepts an upper-case metadata type against a legacy lower-case allowedTypes filter', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockImplementation(m => m);

      await expect(service.upload(buildModuleBuffer('EDITOR'), ['editor'])).resolves.toBeUndefined();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should replace the module of the same key instead of adding one', async () => {
      const existing = { key: 'mod@1.0' } as VeronaModule;
      mockRepository.findOne.mockResolvedValueOnce(existing);
      const file = buildModuleBuffer('EDITOR');

      await service.upload(file, ['EDITOR']);

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(existing);
      expect(existing).toEqual(expect.objectContaining({ file, fileSize: file.length }));
    });

    it('rejects a metadata type that is not in allowedTypes', async () => {
      await expect(service.upload(buildModuleBuffer('EDITOR'), ['player'])).rejects.toThrow();
      expect(repository.save).not.toHaveBeenCalled();
    });

    // A file without readable metadata ended in a SyntaxError and a 500 (#1985).
    it.each([
      ['no metadata script', '<html><head><title>No module</title></head></html>'],
      ['metadata that are no JSON', '<html><head><script type="application/ld+json">{"id": </script></head></html>'],
      ['metadata that are null', '<html><head><script type="application/ld+json">null</script></head></html>']
    ])('rejects a file with %s as invalid metadata', async (_, html) => {
      await expect(service.upload(Buffer.from(html))).rejects.toThrow(NotAcceptableException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
