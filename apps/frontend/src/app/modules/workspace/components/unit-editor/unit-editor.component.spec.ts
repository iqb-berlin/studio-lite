import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { UnitEditorComponent } from './unit-editor.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { ModuleService } from '../../../../services/module.service';
import { AppService } from '../../../../services/app.service';
import { UnitDefinitionStore } from '../../classes/unit-definition-store';

describe('UnitEditorComponent', () => {
  let component: UnitEditorComponent;
  let fixture: ComponentFixture<UnitEditorComponent>;

  let backendServiceMock: jest.Mocked<WorkspaceBackendService>;
  let workspaceServiceMock: WorkspaceService;
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
      selectedUnit$: new BehaviorSubject<number>(1),
      getUnitDefinitionStore: jest.fn().mockReturnValue({
        setData: jest.fn()
      } as unknown as UnitDefinitionStore)
    } as unknown as WorkspaceService;

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle data transfer messages for the current session', () => {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    component.iFrameElement = frame;
    component.sessionId = 's1';

    const store = {
      setData: jest.fn()
    } as unknown as UnitDefinitionStore;
    jest.spyOn(workspaceServiceMock, 'getUnitDefinitionStore').mockReturnValue(store);

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
    jest.spyOn(workspaceServiceMock, 'getUnitDefinitionStore').mockReturnValue(store);

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
  });
});
