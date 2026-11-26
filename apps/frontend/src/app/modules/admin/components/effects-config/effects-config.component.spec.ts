import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject } from 'rxjs';
import { EffectsDto } from '@studio-lite-lib/api-dto';
import { BackendService as ReadBackendService } from '../../../../services/backend.service';
import { BackendService as WriteBackendService } from '../../services/backend.service';
import { EffectsConfigComponent } from './effects-config.component';

describe('EffectsConfigComponent', () => {
  let fixture: ComponentFixture<EffectsConfigComponent>;
  let readBackendService: jest.Mocked<Pick<ReadBackendService, 'getEffects'>>;
  let writeBackendService: jest.Mocked<Pick<WriteBackendService, 'setEffects'>>;

  const create = (stored: EffectsDto | null): HTMLElement => {
    readBackendService.getEffects.mockReturnValue(of(stored));
    fixture = TestBed.createComponent(EffectsConfigComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  };

  const snowfallSwitch = (element: HTMLElement): HTMLButtonElement | null => element
    .querySelector('[data-cy="admin-effects-snowfall"] button[role="switch"]');

  beforeEach(async () => {
    readBackendService = { getEffects: jest.fn() };
    writeBackendService = { setEffects: jest.fn().mockReturnValue(of(true)) };

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ReadBackendService, useValue: readBackendService },
        { provide: WriteBackendService, useValue: writeBackendService },
        { provide: MatSnackBar, useValue: { open: jest.fn() } }
      ]
    }).compileComponents();
  });

  it('shows stored snow as switched on (#2221)', () => {
    const element = create({ snowfall: true });

    expect(snowfallSwitch(element)?.getAttribute('aria-checked')).toBe('true');
  });

  it('saves the snow once switched on (#2221)', () => {
    const element = create({ snowfall: false });

    snowfallSwitch(element)?.click();
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('[data-cy="admin-effects-save-button"]')?.click();

    expect(writeBackendService.setEffects).toHaveBeenCalledWith({ snowfall: true });
  });

  // A switch moved before the stored effects are in would be set back by them.
  it('locks the switch until the stored effects are in (#2221)', () => {
    const stored = new Subject<EffectsDto | null>();
    readBackendService.getEffects.mockReturnValue(stored);
    fixture = TestBed.createComponent(EffectsConfigComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(snowfallSwitch(element)?.disabled).toBe(true);

    stored.next({ snowfall: false });
    fixture.detectChanges();
    expect(snowfallSwitch(element)?.disabled).toBe(false);
  });

  // Switched off, a switch shown after a failed load would claim that no snow falls.
  it('says that the effects were not loaded and shows no switch (#2221)', () => {
    const element = create(null);

    expect(element.querySelector('[data-cy="admin-effects-not-loaded"]')).not.toBeNull();
    expect(snowfallSwitch(element)).toBeNull();
  });
});
