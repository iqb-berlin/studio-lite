import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { EditUserComponent } from './edit-user.component';

describe('EditUserComponent', () => {
  let component: EditUserComponent;
  let fixture: ComponentFixture<EditUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatCheckboxModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        {
          provide: FormBuilder,
          useValue: {}
        },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component)
      .toBeTruthy();
  });
});
