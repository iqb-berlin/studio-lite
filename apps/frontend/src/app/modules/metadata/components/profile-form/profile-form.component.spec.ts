import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MDProfile, MDProfileGroup } from '@iqb/metadata';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MetadataBackendService } from '../../services/metadata-backend.service';
import { MetadataService } from '../../services/metadata.service';
import { ProfileFormComponent } from './profile-form.component';
import { IdValidator } from '../../metadata.module';

describe('ProfileFormComponent', () => {
  let component: ProfileFormComponent;
  let fixture: ComponentFixture<ProfileFormComponent>;
  let mockMetadataService: Partial<MetadataService>;
  let mockBackendService: Partial<MetadataBackendService>;

  beforeEach(async () => {
    mockMetadataService = {
      vocabulariesIdDictionary: {},
      itemProfileColumns: {} as unknown as MDProfileGroup,
      unitProfileColumns: []
    };
    mockBackendService = {
      getMetadataVocabulariesForProfile: jest.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormlyModule.forRoot({
          validators: [{ name: 'id', validation: IdValidator }]
        }),
        FormlyMaterialModule,
        TranslateModule.forRoot(),
        MatSnackBarModule,
        ProfileFormComponent
      ],
      providers: [
        { provide: MetadataService, useValue: mockMetadataService },
        { provide: MetadataBackendService, useValue: mockBackendService },
        { provide: 'SERVER_URL', useValue: 'http://localhost/' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileFormComponent);
    component = fixture.componentInstance;

    component.profile = {
      id: 'p1',
      groups: [{
        label: 'Group 1',
        entries: [{
          id: 'e1',
          type: 'text',
          label: 'Entry 1',
          parameters: { textLanguages: ['de'] }
        }]
      }]
    } as unknown as MDProfile;

    component.metadata = { profiles: [] };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize fields and model on ngOnInit', () => {
    expect(component.fields.length).toBe(1);
    expect(component.model).toEqual({});
  });

  it('should emit metadataChange when onModelChange is called', () => {
    const emitSpy = jest.spyOn(component.metadataChange, 'emit');
    component.model = { e1: { de: 'value1' } };
    component.onModelChange();
    expect(emitSpy).toHaveBeenCalled();
    expect(component.metadata.profiles![0].profileId).toBe('p1');
  });

  it('should trigger saving via timeout if triggerSaving is true', fakeAsync(() => {
    const onModelChangeSpy = jest.spyOn(component, 'onModelChange');
    // Simulate invalid stored value which triggers saving
    const entries = [{ id: 'invalid', value: 'some value' }];
    (component as unknown as { mapMetaDataEntriesToFormlyModel: (e: unknown) => void })
      .mapMetaDataEntriesToFormlyModel(entries);
    tick();
    expect(onModelChangeSpy).toHaveBeenCalled();
  }));
});
