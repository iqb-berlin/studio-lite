import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { createMock } from '@golevelup/ts-jest';
import { UnitRichNoteTagsConfigComponent } from './unit-rich-note-tags-config.component';
import { BackendService } from '../../services/backend.service';

describe('UnitRichNoteTagsConfigComponent', () => {
  let component: UnitRichNoteTagsConfigComponent;
  let fixture: ComponentFixture<UnitRichNoteTagsConfigComponent>;
  let backendServiceMock: jest.Mocked<BackendService>;

  beforeEach(async () => {
    backendServiceMock = createMock<BackendService>({
      getUnitRichNoteTags: jest.fn().mockReturnValue(of([])),
      setUnitRichNoteTags: jest.fn().mockReturnValue(of(true))
    });

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatInputModule,
        UnitRichNoteTagsConfigComponent
      ],
      providers: [
        { provide: BackendService, useValue: backendServiceMock },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitRichNoteTagsConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tags on init', () => {
    const tags = [{ id: 'test', label: [{ lang: 'de', value: 'Test' }] }];
    backendServiceMock.getUnitRichNoteTags.mockReturnValue(of(tags));
    component.loadData();
    expect(backendServiceMock.getUnitRichNoteTags).toHaveBeenCalled();
    expect(component.configForm.get('tagsJson')?.value).toContain('test');
  });

  it('should validate JSON', () => {
    const control = component.configForm.get('tagsJson');
    control?.setValue('invalid json');
    expect(control?.hasError('invalidJson')).toBeTruthy();

    control?.setValue('{"id": "test"}');
    expect(control?.errors).toBeNull();
  });

  it('should save data when form is valid', () => {
    const tags = [{ id: 'test', label: [{ lang: 'de', value: 'Test' }] }];
    component.configForm.patchValue({ tagsJson: JSON.stringify(tags) });
    component.isFormValid = true;
    component.saveData();
    expect(backendServiceMock.setUnitRichNoteTags).toHaveBeenCalledWith(tags);
  });
});
