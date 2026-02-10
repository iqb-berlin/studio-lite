import { EventEmitter, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../../services/app.service';
import { ModuleService } from '../services/module.service';
import { WorkspaceBackendService } from '../../workspace/services/workspace-backend.service';
import { WorkspaceService } from '../../workspace/services/workspace.service';
import { UnitDefinitionStore } from '../../workspace/classes/unit-definition-store';
import { UnitDefinitionDirective } from './unit-definition.directive';

class TestUnitDefinitionDirective extends UnitDefinitionDirective {
  moduleService: ModuleService;
  translateService: TranslateService;
  snackBar: MatSnackBar;
  backendService: WorkspaceBackendService;
  workspaceService: WorkspaceService;
  appService: AppService;
  hostingIframe: ElementRef;

  onSelectedUnitChange = jest.fn();
  postStore = jest.fn();
  handleIncomingMessage = jest.fn();
  sendChangeData = jest.fn();

  constructor(workspaceService: WorkspaceService) {
    super();
    this.workspaceService = workspaceService;
    this.moduleService = { loadList: jest.fn() } as unknown as ModuleService;
    this.translateService = { instant: jest.fn() } as unknown as TranslateService;
    this.snackBar = { open: jest.fn() } as unknown as MatSnackBar;
    this.backendService = { getUnitDefinition: jest.fn() } as unknown as WorkspaceBackendService;
    this.appService = { postMessage$: new Subject<MessageEvent>() } as unknown as AppService;
    this.hostingIframe = { nativeElement: document.createElement('iframe') } as ElementRef;
  }
}

describe('UnitDefinitionDirective', () => {
  it('subscribes to existing store changes and calls sendChangeData', () => {
    const dataChange$ = new Subject<void>();
    const unitDefinitionStore = { dataChange: dataChange$ } as UnitDefinitionStore;
    const workspaceService = {
      getUnitDefinitionStore: jest.fn(() => unitDefinitionStore),
      unitDefinitionStoreChanged: new EventEmitter<UnitDefinitionStore | undefined>()
    } as unknown as WorkspaceService;

    const directive = new TestUnitDefinitionDirective(workspaceService);

    directive.addSubscriptionForUnitDefinitionChanges();
    dataChange$.next();

    expect(directive.sendChangeData).toHaveBeenCalledTimes(1);
  });

  it('waits for store availability and then subscribes to changes', () => {
    const dataChange$ = new Subject<void>();
    const unitDefinitionStore = { dataChange: dataChange$ } as UnitDefinitionStore;
    let currentStore: UnitDefinitionStore | undefined;

    const unitDefinitionStoreChanged = new EventEmitter<UnitDefinitionStore | undefined>();
    const workspaceService = {
      getUnitDefinitionStore: jest.fn(() => currentStore),
      unitDefinitionStoreChanged
    } as unknown as WorkspaceService;

    const directive = new TestUnitDefinitionDirective(workspaceService);

    directive.addSubscriptionForUnitDefinitionChanges();

    currentStore = unitDefinitionStore;
    unitDefinitionStoreChanged.emit(unitDefinitionStore);
    dataChange$.next();

    expect(directive.sendChangeData).toHaveBeenCalledTimes(1);
  });
});
