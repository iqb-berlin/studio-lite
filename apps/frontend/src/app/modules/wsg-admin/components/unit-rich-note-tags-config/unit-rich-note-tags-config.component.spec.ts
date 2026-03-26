import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { UnitRichNoteTagsConfigComponent } from './unit-rich-note-tags-config.component';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { BackendService } from '../../../admin/services/backend.service';

describe('UnitRichNoteTagsConfigComponent', () => {
  let component: UnitRichNoteTagsConfigComponent;
  let fixture: ComponentFixture<UnitRichNoteTagsConfigComponent>;
  let mockWsgAdminService: Partial<WsgAdminService>;
  let mockBackendService: DeepMocked<BackendService>;

  beforeEach(async () => {
    mockWsgAdminService = {
      selectedWorkspaceGroupSettings: new BehaviorSubject<WorkspaceGroupSettingsDto>({
        defaultEditor: '',
        defaultPlayer: '',
        defaultSchemer: '',
        richNoteTags: []
      })
    };
    mockBackendService = createMock<BackendService>();
    mockBackendService.getUnitRichNoteTags.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        UnitRichNoteTagsConfigComponent,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: WsgAdminService, useValue: mockWsgAdminService },
        { provide: BackendService, useValue: mockBackendService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitRichNoteTagsConfigComponent);
    component = fixture.componentInstance;
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

  it('should emit empty array when empty or whitespace', () => {
    const spy = jest.spyOn(component.hasChanged, 'emit');
    component.configForm.get('tagsJson')?.setValue('  ');
    expect(spy).toHaveBeenCalledWith([]);
  });
});
