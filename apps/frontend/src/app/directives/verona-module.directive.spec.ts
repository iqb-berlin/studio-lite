import { ElementRef } from '@angular/core';
import {
  BehaviorSubject, firstValueFrom, Subject, of
} from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import {
  UnitDefinitionDto,
  UnitPropertiesDto,
  VeronaModuleMetadataDto
} from '@studio-lite-lib/api-dto';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { AppService } from '../services/app.service';
import { WorkspaceBackendService } from '../modules/workspace/services/workspace-backend.service';
import { WorkspaceService } from '../modules/workspace/services/workspace.service';
import { UnitDefinitionStore } from '../modules/workspace/classes/unit-definition-store';
import { UnitMetadataStore } from '../modules/workspace/classes/unit-metadata-store';
import { ModuleService } from '../services/module.service';
import { VeronaModuleClass } from '../models/verona-module.class';
import { VeronaModuleDirective } from './verona-module.directive';

const createMessageEvent =
  <T>(data: T, source: Window): MessageEvent<T> => ({ data, source } as unknown as MessageEvent<T>);

class TestVeronaModuleDirective extends VeronaModuleDirective {
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

  constructor(
    moduleService: ModuleService,
    translateService: TranslateService,
    snackBar: MatSnackBar,
    backendService: WorkspaceBackendService,
    workspaceService: WorkspaceService,
    appService: AppService,
    hostingIframe: ElementRef
  ) {
    super();
    this.moduleService = moduleService;
    this.translateService = translateService;
    this.snackBar = snackBar;
    this.backendService = backendService;
    this.workspaceService = workspaceService;
    this.appService = appService;
    this.hostingIframe = hostingIframe;
  }

  buildModule(moduleId: string | undefined, moduleType: 'player' | 'editor' | 'schemer'): void {
    this.buildVeronaModule(moduleId, moduleType);
  }
}

describe('VeronaModuleDirective', () => {
  const createDirective = () => {
    const moduleService = {
      players: {},
      editors: {},
      schemers: {},
      loadList: jest.fn(),
      getModuleHtml: jest.fn()
    } as unknown as ModuleService;

    const translateService = {
      instant: jest.fn((key: string) => key)
    } as unknown as TranslateService;

    const snackBar = { open: jest.fn() } as unknown as MatSnackBar;

    const backendService = {
      getUnitDefinition: jest.fn()
    } as unknown as jest.Mocked<WorkspaceBackendService>;

    const workspaceService = {
      selectedWorkspaceId: 7,
      selectedUnit$: new BehaviorSubject<number>(0),
      setUnitDefinitionStore: jest.fn()
    } as unknown as WorkspaceService;

    const appService = {
      postMessage$: new Subject<MessageEvent>()
    } as unknown as AppService;

    const hostingIframe = {
      nativeElement: document.createElement('iframe')
    } as ElementRef;

    const directive = new TestVeronaModuleDirective(
      moduleService,
      translateService,
      snackBar,
      backendService,
      workspaceService,
      appService,
      hostingIframe
    );

    return {
      directive,
      moduleService,
      translateService,
      snackBar,
      backendService,
      workspaceService,
      appService,
      hostingIframe
    };
  };

  it('sets iframe element from hosting element', () => {
    const { directive, hostingIframe } = createDirective();

    directive.setHostingIframe();

    expect(directive.iFrameElement).toBe(hostingIframe.nativeElement);
  });

  it('subscribes to selected unit changes', () => {
    const { directive, workspaceService } = createDirective();

    directive.subscribeForSelectedUnitChange();
    directive.onSelectedUnitChange.mockClear();
    workspaceService.selectedUnit$.next(3);

    expect(directive.onSelectedUnitChange).toHaveBeenCalledTimes(1);
  });

  it('subscribes to post messages', () => {
    const { directive, appService } = createDirective();

    directive.subscribeForPostMessages();
    const message = createMessageEvent({ type: 'x' }, window);
    appService.postMessage$.next(message);

    expect(directive.handleIncomingMessage).toHaveBeenCalledWith(message);
  });

  it('handles missing unit id by clearing post target and setting message', () => {
    const { directive, translateService } = createDirective();

    directive.postMessageTarget = window;
    directive.sendUnitDefinition(0, undefined);

    expect(translateService.instant).toHaveBeenCalledWith('workspace.unit-not-found');
    expect(directive.message).toBe('workspace.unit-not-found');
    expect(directive.postMessageTarget).toBeUndefined();
  });

  it('posts store when unit definition store exists', () => {
    const { directive, backendService } = createDirective();
    const unitDefinitionStore = new UnitDefinitionStore(1, { definition: 'x', variables: [] });

    directive.sendUnitDefinition(1, unitDefinitionStore);

    expect(directive.postStore).toHaveBeenCalledWith(unitDefinitionStore);
    expect(backendService.getUnitDefinition).not.toHaveBeenCalled();
  });

  it('loads unit definition when missing store and posts it', () => {
    const { directive, backendService, workspaceService } = createDirective();

    const definitionDto: UnitDefinitionDto = {
      definition: 'content',
      variables: []
    };

    backendService.getUnitDefinition.mockReturnValue(of(definitionDto));

    directive.sendUnitDefinition(5, undefined);

    expect(backendService.getUnitDefinition).toHaveBeenCalledWith(7, 5);
    expect(workspaceService.setUnitDefinitionStore).toHaveBeenCalledWith(expect.any(UnitDefinitionStore));
    expect(directive.postStore).toHaveBeenCalledWith(expect.any(UnitDefinitionStore));
  });

  it('shows error when unit definition cannot be loaded', () => {
    const {
      directive, backendService, snackBar, translateService
    } = createDirective();

    backendService.getUnitDefinition.mockReturnValue(of(null));

    directive.sendUnitDefinition(5, undefined);

    expect(snackBar.open).toHaveBeenCalledWith(
      'workspace.unit-definition-not-loaded',
      'workspace.error',
      { duration: 3000 }
    );
    expect(translateService.instant).toHaveBeenCalledWith('workspace.unit-definition-not-loaded');
  });

  it('returns empty module id when metadata store is missing', async () => {
    const { directive } = createDirective();

    const moduleId = await firstValueFrom(directive.getVeronaModuleId(undefined, 'player'));

    expect(moduleId).toBe('');
  });

  it('loads module list before resolving module id', async () => {
    const { directive, moduleService } = createDirective();

    const metadataStore = new UnitMetadataStore({ id: 1, player: 'player-id' } as UnitPropertiesDto);
    const module = new VeronaModuleClass({
      key: 'module-1',
      sortKey: 'module-1',
      metadata: {
        type: 'player',
        id: 'player-id',
        name: 'Player',
        version: '1.0.0',
        specVersion: '3.0',
        isStable: true
      } as VeronaModuleMetadataDto,
      fileSize: 0,
      fileDateTime: 0
    });

    moduleService.loadList = jest.fn().mockImplementation(() => {
      moduleService.players = { 'module-1': module };
      return Promise.resolve();
    });

    const matchSpy = jest.spyOn(VeronaModuleFactory, 'getBestMatch').mockReturnValue('module-1');

    const moduleId = await firstValueFrom(directive.getVeronaModuleId(metadataStore, 'player'));

    expect(moduleService.loadList).toHaveBeenCalled();
    expect(matchSpy).toHaveBeenCalledWith('player-id', ['module-1']);
    expect(moduleId).toBe('module-1');

    matchSpy.mockRestore();
  });

  it('builds module when iframe exists and module html is available', async () => {
    const { directive, moduleService } = createDirective();

    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    directive.iFrameElement = iframe;

    const module = new VeronaModuleClass({
      key: 'module-2',
      sortKey: 'module-2',
      metadata: {
        type: 'player',
        id: 'player-id',
        name: 'Player',
        version: '1.0.0',
        specVersion: '3.0',
        isStable: true
      } as VeronaModuleMetadataDto,
      fileSize: 0,
      fileDateTime: 0
    });

    moduleService.players = { 'module-2': module };
    moduleService.getModuleHtml = jest.fn().mockResolvedValue('<html lang=""></html>');

    directive.buildModule('module-2', 'player');

    await Promise.resolve();

    expect(iframe.srcdoc).toBe('<html lang=""></html>');
    expect(directive.lastVeronaModuleId).toBe('module-2');
    expect(directive.message).toBe('');

    document.body.removeChild(iframe);
  });

  it('handles missing module html by setting message', async () => {
    const { directive, moduleService, translateService } = createDirective();

    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    directive.iFrameElement = iframe;

    const module = new VeronaModuleClass({
      key: 'module-3',
      sortKey: 'module-3',
      metadata: {
        type: 'player',
        id: 'player-id',
        name: 'Player',
        version: '1.0.0',
        specVersion: '3.0',
        isStable: true
      } as VeronaModuleMetadataDto,
      fileSize: 0,
      fileDateTime: 0
    });

    moduleService.players = { 'module-3': module };
    moduleService.getModuleHtml = jest.fn().mockResolvedValue('');

    directive.buildModule('module-3', 'player');

    await Promise.resolve();

    expect(translateService.instant).toHaveBeenCalledWith('workspace.player-not-loaded', { id: 'module-3' });
    expect(directive.lastVeronaModuleId).toBe('');

    document.body.removeChild(iframe);
  });

  it('clears module state when module id is missing', () => {
    const { directive } = createDirective();

    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.srcdoc = 'before';
    directive.iFrameElement = iframe;
    directive.lastVeronaModuleId = 'module-x';

    directive.buildModule(undefined, 'player');

    expect(iframe.srcdoc).toBe('');
    expect(directive.lastVeronaModuleId).toBe('');

    document.body.removeChild(iframe);
  });
});
