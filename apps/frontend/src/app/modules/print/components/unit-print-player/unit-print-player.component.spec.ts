import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthDataDto } from '@studio-lite-lib/api-dto';
import { UnitPrintPlayerComponent } from './unit-print-player.component';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { ModuleService } from '../../../../services/module.service';
import { AppService } from '../../../../services/app.service';
import { BackendService } from '../../../../services/backend.service';
import { HeartbeatService } from '../../../../services/heartbeat.service';
import { environment } from '../../../../../environments/environment';

describe('UnitPrintPlayerComponent', () => {
  let component: UnitPrintPlayerComponent;
  let fixture: ComponentFixture<UnitPrintPlayerComponent>;
  let mockBackendService: DeepMocked<WorkspaceBackendService>;
  let mockWorkspaceService: DeepMocked<WorkspaceService>;
  let mockModuleService: DeepMocked<ModuleService>;
  let mockAppService: DeepMocked<AppService>;
  let mockTranslateService: DeepMocked<TranslateService>;
  let mockSnackBar: DeepMocked<MatSnackBar>;

  beforeEach(async () => {
    mockBackendService = createMock<WorkspaceBackendService>({
      getUnitDefinition: jest.fn(),
      getDirectDownloadLink: jest.fn().mockReturnValue('http://test-download-link')
    });

    mockWorkspaceService = createMock<WorkspaceService>({});
    mockModuleService = createMock<ModuleService>({
      getModuleHtml: jest.fn().mockReturnValue(of('<html lang=""></html>'))
    });
    mockModuleService.players = {
      'test-player@1.0.0': { key: 'test-player@1.0.0' } as never
    };
    mockAppService = createMock<AppService>({
      postMessage$: new Subject<MessageEvent>(),
      authData: { userId: 1 } as AuthDataDto,
      authDataChanged: new Subject<AuthDataDto>()
    });
    mockTranslateService = createMock<TranslateService>();
    mockTranslateService.instant = jest.fn()
      .mockImplementation((key: string | string[]) => (Array.isArray(key) ? key[0] : key));
    mockSnackBar = createMock<MatSnackBar>({
      open: jest.fn()
    });

    await TestBed.configureTestingModule({
      imports: [
        UnitPrintPlayerComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        {
          provide: WorkspaceBackendService,
          useValue: mockBackendService
        },
        {
          provide: WorkspaceService,
          useValue: mockWorkspaceService
        },
        {
          provide: ModuleService,
          useValue: mockModuleService
        },
        {
          provide: AppService,
          useValue: mockAppService
        },
        {
          provide: BackendService,
          useValue: { activity: jest.fn(), logout: jest.fn() }
        },
        {
          provide: HeartbeatService,
          useValue: { refreshActivityPulse: jest.fn() }
        },
        {
          provide: TranslateService,
          useValue: mockTranslateService
        },
        {
          provide: MatSnackBar,
          useValue: mockSnackBar
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPrintPlayerComponent);
    component = fixture.componentInstance;
  });

  describe('sendChangeData', () => {
    it('should pass the definition type on with the definition', fakeAsync(() => {
      mockBackendService.getUnitDefinition.mockReturnValue(of({
        definition: 'test-definition',
        definitionType: 'aspect-unit-definition@4.12.0'
      }));
      const postStoreSpy = jest.spyOn(component, 'postStore');

      component.workspaceId = 1;
      component.unitId = 10;
      component.sendChangeData();

      tick();

      expect(postStoreSpy).toHaveBeenCalledWith('test-definition', 'aspect-unit-definition@4.12.0');
    }));

    it('should handle empty definition', fakeAsync(() => {
      const mockDefinition = { definition: undefined };
      mockBackendService.getUnitDefinition.mockReturnValue(of(mockDefinition));
      const postStoreSpy = jest.spyOn(component, 'postStore');

      component.workspaceId = 1;
      component.unitId = 10;
      component.sendChangeData();

      tick();

      expect(postStoreSpy).toHaveBeenCalledWith('', undefined);
    }));

    it('should handle null unit definition', fakeAsync(() => {
      mockBackendService.getUnitDefinition.mockReturnValue(of(null));
      const postStoreSpy = jest.spyOn(component, 'postStore');

      component.workspaceId = 1;
      component.unitId = 10;
      component.sendChangeData();

      tick();

      expect(postStoreSpy).not.toHaveBeenCalled();
    }));
  });

  describe('postStore', () => {
    it('should return early if no postMessageTarget', () => {
      component.postMessageTarget = undefined;

      expect(() => component.postStore('test-definition')).not.toThrow();
    });

    it('should post message for API version 1', () => {
      const mockWindow = { postMessage: jest.fn() };
      component.postMessageTarget = mockWindow as never;
      component.playerApiVersion = 1;
      component.sessionId = 'test-session';

      component.postStore('test-definition');

      expect(mockWindow.postMessage).toHaveBeenCalledWith({
        type: 'vo.ToPlayer.DataTransfer',
        sessionId: 'test-session',
        unitDefinition: 'test-definition'
      }, '*');
    });

    it('should post message for API version >= 2 with printMode on', () => {
      const mockWindow = { postMessage: jest.fn() };
      component.postMessageTarget = mockWindow as never;
      component.playerApiVersion = 3;
      component.sessionId = 'test-session';
      component.printElementIds = false;

      component.postStore('test-definition');

      expect(mockWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'vopStartCommand',
          sessionId: 'test-session',
          unitDefinition: 'test-definition',
          playerConfig: expect.objectContaining({
            printMode: 'on'
          })
        }),
        '*'
      );
    });

    // Player spec 7.0 writes the values of its enumerations in capitals (#2064).
    it.each([
      [6, false, 'concat-scroll', 'on', 'none'],
      [7, false, 'CONCAT_SCROLL', 'ON', 'NONE'],
      [7, true, 'CONCAT_SCROLL', 'ON_WITH_IDS', 'NONE']
    ])('should print with a player of version %s (ids %s) in paging mode %s, print mode %s and progress %s',
      (version, printElementIds, pagingMode, printMode, progress) => {
        const mockWindow = { postMessage: jest.fn() };
        component.postMessageTarget = mockWindow as never;
        component.playerApiVersion = version;
        component.printElementIds = printElementIds;

        component.postStore('test-definition');

        const message = mockWindow.postMessage.mock.calls[0][0];
        expect(message.playerConfig).toEqual(expect.objectContaining({ pagingMode, printMode }));
        expect(message.unitState).toEqual(expect.objectContaining({
          presentationProgress: progress, responseProgress: progress
        }));
      });

    it('should send the definition type at the top level when it is known', () => {
      const mockWindow = { postMessage: jest.fn() };
      component.postMessageTarget = mockWindow as never;
      component.playerApiVersion = 6;

      component.postStore('test-definition', 'aspect-unit-definition@4.12.0');

      const message = mockWindow.postMessage.mock.calls[0][0];
      expect(message.unitDefinitionType).toBe('aspect-unit-definition@4.12.0');
      expect(message.playerConfig).not.toHaveProperty('unitDefinitionType');
    });

    it('should send no definition type when none is known', () => {
      const mockWindow = { postMessage: jest.fn() };
      component.postMessageTarget = mockWindow as never;
      component.playerApiVersion = 6;

      component.postStore('test-definition');

      expect(mockWindow.postMessage.mock.calls[0][0]).not.toHaveProperty('unitDefinitionType');
    });

    it('should post message with printMode on-with-ids when printElementIds is true', () => {
      const mockWindow = { postMessage: jest.fn() };
      component.postMessageTarget = mockWindow as never;
      component.playerApiVersion = 3;
      component.sessionId = 'test-session';
      component.printElementIds = true;

      component.postStore('test-definition');

      expect(mockWindow.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          playerConfig: expect.objectContaining({
            printMode: 'on-with-ids'
          })
        }),
        '*'
      );
    });

    // Player spec 5.0 dropped stateReportPolicy. Players below it fall back to 'none' when it is
    // missing -- the aspect 1.x line does -- and then report no state at all, so they keep getting it.
    const playerConfigOf = (mockWindow: { postMessage: jest.Mock }) => mockWindow.postMessage.mock
      .calls[0][0].playerConfig;

    it('should send stateReportPolicy to players below spec version 5', () => {
      const mockWindow = { postMessage: jest.fn() };
      component.postMessageTarget = mockWindow as never;
      component.playerApiVersion = 3;

      component.postStore('test-definition');

      expect(playerConfigOf(mockWindow)).toHaveProperty('stateReportPolicy', 'eager');
    });

    it('should omit stateReportPolicy from spec version 5 on', () => {
      const mockWindow = { postMessage: jest.fn() };
      component.postMessageTarget = mockWindow as never;
      component.playerApiVersion = 5;

      component.postStore('test-definition');

      expect(playerConfigOf(mockWindow)).not.toHaveProperty('stateReportPolicy');
    });

    it('should keep stateReportPolicy when the version could not be detected', () => {
      const mockWindow = { postMessage: jest.fn() };
      component.postMessageTarget = mockWindow as never;
      // detectApiVersion falls back to 2 for an unreadable version -- the safe direction.
      component.playerApiVersion = 2;

      component.postStore('test-definition');

      expect(playerConfigOf(mockWindow)).toHaveProperty('stateReportPolicy', 'eager');
    });
  });

  describe('calculateIFrameHeight', () => {
    it('should emit height change when iframe has content', () => {
      const mockIframe = {
        contentDocument: {
          body: { offsetHeight: 500 },
          documentElement: { offsetHeight: 500 }
        }
      };
      component.iFrameElement = mockIframe as never;
      const nextSpy = jest.spyOn(component.iFrameHeightChange, 'next');
      (component as never as { calculateIFrameHeight: () => void }).calculateIFrameHeight();

      expect(component.iFrameHeight).toBe(500);
      expect(nextSpy).toHaveBeenCalledWith(500);
    });

    it('should use contentWindow.document if contentDocument is null', () => {
      const mockIframe = {
        contentDocument: null,
        contentWindow: {
          document: {
            body: { offsetHeight: 600 },
            documentElement: { offsetHeight: 600 }
          }
        }
      };
      component.iFrameElement = mockIframe as never;
      const nextSpy = jest.spyOn(component.iFrameHeightChange, 'next');
      (component as never as { calculateIFrameHeight: () => void }).calculateIFrameHeight();

      expect(component.iFrameHeight).toBe(600);
      expect(nextSpy).toHaveBeenCalledWith(600);
    });

    it('should not emit if height is not available', () => {
      component.iFrameElement = undefined;
      const nextSpy = jest.spyOn(component.iFrameHeightChange, 'next');
      (component as never as { calculateIFrameHeight: () => void }).calculateIFrameHeight();

      expect(nextSpy).not.toHaveBeenCalled();
    });
  });

  describe('automatic height', () => {
    let iframe: HTMLIFrameElement;
    let heights: number[];

    const loadUnit = (printPreviewAutoHeight: boolean, bodyHeight = 700, documentHeight = 0): void => {
      iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      component.hostingIframe = new ElementRef(iframe);
      component.playerId = 'test-player@1.0.0';
      component.printPreviewAutoHeight = printPreviewAutoHeight;
      heights = [];
      component.iFrameHeightChange.subscribe(height => heights.push(height));
      component.ngAfterViewInit();
      Object.defineProperty(iframe.contentDocument?.body, 'offsetHeight', { value: bodyHeight });
      Object.defineProperty(iframe.contentDocument?.documentElement, 'offsetHeight', { value: documentHeight });
      iframe.dispatchEvent(new Event('load'));
    };

    afterEach(() => iframe.remove());

    it('should report the height of the unit once it has loaded', fakeAsync(() => {
      loadUnit(true);

      tick(1000);

      expect(heights).toEqual([700]);
    }));

    it('should fall back to the height of the document element when the body has none', fakeAsync(() => {
      loadUnit(true, 0, 800);

      tick(1000);

      expect(heights).toEqual([800]);
    }));

    it('should report no height without automatic height', fakeAsync(() => {
      loadUnit(false);

      tick(1000);

      expect(heights).toEqual([]);
    }));
  });
});
