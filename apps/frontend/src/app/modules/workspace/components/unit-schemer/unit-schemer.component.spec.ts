import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { createMock } from '@golevelup/ts-jest';
import { NEVER, of } from 'rxjs';
import { UnitDefinitionDto, UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { environment } from '../../../../../environments/environment';
import { UnitSchemerComponent } from './unit-schemer.component';
import { UnitDefinitionStore } from '../../classes/unit-definition-store';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';
import { UnitStoresService } from '../../services/unit-stores.service';
import { WorkspaceService } from '../../services/workspace.service';

describe('UnitSchemerComponent', () => {
  let component: UnitSchemerComponent;
  let fixture: ComponentFixture<UnitSchemerComponent>;
  let unitStores: UnitStoresService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitSchemerComponent);
    component = fixture.componentInstance;
    unitStores = TestBed.inject(UnitStoresService);
    fixture.detectChanges();
  });

  // The schemer reads only the VariableInfo 1.x spelling; the list may be stored or reported by
  // the editor in 2.x (#1708).
  describe('postStore', () => {
    const inV2 = {
      id: 'geo1',
      type: 'STRING',
      format: 'GGB_FILE',
      multiple: false,
      nullable: false,
      values: [],
      valuePositionLabels: []
    };
    const inV1 = {
      ...inV2, type: 'string', format: 'ggb-file', page: ''
    };
    let postMessage: jest.Mock;

    const sentVariables = () => postMessage.mock.calls[0][0].variables;

    beforeEach(() => {
      postMessage = jest.fn();
      component.postMessageTarget = { postMessage } as unknown as Window;
      jest.spyOn(component.backendService, 'getDirectDownloadLink').mockReturnValue('');
    });

    it('sends the editor\'s unsaved list in the 1.x spelling', () => {
      const definitionStore = createMock<UnitDefinitionStore>();
      definitionStore.getData.mockReturnValue({ variables: [inV2] } as unknown as UnitDefinitionDto);
      jest.spyOn(unitStores, 'definitionStore').mockReturnValue(definitionStore);
      const schemeStore = createMock<UnitSchemeStore>();
      schemeStore.getData.mockReturnValue({ scheme: '', variables: [] } as unknown as UnitSchemeDto);

      component.postStore(schemeStore);

      expect(sentVariables()).toEqual([inV1]);
    });

    it('sends the scheme\'s list in the 1.x spelling when no definition is loaded', () => {
      jest.spyOn(unitStores, 'definitionStore').mockReturnValue(undefined);
      const schemeStore = createMock<UnitSchemeStore>();
      schemeStore.getData.mockReturnValue({ scheme: '', variables: [inV2] } as unknown as UnitSchemeDto);

      component.postStore(schemeStore);

      expect(sentVariables()).toEqual([inV1]);
    });

    it('sends an empty list when there is none', () => {
      jest.spyOn(unitStores, 'definitionStore').mockReturnValue(undefined);
      const schemeStore = createMock<UnitSchemeStore>();
      schemeStore.getData.mockReturnValue({ scheme: '' } as unknown as UnitSchemeDto);

      component.postStore(schemeStore);

      expect(sentVariables()).toEqual([]);
    });
  });

  describe('the conversation with the schemer', () => {
    let schemerWindow: Window;
    let toSchemer: jest.SpyInstance;

    const fromSchemer = (data: object, source: Window = schemerWindow) => component
      .handleIncomingMessage(new MessageEvent('message', { data, source }));

    beforeEach(() => {
      schemerWindow = fixture.nativeElement.querySelector('iframe').contentWindow;
      toSchemer = jest.spyOn(schemerWindow, 'postMessage').mockImplementation();
      jest.spyOn(TestBed.inject(WorkspaceService).selectedUnit$, 'getValue').mockReturnValue(5);
      jest.spyOn(component.backendService, 'getDirectDownloadLink').mockReturnValue('');
    });

    const loadSchemeStoreWith = (store: UnitSchemeStore | undefined) => jest
      .spyOn(unitStores, 'loadSchemeStore').mockReturnValue(of(store));

    it('starts a schemer that is ready with the scheme of the unit, in a session of its own', () => {
      const scheme = '{"variableCodings":[]}';
      const load = loadSchemeStoreWith(new UnitSchemeStore(5, { scheme, schemeType: 'iqb@3.4' }));

      fromSchemer({ type: 'vosReadyNotification' });

      expect(load).toHaveBeenCalledWith(component.workspaceService.selectedWorkspaceId, 5);
      expect(component.sessionId).not.toBe('');
      expect(toSchemer).toHaveBeenCalledWith(expect.objectContaining({
        type: 'vosStartCommand',
        sessionId: component.sessionId,
        codingScheme: scheme,
        codingSchemeType: 'iqb@3.4'
      }), '*');
    });

    // the schemer stayed with the scheme of the unit before, and its reports still counted (#2085)
    it('empties the frame and says so when the scheme of the unit cannot be loaded', () => {
      loadSchemeStoreWith(undefined);
      const frame: HTMLIFrameElement = fixture.nativeElement.querySelector('iframe');
      frame.srcdoc = 'the schemer with the scheme of the unit before';

      fromSchemer({ type: 'vosReadyNotification' });

      expect(toSchemer).not.toHaveBeenCalled();
      expect(component.message).toBe('workspace.coding-scheme-not-loaded');
      expect(frame.srcdoc).toBe('');
      expect(component.sessionId).toBe('');
    });

    // the scheme store takes only a scheme the schemer of this session reports from its frame
    it.each([
      ['a scheme of its session', true, { sessionId: 's1', codingScheme: 'new' }, true],
      ['a report without a scheme', false, { sessionId: 's1' }, true],
      ['a scheme of another session', false, { sessionId: 'old', codingScheme: 'new' }, true],
      ['a scheme from another window', false, { sessionId: 's1', codingScheme: 'new' }, false]
    ])('%s is taken: %s', (_, taken, report, fromItsFrame) => {
      const schemeStore = createMock<UnitSchemeStore>();
      jest.spyOn(unitStores, 'schemeStore').mockReturnValue(schemeStore);
      component.sessionId = 's1';

      fromSchemer(
        { type: 'vosSchemeChangedNotification', codingSchemeType: 'iqb@3.4', ...report },
        fromItsFrame ? schemerWindow : window
      );

      expect(schemeStore.setData.mock.calls).toEqual(taken ? [['new', 'iqb@3.4']] : []);
    });

    it('hands the shared parameters a schemer reports to the next start', () => {
      component.sessionId = 's1';
      component.postMessageTarget = schemerWindow;
      fromSchemer({
        type: 'vosSchemeChangedNotification', sessionId: 's1', sharedParameters: [{ key: 'k', value: 'v' }]
      });

      component.postStore(new UnitSchemeStore(5, { scheme: '', schemeType: '' }));

      expect(toSchemer.mock.calls[0][0].schemerConfig.sharedParameters).toEqual([{ key: 'k', value: 'v' }]);
    });
  });

  it('loads the unit chosen while the one before is still loading', () => {
    const workspaceService = TestBed.inject(WorkspaceService);
    const load = jest.spyOn(workspaceService, 'loadUnitProperties').mockReturnValue(NEVER);
    component.unitLoaded.next(false);

    workspaceService.selectedUnit$.next(7);

    expect(load).toHaveBeenCalledTimes(1);
  });
});
