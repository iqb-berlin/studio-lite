import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { saveAs } from 'file-saver-es';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitInViewDto } from '@studio-lite-lib/api-dto';
import { environment } from '../../../../../environments/environment';
import { UnitsComponent } from './units.component';
import { UnitsMenuComponent } from '../units-menu/units-menu.component';
import { BackendService } from '../../services/backend.service';
import { I18nService } from '../../../../services/i18n.service';

jest.mock('file-saver-es', () => ({ saveAs: jest.fn() }));

describe('UnitsComponent', () => {
  let component: UnitsComponent;
  let fixture: ComponentFixture<UnitsComponent>;
  let backendService: DeepMocked<BackendService>;

  @Component({ selector: 'studio-lite-units-menu', template: '', standalone: true })
  class MockUnitsMenuComponent {}

  beforeEach(async () => {
    backendService = createMock<BackendService>({
      getAllUnits: jest.fn().mockReturnValue(of([]))
    });

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        UnitsComponent
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: BackendService, useValue: backendService },
        {
          provide: I18nService,
          useValue: createMock<I18nService>({ fullLocale: 'en-US', fileDateFormat: 'yyyy-MM-dd' })
        }
      ]
    })
      .overrideComponent(UnitsComponent, {
        remove: { imports: [UnitsMenuComponent] },
        add: { imports: [MockUnitsMenuComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should download the units as CSV, with an empty cell for a value the server has not', () => {
    const OriginalBlob = window.Blob;
    const blob = jest.spyOn(window, 'Blob').mockImplementation((parts, options) => new OriginalBlob(parts, options));
    // As the server sends it: the dates as text, and a column never written as null.
    const unit: UnitInViewDto = JSON.parse(`{
      "key": "M1", "name": "Mathe, Teil 1", "groupName": null, "id": 4, "workspaceId": 2, "workspaceName": "WS",
      "lastChangedDefinition": "2026-10-01T10:00:00.000Z", "lastChangedDefinitionUser": "anna",
      "lastChangedMetadata": null, "lastChangedMetadataUser": null,
      "lastChangedScheme": "2026-10-02T10:00:00.000Z", "lastChangedSchemeUser": "bert"
    }`);
    backendService.getAllUnits.mockReturnValue(of([unit]));

    component.downloadUnits();
    const csv = String(blob.mock.calls[0][0]?.[0]);
    const file = blob.mock.results[0].value;
    blob.mockRestore();

    expect(saveAs).toHaveBeenCalledWith(file, expect.any(String));
    expect(csv.split('\r\n')).toEqual([
      'key,name,groupName,id,workspaceName,workspaceId,lastChangedDefinition,lastChangedMetadata,' +
        'lastChangedScheme,lastChangedDefinitionUser,lastChangedMetadataUser,lastChangedSchemeUser',
      '"M1","Mathe, Teil 1","",4,"WS",2,"2026-10-01T10:00:00.000Z","","2026-10-02T10:00:00.000Z","anna","","bert"'
    ]);
  });
});
