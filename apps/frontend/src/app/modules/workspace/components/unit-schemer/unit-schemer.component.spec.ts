import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { createMock } from '@golevelup/ts-jest';
import { UnitDefinitionDto, UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { environment } from '../../../../../environments/environment';
import { UnitSchemerComponent } from './unit-schemer.component';
import { UnitDefinitionStore } from '../../classes/unit-definition-store';
import { UnitSchemeStore } from '../../classes/unit-scheme-store';

describe('UnitSchemerComponent', () => {
  let component: UnitSchemerComponent;
  let fixture: ComponentFixture<UnitSchemerComponent>;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
      jest.spyOn(component.workspaceService, 'getUnitDefinitionStore').mockReturnValue(definitionStore);
      const schemeStore = createMock<UnitSchemeStore>();
      schemeStore.getData.mockReturnValue({ scheme: '', variables: [] } as unknown as UnitSchemeDto);

      component.postStore(schemeStore);

      expect(sentVariables()).toEqual([inV1]);
    });

    it('sends the scheme\'s list in the 1.x spelling when no definition is loaded', () => {
      jest.spyOn(component.workspaceService, 'getUnitDefinitionStore').mockReturnValue(undefined);
      const schemeStore = createMock<UnitSchemeStore>();
      schemeStore.getData.mockReturnValue({ scheme: '', variables: [inV2] } as unknown as UnitSchemeDto);

      component.postStore(schemeStore);

      expect(sentVariables()).toEqual([inV1]);
    });

    it('sends an empty list when there is none', () => {
      jest.spyOn(component.workspaceService, 'getUnitDefinitionStore').mockReturnValue(undefined);
      const schemeStore = createMock<UnitSchemeStore>();
      schemeStore.getData.mockReturnValue({ scheme: '' } as unknown as UnitSchemeDto);

      component.postStore(schemeStore);

      expect(sentVariables()).toEqual([]);
    });
  });
});
