import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { UnitRichNoteTagsConfigComponent } from './unit-rich-note-tags-config.component';

describe('UnitRichNoteTagsConfigComponent', () => {
  let component: UnitRichNoteTagsConfigComponent;
  let fixture: ComponentFixture<UnitRichNoteTagsConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnitRichNoteTagsConfigComponent],
      imports: [
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitRichNoteTagsConfigComponent);
    component = fixture.componentInstance;
    component.configForm = new FormGroup({
      tagsJson: new FormControl('[]')
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate JSON correctly', () => {
    const control = component.tagsJsonControl;
    if (!control) throw new Error('Control not found');

    control.setValue('invalid json');
    expect(control.hasError('invalidJson')).toBeTruthy();

    control.setValue('[]');
    expect(control.errors).toBeNull();

    control.setValue('{"a": 1}');
    expect(control.errors).toBeNull();
  });

  it('should copy from global tags', () => {
    component.globalTagsJson = '[{"id": "global"}]';
    component.copyFromGlobal();
    expect(component.configForm.get('tagsJson')?.value).toBe('[{"id": "global"}]');
  });

  it('should emit changes when valid', () => {
    const spy = jest.spyOn(component.hasChanged, 'emit');
    component.configForm.get('tagsJson')?.setValue('[{"id": "new"}]');
    expect(spy).toHaveBeenCalledWith([{ id: 'new' }]);
  });

  it('should emit null when empty', () => {
    const spy = jest.spyOn(component.hasChanged, 'emit');
    component.configForm.get('tagsJson')?.setValue('  ');
    expect(spy).toHaveBeenCalledWith(null);
  });
});
