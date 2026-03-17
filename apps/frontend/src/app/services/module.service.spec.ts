import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { VeronaModuleInListDto, VeronaModuleFileDto } from '@studio-lite-lib/api-dto';
import { ModuleService } from './module.service';
import { ModuleBackendService } from './module-backend.service';
import { VeronaModuleClass } from '../models/verona-module.class';

describe('ModuleService', () => {
  let service: ModuleService;
  let mockBackendService: jest.Mocked<ModuleBackendService>;

  beforeEach(() => {
    mockBackendService = {
      getModuleList: jest.fn(),
      getModuleHtml: jest.fn()
    } as unknown as jest.Mocked<ModuleBackendService>;

    TestBed.configureTestingModule({
      providers: [
        ModuleService,
        { provide: ModuleBackendService, useValue: mockBackendService }
      ]
    });
    service = TestBed.inject(ModuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadList', () => {
    it('should populate editors, players, and schemers dictionaries', async () => {
      const mockModulesByType: Record<string, VeronaModuleInListDto[]> = {
        editor: [{
          key: 'e1',
          sortKey: 'e1',
          metadata: {
            id: 'e1',
            name: 'E1',
            type: 'editor',
            model: '',
            version: '1.0',
            specVersion: '1.0',
            isStable: true
          }
        }],
        player: [{
          key: 'p1',
          sortKey: 'p1',
          metadata: {
            id: 'p1',
            name: 'P1',
            type: 'player',
            model: 'speedTest',
            version: '1.0',
            specVersion: '1.0',
            isStable: true
          }
        }],
        schemer: [{
          key: 's1',
          sortKey: 's1',
          metadata: {
            id: 's1',
            name: 'S1',
            type: 'schemer',
            model: 'iqb',
            version: '1.0',
            specVersion: '1.0',
            isStable: true
          }
        }]
      };

      mockBackendService.getModuleList.mockImplementation((type?: string) => of(mockModulesByType[type || ''] || []));

      await service.loadList();

      expect(mockBackendService.getModuleList).toHaveBeenCalledWith('editor');
      expect(mockBackendService.getModuleList).toHaveBeenCalledWith('player');
      expect(mockBackendService.getModuleList).toHaveBeenCalledWith('schemer');

      expect(Object.keys(service.editors)).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      expect(service.editors['e1'].metadata.name).toBe('E1');

      expect(Object.keys(service.players)).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      expect(service.players['p1'].metadata.name).toBe('P1');

      expect(Object.keys(service.schemers)).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      expect(service.schemers['s1'].metadata.name).toBe('S1');
    });

    it('should handle empty response', async () => {
      mockBackendService.getModuleList.mockImplementation(() => of([]));
      await service.loadList();
      expect(Object.keys(service.editors)).toHaveLength(0);
      expect(Object.keys(service.players)).toHaveLength(0);
      expect(Object.keys(service.schemers)).toHaveLength(0);
    });
  });

  describe('loadWidgets', () => {
    it('should populate widgets dictionary', async () => {
      const mockWidgets: VeronaModuleInListDto[] = [{
        key: 'w1',
        sortKey: 'w1',
        metadata: {
          id: 'w1',
          name: 'W1',
          type: 'WIDGET',
          model: 'CALC',
          version: '1.0',
          specVersion: '1.0',
          isStable: true
        }
      }];

      mockBackendService.getModuleList.mockReturnValue(of(mockWidgets));

      await service.loadWidgets();

      expect(mockBackendService.getModuleList).toHaveBeenCalledWith('WIDGET');
      expect(Object.keys(service.widgets)).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      expect(service.widgets['w1'].metadata.name).toBe('W1');
    });

    it('should handle empty widget response', async () => {
      mockBackendService.getModuleList.mockReturnValue(of([]));
      await service.loadWidgets();
      expect(Object.keys(service.widgets)).toHaveLength(0);
    });
  });

  describe('getModuleHtml', () => {
    it('should return cached HTML if present', async () => {
      const module = new VeronaModuleClass({
        key: 'm1',
        sortKey: 'm1',
        metadata: {
          id: 'm1',
          name: 'M1',
          type: 'player',
          model: 'aspect',
          version: '1.0',
          specVersion: '1.0',
          isStable: true
        }
      });
      module.html = 'cached html';

      const result = await service.getModuleHtml(module);

      expect(result).toBe('cached html');
      expect(mockBackendService.getModuleHtml).not.toHaveBeenCalled();
    });

    it('should fetch and cache HTML from backend if not cached', async () => {
      const module = new VeronaModuleClass({
        key: 'm1',
        sortKey: 'm1',
        metadata: {
          id: 'm1',
          name: 'M1',
          type: 'player',
          model: 'aspect',
          version: '1.0',
          specVersion: '1.0',
          isStable: true
        }
      });
      const mockFile: VeronaModuleFileDto = {
        key: 'm1',
        name: 'M1',
        file: 'backend html'
      };

      mockBackendService.getModuleHtml.mockReturnValue(of(mockFile));

      const result = await service.getModuleHtml(module);

      expect(result).toBe('backend html');
      expect(module.html).toBe('backend html');
      expect(mockBackendService.getModuleHtml).toHaveBeenCalledWith('m1');
    });

    it('should return empty string on error', async () => {
      const module = new VeronaModuleClass({
        key: 'm1',
        sortKey: 'm1',
        metadata: {
          id: 'm1',
          name: 'M1',
          type: 'player',
          model: 'aspect',
          version: '1.0',
          specVersion: '1.0',
          isStable: true
        }
      });
      mockBackendService.getModuleHtml.mockReturnValue(of(null));

      const result = await service.getModuleHtml(module);

      expect(result).toBe('');
      expect(module.html).toBe('');
    });
  });
});
