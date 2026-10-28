import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
import { UnitStoresService } from '../modules/workspace/services/unit-stores.service';
import { UnitDefinitionStore } from '../modules/workspace/classes/unit-definition-store';
import { UnitMetadataStore } from '../modules/workspace/classes/unit-metadata-store';
import { ModuleService } from '../services/module.service';
import { VeronaModuleClass } from '../models/verona-module.class';
import { VeronaModuleDirective } from './verona-module.directive';

const createMessageEvent =
  <T>(data: T, source: Window): MessageEvent<T> => ({ data, source } as unknown as MessageEvent<T>);

class TestVeronaModuleDirective extends VeronaModuleDirective {
  hostingIframe: ElementRef;

  onSelectedUnitChange = jest.fn();
  postStore = jest.fn();
  handleIncomingMessage = jest.fn();
  startSubscriptions = jest.fn();

  constructor(hostingIframe: ElementRef) {
    super();
    this.hostingIframe = hostingIframe;
  }

  renew(): void {
    this.renewSubscriptions();
  }

  buildModule(moduleId: string | undefined, moduleType: 'player' | 'editor' | 'schemer'): void {
    this.buildVeronaModule(moduleId, moduleType);
  }

  show(moduleId: string, moduleType: 'player' | 'editor' | 'schemer', sendUnit: () => void): boolean {
    return this.showVeronaModule(moduleId, moduleType, sendUnit);
  }

  accept(m: MessageEvent): boolean {
    return this.acceptMessageFromModule(m);
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
      selectedUnit$: new BehaviorSubject<number>(0)
    } as unknown as WorkspaceService;

    const appService = {
      postMessage$: new Subject<MessageEvent>()
    } as unknown as AppService;

    const hostingIframe = {
      nativeElement: document.createElement('iframe')
    } as ElementRef;

    TestBed.configureTestingModule({
      providers: [
        { provide: ModuleService, useValue: moduleService },
        { provide: TranslateService, useValue: translateService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: WorkspaceBackendService, useValue: backendService },
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: AppService, useValue: appService }
      ]
    });
    const unitStores = TestBed.inject(UnitStoresService);
    const directive = TestBed.runInInjectionContext(() => new TestVeronaModuleDirective(hostingIframe));

    return {
      directive,
      moduleService,
      translateService,
      snackBar,
      backendService,
      workspaceService,
      appService,
      hostingIframe,
      unitStores
    };
  };

  const createModule = (key: string, type: 'player' | 'editor' | 'schemer' = 'player') => new VeronaModuleClass({
    key,
    sortKey: key,
    metadata: {
      type,
      id: `${type}-id`,
      name: type,
      version: '1.0.0',
      specVersion: '3.0',
      isStable: true
    } as VeronaModuleMetadataDto,
    fileSize: 0,
    fileDateTime: 0
  });

  const provideModule = (
    moduleService: ModuleService,
    type: 'player' | 'editor' | 'schemer',
    module: VeronaModuleClass
  ): void => {
    if (type === 'player') moduleService.players = { [module.key]: module };
    else if (type === 'editor') moduleService.editors = { [module.key]: module };
    else moduleService.schemers = { [module.key]: module };
  };

  // Every value the directive assigns to srcdoc, in order, so a test can tell a single navigation
  // from a navigation preceded by an emptying one.
  const recordSrcdocAssignments = (iframe: HTMLIFrameElement): string[] => {
    const assigned: string[] = [];
    Object.defineProperty(iframe, 'srcdoc', {
      configurable: true,
      get: () => (assigned.length ? assigned[assigned.length - 1] : ''),
      set: (value: string) => { assigned.push(value); }
    });
    return assigned;
  };

  it('handles missing unit id by clearing post target and setting message', () => {
    const { directive, translateService } = createDirective();

    directive.postMessageTarget = window;
    directive.sendUnitDefinition(0);

    expect(translateService.instant).toHaveBeenCalledWith('workspace.unit-not-found');
    expect(directive.message).toBe('workspace.unit-not-found');
    expect(directive.postMessageTarget).toBeUndefined();
  });

  it('loads unit definition when missing store and posts it', () => {
    const { directive, backendService, unitStores } = createDirective();

    const definitionDto: UnitDefinitionDto = {
      definition: 'content',
      variables: []
    };

    backendService.getUnitDefinition.mockReturnValue(of(definitionDto));

    directive.sendUnitDefinition(5);

    expect(backendService.getUnitDefinition).toHaveBeenCalledWith(7, 5);
    expect(unitStores.definitionStore()).toEqual(expect.any(UnitDefinitionStore));
    expect(directive.postStore).toHaveBeenCalledWith(unitStores.definitionStore());
  });

  it('posts the store it has without loading the definition again', () => {
    const { directive, backendService, unitStores } = createDirective();
    backendService.getUnitDefinition.mockReturnValue(of({ definition: 'x', variables: [] }));
    directive.sendUnitDefinition(5);
    directive.postStore.mockClear();

    directive.sendUnitDefinition(5);

    expect(directive.postStore).toHaveBeenCalledWith(unitStores.definitionStore());
    expect(backendService.getUnitDefinition).toHaveBeenCalledTimes(1);
  });

  it('shows error when unit definition cannot be loaded', () => {
    const {
      directive, backendService, snackBar, translateService
    } = createDirective();

    backendService.getUnitDefinition.mockReturnValue(of(null));

    directive.sendUnitDefinition(5);

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

    moduleService.players = { 'module-2': createModule('module-2') };
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
    iframe.srcdoc = 'the module shown so far';
    directive.iFrameElement = iframe;

    moduleService.players = { 'module-3': createModule('module-3') };
    moduleService.getModuleHtml = jest.fn().mockResolvedValue('');

    directive.buildModule('module-3', 'player');

    await Promise.resolve();

    expect(translateService.instant).toHaveBeenCalledWith('workspace.player-not-loaded', { id: 'module-3' });
    expect(directive.lastVeronaModuleId).toBe('');
    expect(iframe.srcdoc).toBe('');

    document.body.removeChild(iframe);
  });

  it.each(['player', 'editor', 'schemer'] as const)(
    'navigates the frame once, without emptying it, when a %s is built',
    async moduleType => {
      const { directive, moduleService } = createDirective();

      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      directive.iFrameElement = iframe;
      const assigned = recordSrcdocAssignments(iframe);

      provideModule(moduleService, moduleType, createModule('module-4', moduleType));
      moduleService.getModuleHtml = jest.fn().mockResolvedValue('<html lang=""></html>');

      directive.buildModule('module-4', moduleType);

      await Promise.resolve();

      expect(assigned).toEqual(['<html lang=""></html>']);

      document.body.removeChild(iframe);
    }
  );

  it('forgets the session id of the module being replaced', async () => {
    const { directive, moduleService } = createDirective();

    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    directive.iFrameElement = iframe;
    directive.sessionId = 'session-of-the-old-module';

    provideModule(moduleService, 'player', createModule('module-5'));
    moduleService.getModuleHtml = jest.fn().mockResolvedValue('<html lang=""></html>');

    directive.buildModule('module-5', 'player');

    expect(directive.sessionId).toBe('');

    await Promise.resolve();

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

  describe('subscription lifecycle', () => {
    it('takes the iframe and starts the host subscriptions once the view is there', () => {
      const { directive, hostingIframe } = createDirective();

      directive.ngAfterViewInit();

      expect(directive.iFrameElement).toBe(hostingIframe.nativeElement);
      expect(directive.startSubscriptions).toHaveBeenCalledTimes(1);
    });

    it('drops every subscription, marks the unit loaded and starts the host subscriptions again', () => {
      const { directive } = createDirective();
      const previous = directive.ngUnsubscribe;
      const dropped = jest.fn();
      previous.subscribe({ complete: dropped });
      directive.unitLoaded.next(false);

      directive.renew();

      expect(dropped).toHaveBeenCalled();
      expect(directive.ngUnsubscribe).not.toBe(previous);
      expect(directive.ngUnsubscribe.closed).toBe(false);
      expect(directive.unitLoaded.getValue()).toBe(true);
      expect(directive.startSubscriptions).toHaveBeenCalledTimes(1);
    });
  });

  describe('showVeronaModule', () => {
    it('says that the unit names no module and loads none', () => {
      const { directive, moduleService } = createDirective();
      const sendUnit = jest.fn();
      directive.postMessageTarget = window;

      const loading = directive.show('', 'editor', sendUnit);

      expect(loading).toBe(false);
      expect(directive.message).toBe('workspace.no-editor');
      expect(directive.postMessageTarget).toBeUndefined();
      expect(sendUnit).not.toHaveBeenCalled();
      expect(moduleService.getModuleHtml).not.toHaveBeenCalled();
    });

    it('hands the unit to the module that is already running', () => {
      const { directive, moduleService } = createDirective();
      const sendUnit = jest.fn();
      directive.lastVeronaModuleId = 'editor-1';
      directive.postMessageTarget = window;

      const loading = directive.show('editor-1', 'editor', sendUnit);

      expect(loading).toBe(false);
      expect(sendUnit).toHaveBeenCalledTimes(1);
      expect(directive.postMessageTarget).toBe(window);
      expect(moduleService.getModuleHtml).not.toHaveBeenCalled();
    });

    it.each([
      ['another module is named', 'editor-1', window],
      ['the same module has not reported ready yet', 'editor-2', undefined]
    ])('loads the module when %s', async (_case: string, lastModuleId: string, target: Window | undefined) => {
      const { directive, moduleService } = createDirective();
      const sendUnit = jest.fn();
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      directive.iFrameElement = iframe;
      directive.lastVeronaModuleId = lastModuleId;
      directive.postMessageTarget = target;
      const module = createModule('editor-2', 'editor');
      provideModule(moduleService, 'editor', module);
      moduleService.getModuleHtml = jest.fn().mockResolvedValue('<html lang=""></html>');

      const loading = directive.show('editor-2', 'editor', sendUnit);
      await Promise.resolve();

      expect(loading).toBe(true);
      expect(directive.postMessageTarget).toBeUndefined();
      expect(sendUnit).not.toHaveBeenCalled();
      expect(moduleService.getModuleHtml).toHaveBeenCalledWith(module);
      expect(iframe.srcdoc).toBe('<html lang=""></html>');

      document.body.removeChild(iframe);
    });
  });

  describe('acceptMessageFromModule', () => {
    const frameOf = (contentWindow: Window) => ({ contentWindow } as unknown as HTMLIFrameElement);

    it('accepts a message of the module in its frame and answers to that frame from then on', () => {
      const { directive } = createDirective();
      directive.iFrameElement = frameOf(window);

      expect(directive.accept(createMessageEvent({ type: 'voeReadyNotification' }, window))).toBe(true);
      expect(directive.postMessageTarget).toBe(window);
    });

    it('ignores a message from another window', () => {
      const { directive } = createDirective();
      directive.iFrameElement = frameOf(window);
      const otherWindow = {} as Window;

      expect(directive.accept(createMessageEvent({ type: 'voeReadyNotification' }, otherWindow))).toBe(false);
      expect(directive.postMessageTarget).toBeUndefined();
    });

    it.each([undefined, null])('ignores a message whose type is %s', (type: undefined | null) => {
      const { directive } = createDirective();
      directive.iFrameElement = frameOf(window);

      expect(directive.accept(createMessageEvent({ type }, window))).toBe(false);
      expect(directive.postMessageTarget).toBeUndefined();
    });
  });
});
