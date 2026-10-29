import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, BehaviorSubject, NEVER } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { UnitEditorComponent } from './unit-editor.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { UnitStoresService } from '../../services/unit-stores.service';
import { ModuleService } from '../../../../services/module.service';
import { AppService } from '../../../../services/app.service';
import { UnitDefinitionStore } from '../../classes/unit-definition-store';

describe('UnitEditorComponent', () => {
  let component: UnitEditorComponent;
  let fixture: ComponentFixture<UnitEditorComponent>;

  let backendServiceMock: jest.Mocked<WorkspaceBackendService>;
  let workspaceServiceMock: WorkspaceService;
  let unitStoresMock: { definitionStore: jest.Mock; metadataStore: jest.Mock; loadDefinitionStore: jest.Mock };
  let moduleServiceMock: ModuleService;
  let appServiceMock: AppService;
  let translateServiceMock: TranslateService;

  beforeEach(async () => {
    backendServiceMock = {
      getDirectDownloadLink: jest.fn().mockReturnValue('link')
    } as unknown as jest.Mocked<WorkspaceBackendService>;

    workspaceServiceMock = {
      selectedWorkspaceId: 1,
      userAccessLevel: 0,
      selectedUnit$: new BehaviorSubject<number>(1)
    } as unknown as WorkspaceService;

    unitStoresMock = {
      definitionStore: jest.fn().mockReturnValue({
        setData: jest.fn()
      } as unknown as UnitDefinitionStore),
      metadataStore: jest.fn(),
      loadDefinitionStore: jest.fn()
    };

    moduleServiceMock = {
      players: {},
      editors: {},
      schemers: {},
      loadList: jest.fn().mockResolvedValue(undefined)
    } as unknown as ModuleService;

    appServiceMock = {
      postMessage$: of()
    } as unknown as AppService;

    translateServiceMock = {
      instant: jest.fn().mockReturnValue('')
    } as unknown as TranslateService;

    await TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: WorkspaceBackendService,
          useValue: backendServiceMock
        },
        {
          provide: WorkspaceService,
          useValue: workspaceServiceMock
        },
        {
          provide: UnitStoresService,
          useValue: unitStoresMock
        },
        {
          provide: ModuleService,
          useValue: moduleServiceMock
        },
        {
          provide: AppService,
          useValue: appServiceMock
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(UnitEditorComponent, {
        set: { template: '<iframe #hostingIframe></iframe>' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UnitEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should handle data transfer messages for the current session', () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    component.iFrameElement = frame;
    component.sessionId = 's1';

    const store = {
      setData: jest.fn()
    } as unknown as UnitDefinitionStore;
    unitStoresMock.definitionStore.mockReturnValue(store);

    const message = new MessageEvent('message', {
      data: {
        type: 'vo.FromAuthoringModule.DataTransfer',
        sessionId: 's1',
        variables: { v: 1 },
        unitDefinition: '<xml />'
      },
      source: frame.contentWindow as Window
    });

    component.handleIncomingMessage(message);

    expect(store.setData).toHaveBeenCalledWith({ v: 1 }, '<xml />');
  });

  it('should ignore messages from other sources', () => {
    const frame = document.createElement('iframe');
    const otherFrame = document.createElement('iframe');
    document.body.appendChild(frame);
    document.body.appendChild(otherFrame);
    component.iFrameElement = frame;
    component.sessionId = 's1';

    const store = {
      setData: jest.fn()
    } as unknown as UnitDefinitionStore;
    unitStoresMock.definitionStore.mockReturnValue(store);

    const message = new MessageEvent('message', {
      data: {
        type: 'vo.FromAuthoringModule.DataTransfer',
        sessionId: 's1',
        variables: { v: 1 },
        unitDefinition: '<xml />'
      },
      source: otherFrame.contentWindow as Window
    });

    component.handleIncomingMessage(message);

    expect(store.setData).not.toHaveBeenCalled();
  });

  // The module being replaced keeps its window: srcdoc navigation leaves contentWindow untouched, so
  // the source check passes for a message the outgoing editor sends while the next one is being
  // fetched. The session id is what rejects it, and a rebuild empties it.
  it('should ignore a definition change from the module being replaced', () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    component.iFrameElement = frame;
    component.sessionId = '';

    const store = {
      setData: jest.fn()
    } as unknown as UnitDefinitionStore;
    unitStoresMock.definitionStore.mockReturnValue(store);

    const message = new MessageEvent('message', {
      data: {
        type: 'voeDefinitionChangedNotification',
        sessionId: 'session-of-the-old-module',
        variables: { v: 1 },
        unitDefinition: '<xml />'
      },
      source: frame.contentWindow as Window
    });

    component.handleIncomingMessage(message);

    expect(store.setData).not.toHaveBeenCalled();
  });

  // Editor spec 4.6 reports the format of the definition beside it (#1368).
  describe('unitDefinitionType in a definition change', () => {
    const notify = (extra: Record<string, unknown>) => {
      const frame = document.createElement('iframe');
      document.body.appendChild(frame);
      component.iFrameElement = frame;
      component.sessionId = 's1';
      component.editorApiVersion = 4;
      const store = { setData: jest.fn() } as unknown as UnitDefinitionStore;
      unitStoresMock.definitionStore.mockReturnValue(store);
      component.handleIncomingMessage(new MessageEvent('message', {
        data: {
          type: 'voeDefinitionChangedNotification',
          sessionId: 's1',
          variables: { v: 1 },
          unitDefinition: '<xml />',
          ...extra
        },
        source: frame.contentWindow as Window
      }));
      return store;
    };

    it('should hand the reported type to the store', () => {
      const store = notify({ unitDefinitionType: 'aspect-unit-definition@4.12.0' });

      expect(store.setData).toHaveBeenCalledWith({ v: 1 }, '<xml />', 'aspect-unit-definition@4.12.0');
    });

    it('should hand on no type when the editor reports none', () => {
      const store = notify({});

      expect(store.setData).toHaveBeenCalledWith({ v: 1 }, '<xml />', undefined);
    });

    it('should ignore a type that is not a string', () => {
      const store = notify({ unitDefinitionType: { name: 'aspect' } });

      expect(store.setData).toHaveBeenCalledWith({ v: 1 }, '<xml />', undefined);
    });
  });

  // Editor spec 4.0 dropped definitionReportPolicy, and EditorConfig is additionalProperties: false
  // from then on. Editors below that spec version default to 'on-demand' and would wait for a
  // voeGetDefinitionRequest that this app never sends, so they keep getting the property.
  describe('postStore', () => {
    const store = { getData: () => ({ definition: 'def' }) } as unknown as UnitDefinitionStore;

    const editorConfigOf = (target: { postMessage: jest.Mock }) => target.postMessage.mock
      .calls[0][0].editorConfig;

    it('should send definitionReportPolicy to editors below spec version 4', () => {
      const target = { postMessage: jest.fn() };
      component.postMessageTarget = target as never;
      component.editorApiVersion = 3;

      component.postStore(store);

      expect(editorConfigOf(target)).toHaveProperty('definitionReportPolicy', 'eager');
    });

    it('should omit definitionReportPolicy from spec version 4 on', () => {
      const target = { postMessage: jest.fn() };
      component.postMessageTarget = target as never;
      component.editorApiVersion = 4;

      component.postStore(store);

      expect(editorConfigOf(target)).not.toHaveProperty('definitionReportPolicy');
    });

    it('should keep definitionReportPolicy when the version could not be detected', () => {
      const target = { postMessage: jest.fn() };
      component.postMessageTarget = target as never;
      // handleIncomingMessage falls back to 2 for an unreadable version -- the safe direction, and the
      // lowest value that still reaches this branch (1 takes the legacy DataTransfer path instead).
      component.editorApiVersion = 2;

      component.postStore(store);

      expect(editorConfigOf(target)).toHaveProperty('definitionReportPolicy', 'eager');
    });

    it('should send the definition type at the top level when it is known', () => {
      const target = { postMessage: jest.fn() };
      component.postMessageTarget = target as never;
      component.editorApiVersion = 4;

      component.postStore({
        getData: () => ({ definition: 'def', definitionType: 'aspect-unit-definition@4.12.0' })
      } as unknown as UnitDefinitionStore);

      const message = target.postMessage.mock.calls[0][0];
      expect(message.unitDefinitionType).toBe('aspect-unit-definition@4.12.0');
      expect(message.editorConfig).not.toHaveProperty('unitDefinitionType');
    });

    it('should send no definition type when none is known', () => {
      const target = { postMessage: jest.fn() };
      component.postMessageTarget = target as never;
      component.editorApiVersion = 4;

      component.postStore(store);

      expect(target.postMessage.mock.calls[0][0]).not.toHaveProperty('unitDefinitionType');
    });

    it.each([
      [1, 'vo.ToAuthoringModule.DataTransfer'],
      [4, 'voeStartCommand']
    ])('should start an editor of version %s on a unit without definition with an empty one', (version, type) => {
      const target = { postMessage: jest.fn() };
      component.postMessageTarget = target as never;
      component.editorApiVersion = version;

      component.postStore({ getData: () => ({}) } as unknown as UnitDefinitionStore);

      expect(target.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type, unitDefinition: '' }), '*');
    });
  });

  describe('the conversation with the editor', () => {
    let editorWindow: Window;
    let toEditor: jest.SpyInstance;
    let store: UnitDefinitionStore;

    const fromEditor = (data: object) => component
      .handleIncomingMessage(new MessageEvent('message', { data, source: editorWindow }));

    beforeEach(() => {
      const frame = document.createElement('iframe');
      document.body.appendChild(frame);
      component.iFrameElement = frame;
      editorWindow = frame.contentWindow as Window;
      toEditor = jest.spyOn(editorWindow, 'postMessage').mockImplementation();
      store = { setData: jest.fn(), getData: () => ({ definition: 'def' }) } as unknown as UnitDefinitionStore;
      unitStoresMock.definitionStore.mockReturnValue(store);
      unitStoresMock.loadDefinitionStore.mockReturnValue(of(store));
    });

    // the version the editor reports decides how it is talked to
    it.each([
      [
        'spec 4.0 in its metadata',
        { type: 'voeReadyNotification', metadata: { specVersion: '4.0' } },
        { type: 'voeStartCommand', editorConfig: expect.not.objectContaining({ definitionReportPolicy: 'eager' }) }
      ],
      [
        'API 1.1',
        { type: 'voeReadyNotification', apiVersion: '1.1.0' },
        { type: 'voeStartCommand', editorConfig: expect.objectContaining({ definitionReportPolicy: 'eager' }) }
      ],
      [
        'the ready notification of Verona 1',
        { type: 'vo.FromAuthoringModule.ReadyNotification' },
        { type: 'vo.ToAuthoringModule.DataTransfer' }
      ]
    ])('should start an editor that reports %s in its protocol', (_, ready, start) => {
      fromEditor(ready);

      expect(unitStoresMock.loadDefinitionStore).toHaveBeenCalledWith(1, 1);
      expect(toEditor).toHaveBeenCalledWith(
        expect.objectContaining({ ...start, sessionId: component.sessionId, unitDefinition: 'def' }),
        '*'
      );
      expect(component.sessionId).not.toBe('');
    });

    // the definition stays as it is; saved, it would otherwise be lost
    it('should keep the definition when a change notification carries none', () => {
      component.sessionId = 's1';
      component.editorApiVersion = 4;

      fromEditor({ type: 'voeDefinitionChangedNotification', sessionId: 's1', variables: [] });

      expect(store.setData).not.toHaveBeenCalled();
    });

    it('should hand the shared parameters an editor reports to the next start', () => {
      component.sessionId = 's1';
      component.editorApiVersion = 4;
      fromEditor({
        type: 'voeDefinitionChangedNotification', sessionId: 's1', sharedParameters: [{ key: 'k', value: 'v' }]
      });

      component.postStore(store);

      expect(toEditor.mock.calls[0][0].editorConfig.sharedParameters).toEqual([{ key: 'k', value: 'v' }]);
    });

    it('should ask a Verona 1 editor for the definition it reports as changed', () => {
      component.sessionId = 's1';
      component.editorApiVersion = 1;

      fromEditor({ type: 'vo.FromAuthoringModule.ChangedNotification', sessionId: 's1' });

      expect(toEditor).toHaveBeenCalledWith({ type: 'vo.ToAuthoringModule.DataRequest', sessionId: 's1' }, '*');
    });

    it('should ignore a definition a Verona 1 editor of another session transfers', () => {
      component.sessionId = 's1';

      fromEditor({
        type: 'vo.FromAuthoringModule.DataTransfer', sessionId: 'old', variables: [], unitDefinition: '<xml />'
      });

      expect(store.setData).not.toHaveBeenCalled();
    });
  });

  it('should load the unit chosen while the one before is still loading', () => {
    workspaceServiceMock.loadUnitProperties = jest.fn().mockReturnValue(NEVER);
    component.unitLoaded.next(false);

    workspaceServiceMock.selectedUnit$.next(7);

    expect(workspaceServiceMock.loadUnitProperties).toHaveBeenCalledTimes(1);
  });
});
