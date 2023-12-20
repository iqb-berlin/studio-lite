import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { HttpClientModule } from '@angular/common/http';
import { EditWorkspaceGroupSettingsComponent } from './edit-workspace-group-settings.component';
import { environment } from '../../../../../environments/environment';

global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({ test: 100 })
})) as jest.Mock;

describe('EditWorkspaceGroupComponent', () => {
  let component: EditWorkspaceGroupSettingsComponent;
  let fixture: ComponentFixture<EditWorkspaceGroupSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        EditWorkspaceGroupSettingsComponent
      ],
      imports: [
        HttpClientModule,
        MatInputModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      },
      {
        provide: MAT_DIALOG_DATA,
        useValue: {}
      },
      {
        provide: FormBuilder,
        useValue: {}
      }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditWorkspaceGroupSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component)
      .toBeTruthy();
  });
});
