import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import {
  UnitDefinitionDto, UnitPropertiesDto, UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { UnitStoresService } from './unit-stores.service';
import { WorkspaceBackendService } from './workspace-backend.service';
import { UnitDefinitionStore } from '../classes/unit-definition-store';

describe('UnitStoresService', () => {
  let service: UnitStoresService;
  let backendService: {
    getUnitProperties: jest.Mock;
    getUnitDefinition: jest.Mock;
    getUnitScheme: jest.Mock;
  };

  beforeEach(() => {
    backendService = {
      getUnitProperties: jest.fn(),
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

  describe('loadMetadataStore', () => {
    it('should create the store from the server\'s answer and report the answer', () => {
      const properties: UnitPropertiesDto = { id: 3, key: 'U3', name: 'Unit 3' };
      const reported = jest.fn();
      service.metadataLoaded$.subscribe(reported);
      backendService.getUnitProperties.mockReturnValue(of(properties));

      let loaded;
      service.loadMetadataStore(1, 3).subscribe(store => { loaded = store; });

      expect(backendService.getUnitProperties).toHaveBeenCalledWith(1, 3);
      expect(loaded).toBe(service.metadataStore());
      expect(service.metadataStore()?.getData().key).toBe('U3');
      expect(reported).toHaveBeenCalledWith(properties);
    });

    it('should create an empty store for the unit when the server does not answer', () => {
      backendService.getUnitProperties.mockReturnValue(of(null));

      service.loadMetadataStore(1, 5).subscribe();

      expect(service.metadataStore()?.getData().id).toBe(5);
    });

    it('should hand out the store it has without asking the server again', () => {
      backendService.getUnitProperties.mockReturnValue(of({ id: 3 }));
      service.loadMetadataStore(1, 3).subscribe();
      const store = service.metadataStore();

      let loaded;
      service.loadMetadataStore(1, 3).subscribe(again => { loaded = again; });

      expect(loaded).toBe(store);
      expect(backendService.getUnitProperties).toHaveBeenCalledTimes(1);
    });

    it('should share one request between two that ask while it is under way', () => {
      const response = new Subject<UnitPropertiesDto>();
      backendService.getUnitProperties.mockReturnValue(response);
      const first = jest.fn();
      const second = jest.fn();

      service.loadMetadataStore(1, 3).subscribe(first);
      service.loadMetadataStore(1, 3).subscribe(second);
      response.next({ id: 3 });
      response.complete();

      expect(backendService.getUnitProperties).toHaveBeenCalledTimes(1);
      expect(first).toHaveBeenCalledWith(service.metadataStore());
      expect(second).toHaveBeenCalledWith(service.metadataStore());
    });
  });

  describe('loadDefinitionStore', () => {
    it('should create the store from the server\'s answer', () => {
      const definition: UnitDefinitionDto = { definition: 'def', variables: [] };
      backendService.getUnitDefinition.mockReturnValue(of(definition));

      service.loadDefinitionStore(1, 3).subscribe();

      expect(service.definitionStore()?.getData().definition).toBe('def');
    });

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

  describe('loadSchemeStore', () => {
    it('should create the store from the server\'s answer', () => {
      const scheme: UnitSchemeDto = { scheme: '{}', schemeType: 'type' };
      backendService.getUnitScheme.mockReturnValue(of(scheme));

      service.loadSchemeStore(1, 3).subscribe();

      expect(service.schemeStore()?.getData().scheme).toBe('{}');
    });
  });

  describe('changed', () => {
    beforeEach(() => {
      backendService.getUnitProperties.mockReturnValue(of({ id: 3, player: 'player@1.0' }));
      backendService.getUnitDefinition.mockReturnValue(of({ definition: 'def', variables: [] }));
      backendService.getUnitScheme.mockReturnValue(of({ scheme: '{}', schemeType: 'type' }));
      service.loadMetadataStore(1, 3).subscribe();
      service.loadDefinitionStore(1, 3).subscribe();
      service.loadSchemeStore(1, 3).subscribe();
    });

    it('should be false while no store holds a change', () => {
      expect(service.changed()).toBe(false);
    });

    it('should follow a change in any of the stores', () => {
      service.metadataStore()?.setPlayer('player@2.0');
      expect(service.changed()).toBe(true);
      service.metadataStore()?.setPlayer('player@1.0');
      expect(service.changed()).toBe(false);

      service.definitionStore()?.setData([], 'new');
      expect(service.changed()).toBe(true);
      service.definitionStore()?.restore();

      service.schemeStore()?.setData('{"new": true}', 'type');
      expect(service.changed()).toBe(true);
    });

    it('should be false again once the changes are discarded', () => {
      service.metadataStore()?.setPlayer('player@2.0');
      service.definitionStore()?.setData([], 'new');

      service.restore();

      expect(service.changed()).toBe(false);
    });

    it('should be false once the stores are let go of', () => {
      service.metadataStore()?.setPlayer('player@2.0');

      service.reset();

      expect(service.changed()).toBe(false);
    });
  });

  describe('reset', () => {
    it('should let go of all stores', () => {
      backendService.getUnitProperties.mockReturnValue(of({ id: 3 }));
      backendService.getUnitDefinition.mockReturnValue(of({ definition: 'def', variables: [] }));
      backendService.getUnitScheme.mockReturnValue(of({ scheme: '{}', schemeType: 'type' }));
      service.loadMetadataStore(1, 3).subscribe();
      service.loadDefinitionStore(1, 3).subscribe();
      service.loadSchemeStore(1, 3).subscribe();

      service.reset();

      expect(service.metadataStore()).toBeUndefined();
      expect(service.definitionStore()).toBeUndefined();
      expect(service.schemeStore()).toBeUndefined();
    });

    it('should neither keep nor hand out a store whose answer arrives after the unit was left', () => {
      const response = new Subject<UnitPropertiesDto>();
      backendService.getUnitProperties.mockReturnValue(response);
      const reported = jest.fn();
      const waiting = jest.fn();
      service.metadataLoaded$.subscribe(reported);
      service.loadMetadataStore(1, 3).subscribe(waiting);

      service.reset();
      response.next({ id: 3 });

      expect(service.metadataStore()).toBeUndefined();
      expect(reported).not.toHaveBeenCalled();
      expect(waiting).not.toHaveBeenCalled();
    });

    it('should ask the server anew for the next unit', () => {
      backendService.getUnitProperties.mockReturnValue(new Subject<UnitPropertiesDto>());
      service.loadMetadataStore(1, 3).subscribe();

      service.reset();
      backendService.getUnitProperties.mockReturnValue(of({ id: 4 }));
      service.loadMetadataStore(1, 4).subscribe();

      expect(service.metadataStore()?.getData().id).toBe(4);
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
