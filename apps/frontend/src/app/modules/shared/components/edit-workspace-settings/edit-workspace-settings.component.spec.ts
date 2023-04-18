import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { VeronaModuleClass } from '../../models/verona-module.class';
import { environment } from '../../../../../environments/environment';
import { EditWorkspaceSettingsComponent } from './edit-workspace-settings.component';

describe('EditWorkspaceSettingsComponent', () => {
  let component: EditWorkspaceSettingsComponent;
  let fixture: ComponentFixture<EditWorkspaceSettingsComponent>;

  @Component({ selector: 'app-select-module', template: '' })
  class MockSelectModuleComponent {
    @Input() modules!: { [key: string]: VeronaModuleClass };
    @Input() hidden!: boolean;
    @Input() stableOnly!: boolean;
    @Input() value!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        EditWorkspaceSettingsComponent,
        MockSelectModuleComponent
      ],
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        HttpClientModule,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
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
