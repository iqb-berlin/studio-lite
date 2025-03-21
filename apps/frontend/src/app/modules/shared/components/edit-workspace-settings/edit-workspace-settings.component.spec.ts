import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Component, Input } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { provideHttpClient } from '@angular/common/http';
import { VeronaModuleClass } from '../../models/verona-module.class';
import { environment } from '../../../../../environments/environment';
import { EditWorkspaceSettingsComponent } from './edit-workspace-settings.component';

describe('EditWorkspaceSettingsComponent', () => {
  let component: EditWorkspaceSettingsComponent;
  let fixture: ComponentFixture<EditWorkspaceSettingsComponent>;

  @Component({ selector: 'studio-lite-select-module', template: '', standalone: false })
  class MockSelectModuleComponent {
    @Input() modules!: { [key: string]: VeronaModuleClass };
    @Input() hidden!: boolean;
    @Input() stableOnly!: boolean;
    @Input() value!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockSelectModuleComponent
      ],
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatDialogModule,
        MatSelectModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditWorkspaceSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
