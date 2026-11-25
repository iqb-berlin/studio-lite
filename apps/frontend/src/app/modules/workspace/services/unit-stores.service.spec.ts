import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { UnitMetadataValues, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import { UnitStoresService } from './unit-stores.service';
import { WorkspaceBackendService } from './workspace-backend.service';
import { UnitDefinitionStore } from '../classes/unit-definition-store';

describe('UnitStoresService', () => {
  let service: UnitStoresService;
  let backendService: {
    getUnitProperties: jest.Mock;
    getUnitMetadata: jest.Mock;
    getUnitDefinition: jest.Mock;
    getUnitScheme: jest.Mock;
  };

  beforeEach(() => {
    backendService = {
      getUnitProperties: jest.fn(),
      getUnitMetadata: jest.fn(),
      getUnitDefinition: jest.fn(),
      getUnitScheme: jest.fn()
    };
    TestBed.configureTestingModule({
      providers: [
        UnitStoresService,
        { provide: WorkspaceBackendService, useValue: backendService }
      ]
    });
    service = TestBed.inject(UnitStoresService);
  });

  describe('loadPropertiesStore', () => {
    it('should create the store from the server\'s answer and report the answer', () => {
      const properties: UnitPropertiesDto = { id: 3, key: 'U3', name: 'Unit 3' };
      const reported = jest.fn();
      service.propertiesLoaded$.subscribe(reported);
      backendService.getUnitProperties.mockReturnValue(of(properties));

      let loaded;
      service.loadPropertiesStore(1, 3).subscribe(store => { loaded = store; });

      expect(backendService.getUnitProperties).toHaveBeenCalledWith(1, 3);
      expect(loaded).toBe(service.propertiesStore());
      expect(service.propertiesStore()?.getData().key).toBe('U3');
      expect(service.propertiesStore()?.loaded).toBe(true);
      expect(reported).toHaveBeenCalledWith(properties);
    });

    it('should create an empty store for the unit, marked as not loaded, when the server does not answer', () => {
      backendService.getUnitProperties.mockReturnValue(of(null));

      service.loadPropertiesStore(1, 5).subscribe();

      expect(service.propertiesStore()?.getData().id).toBe(5);
      expect(service.propertiesStore()?.loaded).toBe(false);
    });

    it('should hand out the store it has without asking the server again', () => {
      backendService.getUnitProperties.mockReturnValue(of({ id: 3 }));
      service.loadPropertiesStore(1, 3).subscribe();
      const store = service.propertiesStore();

      let loaded;
      service.loadPropertiesStore(1, 3).subscribe(again => { loaded = again; });

      expect(loaded).toBe(store);
      expect(backendService.getUnitProperties).toHaveBeenCalledTimes(1);
    });

    it('should share one request between two that ask while it is under way', () => {
      const response = new Subject<UnitPropertiesDto>();
      backendService.getUnitProperties.mockReturnValue(response);
      const first = jest.fn();
      const second = jest.fn();

      service.loadPropertiesStore(1, 3).subscribe(first);
      service.loadPropertiesStore(1, 3).subscribe(second);
      response.next({ id: 3 });
      response.complete();

      expect(backendService.getUnitProperties).toHaveBeenCalledTimes(1);
      expect(first).toHaveBeenCalledWith(service.propertiesStore());
      expect(second).toHaveBeenCalledWith(service.propertiesStore());
    });
  });

  // the metadata have a store of their own since they have a tab of their own (#2200)
  describe('loadMetadataStore', () => {
    it('should create the store for the unit asked for from the server\'s answer', () => {
      backendService.getUnitMetadata.mockReturnValue(of({ profiles: [] }));

      service.loadMetadataStore(1, 3).subscribe();

      expect(backendService.getUnitMetadata).toHaveBeenCalledWith(1, 3);
      expect(service.metadataStore()?.unitId).toBe(3);
      expect(service.metadataStore()?.getData()).toEqual({ profiles: [] });
    });

    it('should hand out nothing when the server does not answer, and ask again next time', () => {
      backendService.getUnitMetadata.mockReturnValue(of(null));
      service.loadMetadataStore(1, 3).subscribe();
      expect(service.metadataStore()).toBeUndefined();

      backendService.getUnitMetadata.mockReturnValue(of({ profiles: [] }));
      service.loadMetadataStore(1, 3).subscribe();
      expect(service.metadataStore()?.unitId).toBe(3);
    });
  });

  describe('loadDefinitionStore', () => {
    it('should hand out nothing when the server does not answer, and ask again next time', () => {
      backendService.getUnitDefinition.mockReturnValue(of(null));
      const loaded = jest.fn();

      service.loadDefinitionStore(1, 3).subscribe(loaded);
      service.loadDefinitionStore(1, 3).subscribe();

      expect(loaded).toHaveBeenCalledWith(undefined);
      expect(service.definitionStore()).toBeUndefined();
      expect(backendService.getUnitDefinition).toHaveBeenCalledTimes(2);
    });
  });

  describe('variables', () => {
    it('is empty until the scheme is loaded, then follows the editor\'s unsaved list', () => {
      backendService.getUnitDefinition.mockReturnValue(of({
        definition: 'def',
        variables: [{ id: 'a', alias: 'a', type: 'string' }]
      }));
      backendService.getUnitScheme.mockReturnValue(of({ scheme: '{"variableCodings":[]}', schemeType: 'iqb@3.4' }));
      service.loadDefinitionStore(1, 3).subscribe();
      expect(service.variables()).toEqual([]);

      service.loadSchemeStore(1, 3).subscribe();
      expect(service.variables()).toEqual([{ id: 'a', alias: 'a' }]);

      service.definitionStore()?.setData(
        [{ id: 'a', alias: 'a', type: 'string' }, { id: 'b', alias: 'b', type: 'string' }] as VariableInfo[],
        'def'
      );
      expect(service.variables()).toEqual([{ id: 'a', alias: 'a' }, { id: 'b', alias: 'b' }]);
    });
  });

  describe('changed', () => {
    beforeEach(() => {
      backendService.getUnitProperties.mockReturnValue(of({ id: 3, player: 'player@1.0' }));
      backendService.getUnitMetadata.mockReturnValue(of({ profiles: [] }));
      backendService.getUnitDefinition.mockReturnValue(of({ definition: 'def', variables: [] }));
      backendService.getUnitScheme.mockReturnValue(of({ scheme: '{}', schemeType: 'type' }));
      service.loadPropertiesStore(1, 3).subscribe();
      service.loadMetadataStore(1, 3).subscribe();
      service.loadDefinitionStore(1, 3).subscribe();
      service.loadSchemeStore(1, 3).subscribe();
    });

    it('should be false while no store holds a change', () => {
      expect(service.changed()).toBe(false);
    });

    it('should follow a change in any of the stores', () => {
      service.propertiesStore()?.setPlayer('player@2.0');
      expect(service.changed()).toBe(true);
      service.propertiesStore()?.setPlayer('player@1.0');
      expect(service.changed()).toBe(false);

      service.metadataStore()?.setMetadata({ items: [{ id: 'item1' }] });
      expect(service.changed()).toBe(true);
      service.metadataStore()?.restore();

      service.definitionStore()?.setData([], 'new');
      expect(service.changed()).toBe(true);
      service.definitionStore()?.restore();

      service.schemeStore()?.setData('{"new": true}', 'type');
      expect(service.changed()).toBe(true);
    });

    it('should be false again once the changes are discarded', () => {
      service.propertiesStore()?.setPlayer('player@2.0');
      service.metadataStore()?.setMetadata({ items: [{ id: 'item1' }] });
      service.definitionStore()?.setData([], 'new');

      service.restore();

      expect(service.changed()).toBe(false);
    });

    it('should be false once the stores are let go of', () => {
      service.propertiesStore()?.setPlayer('player@2.0');

      service.reset();

      expect(service.changed()).toBe(false);
    });
  });

  describe('reset', () => {
    it('should let go of all stores', () => {
      backendService.getUnitProperties.mockReturnValue(of({ id: 3 }));
      backendService.getUnitMetadata.mockReturnValue(of({ profiles: [] }));
      backendService.getUnitDefinition.mockReturnValue(of({ definition: 'def', variables: [] }));
      backendService.getUnitScheme.mockReturnValue(of({ scheme: '{}', schemeType: 'type' }));
      service.loadPropertiesStore(1, 3).subscribe();
      service.loadMetadataStore(1, 3).subscribe();
      service.loadDefinitionStore(1, 3).subscribe();
      service.loadSchemeStore(1, 3).subscribe();

      service.reset();

      expect(service.propertiesStore()).toBeUndefined();
      expect(service.metadataStore()).toBeUndefined();
      expect(service.definitionStore()).toBeUndefined();
      expect(service.schemeStore()).toBeUndefined();
    });

    it('should neither keep nor hand out a store whose answer arrives after the unit was left', () => {
      const response = new Subject<UnitPropertiesDto>();
      backendService.getUnitProperties.mockReturnValue(response);
      const reported = jest.fn();
      const waiting = jest.fn();
      service.propertiesLoaded$.subscribe(reported);
      service.loadPropertiesStore(1, 3).subscribe(waiting);

      service.reset();
      response.next({ id: 3 });

      expect(service.propertiesStore()).toBeUndefined();
      expect(reported).not.toHaveBeenCalled();
      expect(waiting).not.toHaveBeenCalled();
    });

    // clicked through quickly: the metadata of the unit left must not land in the place of the next (#2200)
    it('should not keep the metadata of a unit left before they arrived', () => {
      const response = new Subject<UnitMetadataValues>();
      backendService.getUnitMetadata.mockReturnValue(response);
      const waiting = jest.fn();
      service.loadMetadataStore(1, 3).subscribe(waiting);

      service.reset();
      backendService.getUnitMetadata.mockReturnValue(of({ profiles: [{ profileId: 'of-4', entries: [] }] }));
      service.loadMetadataStore(1, 4).subscribe();
      response.next({ profiles: [{ profileId: 'of-3', entries: [] }] });

      expect(service.metadataStore()?.unitId).toBe(4);
      expect(service.metadataStore()?.getData().profiles?.[0].profileId).toBe('of-4');
      expect(waiting).not.toHaveBeenCalled();
    });

    it('should ask the server anew for the next unit', () => {
      backendService.getUnitProperties.mockReturnValue(new Subject<UnitPropertiesDto>());
      service.loadPropertiesStore(1, 3).subscribe();

      service.reset();
      backendService.getUnitProperties.mockReturnValue(of({ id: 4 }));
      service.loadPropertiesStore(1, 4).subscribe();

      expect(service.propertiesStore()?.getData().id).toBe(4);
    });
  });

  describe('definitionStore$', () => {
    it('should pass on each definition store there is', () => {
      const stores: (UnitDefinitionStore | undefined)[] = [];
      service.definitionStore$.subscribe(store => stores.push(store));
      TestBed.tick();
      backendService.getUnitDefinition.mockReturnValue(of({ definition: 'def', variables: [] }));

      service.loadDefinitionStore(1, 3).subscribe();
      const loaded = service.definitionStore();
      TestBed.tick();
      service.reset();
      TestBed.tick();

      expect(loaded).toBeInstanceOf(UnitDefinitionStore);
      expect(stores).toEqual([undefined, loaded, undefined]);
    });
  });
});
