import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject } from 'rxjs';
import { UnitPrintPlayerComponent } from './unit-print-player.component';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { ModuleService } from '../../../shared/services/module.service';
import { AppService } from '../../../../services/app.service';
import { environment } from '../../../../../environments/environment';

describe('UnitPrintPlayerComponent', () => {
  let component: UnitPrintPlayerComponent;
  let fixture: ComponentFixture<UnitPrintPlayerComponent>;
  let mockBackendService: {
    getUnitDefinition: jest.Mock;
    getDirectDownloadLink: jest.Mock;
  };
  let mockWorkspaceService: Record<string, unknown>;
  let mockModuleService: Record<string, unknown>;
  let mockAppService: Record<string, unknown>;
  let mockTranslateService: Record<string, unknown>;
  let mockSnackBar: Record<string, unknown>;

  beforeEach(async () => {
    mockBackendService = {
      getUnitDefinition: jest.fn(),
      getDirectDownloadLink: jest.fn().mockReturnValue('http://test-download-link')
    };

    mockWorkspaceService = {};
    mockModuleService = {
      players: {
        'test-player@1.0.0': {
          id: 'test-player@1.0.0'
        }
      },
      getModuleHtml: jest.fn().mockReturnValue(of('<html lang=""></html>'))
    };
    mockAppService = {
      postMessage$: new Subject()
    };
    mockTranslateService = {
      instant: jest.fn((key: string) => key)
    };
    mockSnackBar = {
      open: jest.fn()
    };

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    beforeEach(() => {
      // Mock the ViewChild hostingIframe
      Object.defineProperty(component, 'hostingIframe', {
        value: {
          nativeElement: document.createElement('iframe')
        },
        writable: true
      });
    });

    it('should set hosting iframe', () => {
      const setHostingIframeSpy = jest.spyOn(component as never, 'setHostingIframe');

      component.ngAfterViewInit();

      expect(setHostingIframeSpy).toHaveBeenCalled();
    });

    it('should subscribe for post messages', () => {
      const subscribeSpy = jest.spyOn(component as never, 'subscribeForPostMessages');

      component.ngAfterViewInit();

      expect(subscribeSpy).toHaveBeenCalled();
    });

    it('should build verona module with playerId', () => {
      const buildSpy = jest.spyOn(component as never, 'buildVeronaModule');
      component.playerId = 'test-player@1.0.0';

      component.ngAfterViewInit();

      expect(buildSpy).toHaveBeenCalledWith('test-player@1.0.0', 'player');
    });
  });

  describe('sendChangeData', () => {
    it('should fetch unit definition and post store', fakeAsync(() => {
      const mockDefinition = { definition: 'test-definition' };
      mockBackendService.getUnitDefinition.mockReturnValue(of(mockDefinition));
      const postStoreSpy = jest.spyOn(component, 'postStore');

      component.workspaceId = 1;
      component.unitId = 10;
      component.sendChangeData();

      tick();

      expect(mockBackendService.getUnitDefinition).toHaveBeenCalledWith(1, 10);
      expect(postStoreSpy).toHaveBeenCalledWith('test-definition');
    }));

    it('should handle empty definition', fakeAsync(() => {
      const mockDefinition = { definition: null };
      mockBackendService.getUnitDefinition.mockReturnValue(of(mockDefinition));
      const postStoreSpy = jest.spyOn(component, 'postStore');

      component.workspaceId = 1;
      component.unitId = 10;
      component.sendChangeData();

      tick();

      expect(postStoreSpy).toHaveBeenCalledWith('');
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
      const postMessageSpy = jest.fn();

      component.postStore('test-definition');

      expect(postMessageSpy).not.toHaveBeenCalled();
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

    it('should emit unitLoaded after posting', () => {
      const mockWindow = { postMessage: jest.fn() };
      component.postMessageTarget = mockWindow as never;
      component.playerApiVersion = 3;
      const nextSpy = jest.spyOn(component.unitLoaded, 'next');

      component.postStore('test-definition');

      expect(nextSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('gotoUnit', () => {
    it('should be defined as empty method', () => {
      expect(() => component.gotoUnit('target')).not.toThrow();
    });
  });

  describe('onSelectedUnitChange', () => {
    it('should be defined as empty method', () => {
      expect(() => component.onSelectedUnitChange()).not.toThrow();
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

      // eslint-disable-next-line @typescript-eslint/dot-notation
      const calculateMethod = (component as unknown as Record<string, () => void>)['calculateIFrameHeight'];
      calculateMethod.call(component);

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

      // eslint-disable-next-line @typescript-eslint/dot-notation
      const calculateMethod = (component as unknown as Record<string, () => void>)['calculateIFrameHeight'];
      calculateMethod.call(component);

      expect(component.iFrameHeight).toBe(600);
      expect(nextSpy).toHaveBeenCalledWith(600);
    });

    it('should not emit if height is not available', () => {
      component.iFrameElement = undefined;
      const nextSpy = jest.spyOn(component.iFrameHeightChange, 'next');

      // eslint-disable-next-line @typescript-eslint/dot-notation
      const calculateMethod = (component as unknown as Record<string, () => void>)['calculateIFrameHeight'];
      calculateMethod.call(component);

      expect(nextSpy).not.toHaveBeenCalled();
    });
  });

  describe('input properties', () => {
    it('should accept unitId', () => {
      component.unitId = 42;
      expect(component.unitId).toBe(42);
    });

    it('should accept workspaceId', () => {
      component.workspaceId = 5;
      expect(component.workspaceId).toBe(5);
    });

    it('should accept iFrameHeight', () => {
      component.iFrameHeight = 800;
      expect(component.iFrameHeight).toBe(800);
    });

    it('should accept playerId', () => {
      component.playerId = 'test-player';
      expect(component.playerId).toBe('test-player');
    });

    it('should accept printElementIds', () => {
      component.printElementIds = true;
      expect(component.printElementIds).toBe(true);
    });

    it('should accept printPreviewAutoHeight', () => {
      component.printPreviewAutoHeight = true;
      expect(component.printPreviewAutoHeight).toBe(true);
    });
  });

  describe('output properties', () => {
    it('should have iFrameHeightChange Subject', () => {
      expect(component.iFrameHeightChange).toBeDefined();
    });
  });
});
