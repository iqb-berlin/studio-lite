import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { BackendService } from '../../services/backend.service';
import { UnitExportConfigComponent } from './unit-export-config.component';

describe('UnitExportConfigComponent', () => {
  let component: UnitExportConfigComponent;
  let fixture: ComponentFixture<UnitExportConfigComponent>;
  let backendService: jest.Mocked<Pick<BackendService, 'getUnitExportConfig' | 'setUnitExportConfig'>>;
  let snackBar: jest.Mocked<Pick<MatSnackBar, 'open'>>;

  beforeEach(async () => {
    backendService = {
      getUnitExportConfig: jest.fn(),
      setUnitExportConfig: jest.fn()
    };
    snackBar = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ReactiveFormsModule
      ],
      providers: [
        { provide: BackendService, useValue: backendService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => (
      Array.isArray(key) ? key.join(',') : key
    ));

    backendService.getUnitExportConfig.mockReturnValue(of({
      unitXsdUrl: '',
      bookletXsdUrl: '',
      testTakersXsdUrl: ''
    }));

    fixture = TestBed.createComponent(UnitExportConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates form fields and marks dataChanged on value change', () => {
    backendService.getUnitExportConfig.mockReturnValue(of({
      unitXsdUrl: 'u.xsd',
      bookletXsdUrl: 'b.xsd',
      testTakersXsdUrl: 't.xsd'
    }));

    component.updateFormFields();

    expect(component.configForm.get('unitXsdUrl')?.value).toBe('u.xsd');
    expect(component.configForm.get('bookletXsdUrl')?.value).toBe('b.xsd');
    expect(component.configForm.get('testTakersXsdUrl')?.value).toBe('t.xsd');
    expect(component.dataChanged).toBe(false);

    component.configForm.get('unitXsdUrl')?.setValue('u2.xsd');
    expect(component.dataChanged).toBe(true);
  });

  it('saves data and resets dataChanged on success', () => {
    backendService.setUnitExportConfig.mockReturnValue(of(true));
    component.dataChanged = true;
    component.configForm.setValue({
      unitXsdUrl: 'u.xsd',
      bookletXsdUrl: 'b.xsd',
      testTakersXsdUrl: 't.xsd'
    });

    component.saveData();

    expect(backendService.setUnitExportConfig).toHaveBeenCalledWith({
      unitXsdUrl: 'u.xsd',
      bookletXsdUrl: 'b.xsd',
      testTakersXsdUrl: 't.xsd'
    });
    expect(snackBar.open).toHaveBeenCalledWith(
      'unit-export-config.params-saved',
      '',
      { duration: 3000 }
    );
    expect(component.dataChanged).toBe(false);
  });

  it('shows error when save fails', () => {
    backendService.setUnitExportConfig.mockReturnValue(of(false));
    component.configForm.setValue({
      unitXsdUrl: 'u.xsd',
      bookletXsdUrl: 'b.xsd',
      testTakersXsdUrl: 't.xsd'
    });

    component.saveData();

    expect(snackBar.open).toHaveBeenCalledWith(
      'unit-export-config.params-not-saved',
      'error',
      { duration: 3000 }
    );
  });
});
