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

  describe('loadList', () => {
    it('should populate editors, players, and schemers dictionaries', async () => {
      const mockModulesByType: Record<string, VeronaModuleInListDto[]> = {
        EDITOR: [{
          key: 'e1',
          sortKey: 'e1',
          metadata: {
            id: 'e1',
            name: 'E1',
            type: 'EDITOR',
            model: '',
            version: '1.0',
            specVersion: '1.0',
            isStable: true
          }
        }],
        PLAYER: [{
          key: 'p1',
          sortKey: 'p1',
          metadata: {
            id: 'p1',
            name: 'P1',
            type: 'PLAYER',
            model: 'speedTest',
            version: '1.0',
            specVersion: '1.0',
            isStable: true
          }
        }],
        SCHEMER: [{
          key: 's1',
          sortKey: 's1',
          metadata: {
            id: 's1',
            name: 'S1',
            type: 'SCHEMER',
            model: 'iqb',
            version: '1.0',
            specVersion: '1.0',
            isStable: true
          }
        }]
      };

      mockBackendService.getModuleList.mockImplementation((type?: string) => of(mockModulesByType[type || ''] || []));

      await service.loadList();

      expect(mockBackendService.getModuleList).toHaveBeenCalledWith('EDITOR');
      expect(mockBackendService.getModuleList).toHaveBeenCalledWith('PLAYER');
      expect(mockBackendService.getModuleList).toHaveBeenCalledWith('SCHEMER');

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

    // an installation without modules has empty lists, a failed request none (#2135)
    it('should tell lists that loaded empty from a request that failed', async () => {
      mockBackendService.getModuleList.mockImplementation((type?: string) => of(type === 'PLAYER' ? null : []));
      await service.loadList();
      expect(service.listLoaded()).toBe(false);

      mockBackendService.getModuleList.mockReturnValue(of([]));
      await service.loadList();
      expect(service.listLoaded()).toBe(true);
      // what is computed from the maps is told of each load, a failed one as well
      expect(service.listVersion()).toBe(2);
    });

    // the workspace, the properties and the unit check each ask as a unit opens (#2135)
    it('should let a call join a load that is running, and load again once it is done', async () => {
      mockBackendService.getModuleList.mockReturnValue(of([]));

      await Promise.all([service.loadList(), service.loadList(), service.loadList()]);
      expect(mockBackendService.getModuleList).toHaveBeenCalledTimes(3);

      await service.loadList();
      expect(mockBackendService.getModuleList).toHaveBeenCalledTimes(6);
    });

    it('should keep the modules a failed reload could not fetch again', async () => {
      const player: VeronaModuleInListDto = {
        key: 'p1',
        sortKey: 'p1',
        metadata: {
          id: 'p1', name: 'P1', type: 'PLAYER', model: '', version: '1.0', specVersion: '1.0', isStable: true
        }
      };
      mockBackendService.getModuleList.mockImplementation((type?: string) => of(type === 'PLAYER' ? [player] : []));
      await service.loadList();

      mockBackendService.getModuleList.mockImplementation((type?: string) => of(type === 'PLAYER' ? null : []));
      await service.loadList();

      expect(Object.keys(service.players)).toEqual(['p1']);
      expect(service.listLoaded()).toBe(true);
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

    // an empty map alone would pass for an installation without widgets (#2198)
    it('should tell an installation without widgets from a request that failed', async () => {
      mockBackendService.getModuleList.mockReturnValue(of([]));
      expect(await service.loadWidgets()).toBe(true);

      mockBackendService.getModuleList.mockReturnValue(of(null));
      expect(await service.loadWidgets()).toBe(false);
      expect(service.widgets).toEqual({});
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
