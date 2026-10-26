import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../services/app.service';
import { ModuleService } from '../services/module.service';
import { WorkspaceBackendService } from '../modules/workspace/services/workspace-backend.service';
import { WorkspaceService } from '../modules/workspace/services/workspace.service';
import { UnitStoresService } from '../modules/workspace/services/unit-stores.service';
import { UnitDefinitionStore } from '../modules/workspace/classes/unit-definition-store';
import { UnitDefinitionDirective } from './unit-definition.directive';

class TestUnitDefinitionDirective extends UnitDefinitionDirective {
  hostingIframe: ElementRef;

  onSelectedUnitChange = jest.fn();
  postStore = jest.fn();
  handleIncomingMessage = jest.fn();
  sendChangeData = jest.fn();
  startSubscriptions = jest.fn();

  constructor() {
    super();
    this.hostingIframe = { nativeElement: document.createElement('iframe') } as ElementRef;
  }
}

describe('UnitDefinitionDirective', () => {
  let definitionStore$: BehaviorSubject<UnitDefinitionStore | undefined>;
  let directive: TestUnitDefinitionDirective;

  beforeEach(() => {
    definitionStore$ = new BehaviorSubject<UnitDefinitionStore | undefined>(undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: UnitStoresService, useValue: { definitionStore$ } },
        { provide: WorkspaceService, useValue: {} },
        { provide: ModuleService, useValue: { loadList: jest.fn() } },
        { provide: TranslateService, useValue: { instant: jest.fn() } },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
        { provide: WorkspaceBackendService, useValue: { getUnitDefinition: jest.fn() } },
        { provide: AppService, useValue: { postMessage$: new Subject<MessageEvent>() } }
      ]
    });
    directive = TestBed.runInInjectionContext(() => new TestUnitDefinitionDirective());
  });

  it('subscribes to existing store changes and calls sendChangeData', () => {
    const store = new UnitDefinitionStore(1, { definition: 'def', variables: [] });
    definitionStore$.next(store);

    directive.addSubscriptionForUnitDefinitionChanges();
    store.setData([], 'new');

    expect(directive.sendChangeData).toHaveBeenCalledTimes(1);
  });

  it('waits for store availability and then subscribes to changes', () => {
    const store = new UnitDefinitionStore(1, { definition: 'def', variables: [] });

    directive.addSubscriptionForUnitDefinitionChanges();
    definitionStore$.next(store);
    store.setData([], 'new');

    expect(directive.sendChangeData).toHaveBeenCalledTimes(1);
  });

  it('follows the store of the next unit and lets go of the previous one', () => {
    const previous = new UnitDefinitionStore(1, { definition: 'def', variables: [] });
    const next = new UnitDefinitionStore(2, { definition: 'def', variables: [] });
    definitionStore$.next(previous);
    directive.addSubscriptionForUnitDefinitionChanges();

    definitionStore$.next(undefined);
    definitionStore$.next(next);
    previous.setData([], 'stale');
    next.setData([], 'new');

    expect(directive.sendChangeData).toHaveBeenCalledTimes(1);
  });

  it('stops when the component cancels its subscriptions', () => {
    const store = new UnitDefinitionStore(1, { definition: 'def', variables: [] });
    definitionStore$.next(store);
    directive.addSubscriptionForUnitDefinitionChanges();

    directive.ngUnsubscribe.next();
    store.setData([], 'new');

    expect(directive.sendChangeData).not.toHaveBeenCalled();
  });
});
