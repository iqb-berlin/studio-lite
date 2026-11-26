import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject } from 'rxjs';
import { UnitValidationDto } from '@studio-lite-lib/api-dto';
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';
import { UnitValidationConfigComponent } from './unit-validation-config.component';

describe('UnitValidationConfigComponent', () => {
  let fixture: ComponentFixture<UnitValidationConfigComponent>;
  let readBackendService: jest.Mocked<Pick<ReadBackendService, 'getUnitValidation'>>;
  let writeBackendService: jest.Mocked<Pick<WriteBackendService, 'setUnitValidation'>>;
  const stored: UnitValidationDto = { sizeLevels: { mediumFromKb: 100, largeFromKb: 500, veryLargeFromKb: 2000 } };

  const create = (validation: UnitValidationDto | null): HTMLElement => {
    readBackendService.getUnitValidation.mockReturnValue(of(validation));
    fixture = TestBed.createComponent(UnitValidationConfigComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  };

  const input = (element: HTMLElement, bound: string): HTMLInputElement | null => element
    .querySelector<HTMLInputElement>(`[data-cy="admin-unit-validation-${bound}"]`);

  const type = (element: HTMLElement, bound: string, value: string): void => {
    const field = input(element, bound) as HTMLInputElement;
    field.value = value;
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  const saveButton = (element: HTMLElement): HTMLButtonElement | null => element
    .querySelector<HTMLButtonElement>('[data-cy="admin-unit-validation-save-button"]');

  beforeEach(async () => {
    readBackendService = { getUnitValidation: jest.fn() };
    writeBackendService = { setUnitValidation: jest.fn().mockReturnValue(of(true)) };

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ReadBackendService, useValue: readBackendService },
        { provide: WriteBackendService, useValue: writeBackendService },
        { provide: MatSnackBar, useValue: { open: jest.fn() } }
      ]
    }).compileComponents();
  });

  it('shows the stored size levels and saves them once changed (#2229)', () => {
    const element = create(stored);
    expect(input(element, 'large-from')?.value).toBe('500');

    type(element, 'medium-from', '150');
    saveButton(element)?.click();

    expect(writeBackendService.setUnitValidation)
      .toHaveBeenCalledWith({ sizeLevels: { mediumFromKb: 150, largeFromKb: 500, veryLargeFromKb: 2000 } });
  });

  // stored, they would name the size of every unit by a level nobody set
  it('says what is wrong with bounds that do not rise and does not save them (#2229)', () => {
    const element = create(stored);

    type(element, 'very-large-from', '400');

    expect(element.querySelector('[data-cy="admin-unit-validation-invalid"]')).not.toBeNull();
    expect(saveButton(element)?.disabled).toBe(true);
  });

  // the defaults in them would claim to be stored, and what is typed meanwhile would be set back
  it('shows no fields until the stored size levels are in (#2229)', () => {
    const answer = new Subject<UnitValidationDto | null>();
    readBackendService.getUnitValidation.mockReturnValue(answer);
    fixture = TestBed.createComponent(UnitValidationConfigComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(input(element, 'medium-from')).toBeNull();

    answer.next(stored);
    fixture.detectChanges();
    expect(input(element, 'medium-from')?.value).toBe('100');
  });

  // the defaults in the fields would claim to be stored
  it('says that the settings were not loaded and shows no fields (#2229)', () => {
    const element = create(null);

    expect(element.querySelector('[data-cy="admin-unit-validation-not-loaded"]')).not.toBeNull();
    expect(input(element, 'medium-from')).toBeNull();
  });
});
